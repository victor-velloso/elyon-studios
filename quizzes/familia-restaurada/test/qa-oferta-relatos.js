const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const URL0 = process.env.QUIZ_URL || 'http://127.0.0.1:8765/familia-restaurada-quiz/index.html';
const OUT = process.env.QA_OUT || '/tmp/qa-oferta-relatos';
const P = JSON.parse(fs.readFileSync(__dirname + '/paths.json', 'utf8'));
const spec = P.find(p => p.id === 'P1-casamento');

function stitch(sectionPath, slidePaths, dest) {
  const py = `
from PIL import Image
sec = Image.open(${JSON.stringify(sectionPath)}).convert('RGB')
slides = [Image.open(p).convert('RGB') for p in ${JSON.stringify(slidePaths)}]
gap = 16
pad = 20
row_h = max(im.height for im in slides)
row_w = sum(im.width for im in slides) + gap * (len(slides) - 1)
W = max(sec.width, row_w) + pad * 2
H = pad + sec.height + gap + row_h + pad
canvas = Image.new('RGB', (W, H), (255, 255, 255))
canvas.paste(sec, (pad, pad))
x = pad
y = pad + sec.height + gap
for im in slides:
    canvas.paste(im, (x, y))
    x += im.width + gap
canvas.save(${JSON.stringify(dest)}, 'PNG')
print(canvas.size)
`;
  execFileSync('python3', ['-c', py], { stdio: 'inherit' });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const report = [];
  for (const width of [390, 1440]) {
    const height = width === 390 ? 844 : 900;
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1, isMobile: width < 700, hasTouch: width < 700 });
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.url().includes('script.google.com')) {
        return req.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      req.continue();
    });
    await page.evaluateOnNewDocument(() => { window.fbq = function(){}; });
    const q = spec.utm ? ('&' + spec.utm.replace(/^\?/, '')) : '';
    await page.goto(URL0 + (URL0.includes('?') ? '&' : '?') + 'reset=1' + q, { waitUntil: 'domcontentloaded', timeout: 60000 });
    page.on('pageerror', e => report.push(width + ' pageerror ' + e));
    for (let guard = 0; guard < 80; guard++) {
      const step = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
      if (step === 't41-pitch') break;
      const ans = spec.a[step];
      const before = step;
      if (step === 't01-abertura') await page.click(`.fr-gcard[data-v="${spec.sexo}"]`);
      else if (step.includes('loading')) { /* auto */ }
      else if (step === 't35-resultado') {
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 400) {
            window.scrollTo(0, y);
            await new Promise(r => setTimeout(r, 40));
          }
        });
        await page.click('#fr-print');
        await page.click('#fr-next');
      } else if (step === 't34-captura') {
        await page.type('#fr-nome', 'Teste Quiz');
        await page.type('#fr-zap', '31999990000');
        await page.type('#fr-email', 'teste.quiz+p1@example.com');
        await page.click('#fr-next');
      } else if (Array.isArray(ans)) {
        for (const id of ans) await page.click(`.fr-opt[data-id="${id}"]`);
        await page.click('#fr-next');
      } else if (ans) {
        await page.click(`.fr-opt[data-id="${ans}"]`);
      } else {
        await page.click('#fr-next');
      }
      await page.waitForFunction(s => document.getElementById('fr-quiz').getAttribute('data-step') !== s, { timeout: 9000 }, before);
    }
    const landed = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
    if (landed !== 't41-pitch') throw new Error('parou em ' + landed);
    await page.evaluate(() => document.querySelector('.fr-car').scrollIntoView({ block: 'center' }));
    await page.evaluate(() => {
      document.querySelectorAll('.fr-rcrop img').forEach(im => { im.loading = 'eager'; im.src = im.src; });
    });
    await page.waitForFunction(() => {
      const imgs = Array.from(document.querySelectorAll('.fr-rcrop img'));
      return imgs.length === 3 && imgs.every(im => im.complete && im.naturalWidth > 0);
    }, { timeout: 15000 });
    await new Promise(r => setTimeout(r, 400));
    const probe = await page.evaluate(() => {
      function srcBox(el) {
        const img = el.querySelector('img');
        const r = el.getBoundingClientRect();
        const ir = img.getBoundingClientRect();
        const scale = ir.width / img.naturalWidth;
        return {
          cls: el.className,
          wrap: { w: Math.round(r.width), h: Math.round(r.height) },
          img: { w: Math.round(ir.width), h: Math.round(ir.height), left: Math.round(ir.left - r.left), top: Math.round(ir.top - r.top) },
          natural: { w: img.naturalWidth, h: img.naturalHeight },
          view: scale ? {
            x: Math.round(-(ir.left - r.left) / scale),
            y: Math.round(-(ir.top - r.top) / scale),
            w: Math.round(r.width / scale),
            h: Math.round(r.height / scale)
          } : null
        };
      }
      const pag = document.querySelector('.fr-pag');
      const slides = Array.from(document.querySelectorAll('.fr-slide')).map(el => {
        const r = el.getBoundingClientRect();
        return { h: Math.round(r.height), w: Math.round(r.width) };
      });
      return {
        crops: Array.from(document.querySelectorAll('.fr-rcrop')).map(srcBox),
        pag: pag ? pag.innerText.replace(/\s+/g, ' ').trim() : '',
        pagSvg: pag ? pag.querySelectorAll('svg').length : 0,
        slides,
        trackH: Math.round((document.querySelector('.fr-car-track') || {}).offsetHeight || 0),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
      };
    });
    report.push({ width, probe });
    const dir = path.join(OUT, String(width));
    fs.mkdirSync(dir, { recursive: true });
    const slidePaths = [];
    for (let i = 0; i < 3; i++) {
      if (i) {
        await page.click('#fr-car-next');
        await new Promise(r => setTimeout(r, 500));
      }
      const handle = await page.$('.fr-slide');
      const shot = path.join(dir, 'slide-' + (i + 1) + '.png');
      // screenshot the visible slide (first in DOM is not always the visible one).
      const vis = await page.evaluate(() => {
        const track = document.querySelector('#fr-car-track');
        const slides = Array.from(track.children);
        const w = track.clientWidth || 1;
        let i = Math.round(track.scrollLeft / w);
        if (i < 0) i = 0;
        if (i >= slides.length) i = slides.length - 1;
        slides.forEach((s, n) => s.classList.toggle('fr-shot', n === i));
        return i;
      });
      const el = await page.$('.fr-slide.fr-shot');
      await el.screenshot({ path: shot });
      slidePaths.push(shot);
      report.push(width + ' visible slide index ' + vis);
    }
    await page.evaluate(() => {
      const track = document.querySelector('#fr-car-track');
      track.scrollTo({ left: 0, behavior: 'auto' });
    });
    await new Promise(r => setTimeout(r, 300));
    const full = path.join(dir, 'full.png');
    await page.screenshot({ path: full, fullPage: true });
    const box = await page.evaluate(() => {
      const a = document.querySelector('.fr-stars');
      const b = document.querySelector('.fr-price');
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const x = Math.min(ra.left, rb.left) + window.scrollX;
      const y = Math.min(ra.top, rb.top) + window.scrollY;
      const r = Math.max(ra.right, rb.right) + window.scrollX;
      const bot = Math.max(ra.bottom, rb.bottom) + window.scrollY;
      return { x: Math.max(0, Math.floor(x) - 8), y: Math.max(0, Math.floor(y) - 8), w: Math.ceil(r - x) + 16, h: Math.ceil(bot - y) + 16 };
    });
    const section = path.join(dir, 'section.png');
    execFileSync('python3', ['-c', `
from PIL import Image
im = Image.open(${JSON.stringify(full)})
b = ${JSON.stringify(box)}
im.crop((b['x'], b['y'], b['x']+b['w'], b['y']+b['h'])).save(${JSON.stringify(section)})
print('section', b)
`]);
    const dest = '/opt/cursor/artifacts/oferta-relatos-preco-' + width + '.png';
    stitch(section, slidePaths, dest);
    await page.close();
  }
  fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
