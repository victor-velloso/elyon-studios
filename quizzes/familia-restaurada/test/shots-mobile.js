const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const URL0 = process.env.QUIZ_URL || 'http://127.0.0.1:8765/familia-restaurada-quiz/index.html';
const OUT = process.env.SHOTS || '/opt/cursor/artifacts/familia-restaurada';
const P = JSON.parse(fs.readFileSync(__dirname + '/paths.json', 'utf8'));
const WANT = ['P1-casamento', 'P2-filhos-doc-exemplo', 'P3-oracao-nao-ora', 'P4-financeiro'];

function words(s){ return (s || '').trim().split(/\s+/).filter(Boolean).length; }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const report = [];
  for (const spec of P) {
    if (!WANT.includes(spec.id)) continue;
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.setRequestInterception(true);
    page.on('request', req => {
      if (req.url().includes('script.google.com')) {
        return req.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      req.continue();
    });
    await page.evaluateOnNewDocument(() => { window.__fbqCalls = []; window.fbq = function(){ window.__fbqCalls.push(Array.from(arguments)); }; });
    const q = spec.utm ? ('&' + spec.utm) : '';
    await page.goto(URL0 + (URL0.includes('?') ? '&' : '?') + 'reset=1' + q, { waitUntil: 'networkidle0' });
    for (let guard = 0; guard < 80; guard++) {
      const step = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
      await new Promise(r => setTimeout(r, 80));
      if (step === 't41-pitch') break;
      const before = step;
      if (step === 't01-abertura') await page.click(`.fr-gcard[data-v="${spec.sexo}"]`);
      else if (step.includes('loading')) { /* auto */ }
      else if (step === 't35-resultado') {
        await page.evaluate(async () => {
          document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
          for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
          window.scrollTo(0, 0);
        });
        await new Promise(r => setTimeout(r, 400));
        const info = await page.evaluate(() => {
          const stage = document.querySelector('#fr-stage');
          return {
            words: (stage.innerText || '').trim().split(/\s+/).filter(Boolean).length,
            scrollW: document.documentElement.scrollWidth,
            clientW: document.documentElement.clientWidth
          };
        });
        const file = path.join(OUT, spec.id + '-resultado.png');
        await page.screenshot({ path: file, fullPage: true });
        report.push({ id: spec.id, tela: 'resultado', words: info.words, overflow: info.scrollW > info.clientW, scrollW: info.scrollW, clientW: info.clientW, file });
        await page.click('#fr-next');
      } else if (step === 't34-captura') {
        await page.type('#fr-nome', spec.nome || 'Teste Quiz');
        await page.type('#fr-zap', '31999990000');
        await page.type('#fr-email', 'shots+' + spec.id + '@example.com');
        await page.click('#fr-next');
      } else {
        const ans = spec.a[step];
        if (Array.isArray(ans)) { for (const id of ans) await page.click(`.fr-opt[data-id="${id}"]`); await page.click('#fr-next'); }
        else if (ans) await page.click(`.fr-opt[data-id="${ans}"]`);
        else await page.click('#fr-next');
      }
      await page.waitForFunction(s => document.getElementById('fr-quiz').getAttribute('data-step') !== s, { timeout: 12000 }, before);
    }
    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
      for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
    });
    await new Promise(r => setTimeout(r, 500));
    const offer = await page.evaluate(() => {
      const stage = document.querySelector('#fr-stage');
      return {
        words: (stage.innerText || '').trim().split(/\s+/).filter(Boolean).length,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        href: (document.querySelector('#fr-buy') || {}).href || ''
      };
    });
    const file = path.join(OUT, spec.id + '-oferta.png');
    await page.screenshot({ path: file, fullPage: true });
    report.push({ id: spec.id, tela: 'oferta', words: offer.words, overflow: offer.scrollW > offer.clientW, scrollW: offer.scrollW, clientW: offer.clientW, href: offer.href, file });
    console.log(spec.id, 'resultado/oferta gravados', 'words-offer', offer.words, 'overflow', offer.scrollW > offer.clientW);
    await page.close();
  }
  fs.writeFileSync(path.join(OUT, 'wordcount.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
