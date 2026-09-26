const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const URL0 = process.env.QUIZ_URL || 'http://127.0.0.1:8765/familia-restaurada-quiz/index.html';
const OUT = process.env.QA_OUT || '/tmp/qa-ajustes-2';
const P = JSON.parse(fs.readFileSync(__dirname + '/paths.json', 'utf8'));
const WANT = {
  'P1-casamento': 'casamento',
  'P2-filhos-doc-exemplo': 'filhos',
  'P3-oracao-nao-ora': 'oracao',
  'P4-financeiro': 'financeiro',
  'P6-homem-casado': 'homem'
};
const KEEP = {
  't35-resultado': '35-resultado-full.png',
  't37-diferenca': '37-diferenca.png',
  't41-pitch': '41-oferta-full.png'
};

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const notes = [];
  for (const width of [390, 1440]) {
    const height = width === 390 ? 844 : 900;
    for (const spec of P) {
      const folder = WANT[spec.id];
      if (!folder) continue;
      const dir = path.join(OUT, String(width), folder);
      fs.mkdirSync(dir, { recursive: true });
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
      for (let guard = 0; guard < 80; guard++) {
        const step = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
        if (KEEP[step]) {
          if (step !== 't37-diferenca') {
            await page.evaluate(async () => {
              for (let y = 0; y < document.body.scrollHeight; y += 400) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 30));
              }
              window.scrollTo(0, 0);
            });
            await new Promise(r => setTimeout(r, 250));
          }
          await page.screenshot({ path: path.join(dir, KEEP[step]), fullPage: step !== 't37-diferenca' });
          const probe = await page.evaluate(() => {
            function box(el){ if(!el) return null; const r = el.getBoundingClientRect(); return {w:Math.round(r.width), h:Math.round(r.height)}; }
            const care = document.querySelector('.fr-care svg');
            const mark = document.querySelector('.fr-sum-second .fr-icirc, .fr-front .fr-icirc');
            const badge = document.querySelector('.fr-badge');
            const cols = Array.from(document.querySelectorAll('.fr-selosnum li')).map(el => Math.round(el.getBoundingClientRect().height));
            const labels = Array.from(document.querySelectorAll('.fr-pitch .fr-dx-label')).map(el => getComputedStyle(el).textAlign);
            const doc = document.documentElement;
            let badgeLines = null;
            if (badge) {
              const lh = parseFloat(getComputedStyle(badge).lineHeight) || 16;
              badgeLines = Math.round(badge.getBoundingClientRect().height / lh);
            }
            return {
              care: box(care), mark: box(mark),
              overflow: doc.scrollWidth > doc.clientWidth + 2,
              cols, labels, badgeLines,
              text: (document.querySelector('#fr-stage') || {}).innerText || ''
            };
          });
          if (probe.care && (probe.care.w < 14 || probe.care.h < 14)) notes.push(width+'/'+folder+' care '+JSON.stringify(probe.care));
          if (probe.mark && (probe.mark.w < 20 || probe.mark.h < 20)) notes.push(width+'/'+folder+' mark '+JSON.stringify(probe.mark));
          if (probe.overflow) notes.push(width+'/'+folder+' '+step+' overflow');
          if (step === 't41-pitch' && probe.cols.length === 3) {
            const d = Math.max.apply(null, probe.cols) - Math.min.apply(null, probe.cols);
            if (d > 2) notes.push(width+'/'+folder+' selos '+probe.cols.join(','));
          }
          if (step === 't41-pitch' && probe.labels.some(a => a !== 'center')) notes.push(width+'/'+folder+' labels '+probe.labels.join(','));
          if (step === 't01-abertura' ) {}
          if (width === 390 && probe.badgeLines && probe.badgeLines > 2 && step === 't37-diferenca') notes.push('badge lines late');
        }
        if (step === 't01-abertura' && width === 390) {
          const lines = await page.evaluate(() => {
            const b = document.querySelector('.fr-badge');
            if (!b) return null;
            const lh = parseFloat(getComputedStyle(b).lineHeight) || 14;
            return Math.round(b.getBoundingClientRect().height / lh);
          });
          if (lines > 2) notes.push('390 badge lines '+lines+' '+folder);
        }
        if (step === 't41-pitch') break;
        const ans = spec.a[step];
        const before = step;
        if (step === 't01-abertura') await page.click(`.fr-gcard[data-v="${spec.sexo}"]`);
        else if (step.includes('loading')) { /* auto */ }
        else if (step === 't35-resultado') await page.click('#fr-next');
        else if (step === 't34-captura') {
          await page.type('#fr-nome', 'Teste');
          await page.type('#fr-zap', '31999990000');
          await page.type('#fr-email', 'teste.quiz+' + spec.id + '@example.com');
          await page.click('#fr-next');
        } else if (Array.isArray(ans)) {
          for (const id of ans) await page.click(`.fr-opt[data-id="${id}"]`);
          await page.click('#fr-next');
        } else if (ans) await page.click(`.fr-opt[data-id="${ans}"]`);
        else if ((await page.$$('.fr-opt')).length) await (await page.$('.fr-opt')).click();
        else await page.click('#fr-next');
        await page.waitForFunction(s => document.getElementById('fr-quiz').getAttribute('data-step') !== s, { timeout: 12000 }, before);
      }
      console.log('ok', width, folder);
      await page.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'notes.json'), JSON.stringify(notes, null, 1));
  console.log('NOTES', notes.length ? notes.join(' | ') : 'none');
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
