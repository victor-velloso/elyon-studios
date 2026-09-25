const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const URL0 = process.env.QUIZ_URL || 'http://127.0.0.1:8765/familia-restaurada-quiz/index.html';
const OUT = process.env.QA_OUT || '/opt/cursor/artifacts/qa-visual';
const P = JSON.parse(fs.readFileSync(__dirname + '/paths.json', 'utf8'));
const WANT = {
  'P1-casamento': 'casamento',
  'P2-filhos-doc-exemplo': 'filhos',
  'P3-oracao-nao-ora': 'oracao',
  'P4-financeiro': 'financeiro',
  'P6-homem-casado': 'homem'
};
const WIDTHS = (process.env.QA_WIDTHS || '390,1440').split(',').map(n => parseInt(n, 10));

function shotName(i, step, full) {
  if (step === 't35-resultado') return full ? '35-resultado-full.png' : '35-resultado.png';
  if (step === 't41-pitch') return full ? '41-oferta-full.png' : '41-oferta.png';
  const n = String(i).padStart(2, '0');
  return n + '-' + step + '.png';
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const notes = [];
  for (const width of WIDTHS) {
    const height = width === 390 ? 844 : 900;
    for (const spec of P) {
      const folder = WANT[spec.id];
      if (!folder) continue;
      const dir = path.join(OUT, String(width), folder);
      fs.mkdirSync(dir, { recursive: true });
      if (fs.existsSync(path.join(dir, '41-oferta-full.png')) && fs.existsSync(path.join(dir, '35-resultado-full.png'))) {
        console.log('skip', width, folder);
        continue;
      }
      let page;
      try {
      page = await browser.newPage();
      await page.setViewport({
        width, height,
        deviceScaleFactor: 1,
        isMobile: width < 700,
        hasTouch: width < 700
      });
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
      let n = 0;
      const seen = [];
      for (let guard = 0; guard < 80; guard++) {
        const step = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
        if (seen[seen.length - 1] !== step) {
          seen.push(step);
          n += 1;
          await new Promise(r => setTimeout(r, step.indexOf('loading') >= 0 ? 250 : 80));
          const file = path.join(dir, shotName(n, step, false));
          await page.screenshot({ path: file });
          const box = await page.evaluate(() => {
            const doc = document.documentElement;
            const qz = document.getElementById('fr-quiz');
            const phone = document.querySelector('.fr-phone img');
            const pageImg = document.querySelector('.fr-ar-page img');
            const cols = Array.from(document.querySelectorAll('.fr-antes .col')).map(el => Math.round(el.getBoundingClientRect().height));
            const num = document.querySelector('.fr-stepper li.done .fr-num');
            const ok = document.querySelector('.fr-num .ok');
            return {
              overflow: doc.scrollWidth > doc.clientWidth + 2 || (qz && qz.scrollWidth > qz.clientWidth + 2),
              scrollW: doc.scrollWidth, clientW: doc.clientWidth,
              phoneFit: phone ? getComputedStyle(phone).objectFit : null,
              pageFit: pageImg ? getComputedStyle(pageImg).objectFit : null,
              pagePos: pageImg ? getComputedStyle(pageImg).position : null,
              antes: cols,
              stepCheck: !!num && !ok
            };
          });
          if (box.overflow) notes.push(width + '/' + folder + '/' + step + ' overflow ' + box.scrollW + '>' + box.clientW);
          if (step === 't35-resultado' || step === 't41-pitch') {
            await page.evaluate(async () => {
              for (let y = 0; y < document.body.scrollHeight; y += 400) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 40));
              }
              window.scrollTo(0, 0);
            });
            await new Promise(r => setTimeout(r, 400));
            await page.screenshot({ path: path.join(dir, shotName(n, step, true)), fullPage: true });
            if (step === 't41-pitch') {
              if (box.phoneFit && box.phoneFit !== 'contain') notes.push(width + '/' + folder + ' phone fit ' + box.phoneFit);
              if (box.pageFit && box.pageFit !== 'contain') notes.push(width + '/' + folder + ' page fit ' + box.pageFit);
              if (box.antes.length === 2 && Math.abs(box.antes[0] - box.antes[1]) > 2) notes.push(width + '/' + folder + ' antes heights ' + box.antes.join(','));
              if (!box.stepCheck) notes.push(width + '/' + folder + ' step1 check overlap');
            }
          }
        }
        if (step === 't41-pitch') break;
        const ans = spec.a[step];
        const before = step;
        if (step === 't01-abertura') await page.click(`.fr-gcard[data-v="${spec.sexo}"]`);
        else if (step.includes('loading')) { /* auto */ }
        else if (step === 't35-resultado') {
          await page.click('#fr-next');
        } else if (step === 't34-captura') {
          await page.type('#fr-nome', spec.nome || 'Teste Quiz');
          await page.type('#fr-zap', '31999990000');
          await page.type('#fr-email', 'teste.quiz+' + spec.id + '@example.com');
          if (spec.optin) await page.click('#fr-optin');
          await page.click('#fr-next');
        } else if (Array.isArray(ans)) {
          for (const id of ans) await page.click(`.fr-opt[data-id="${id}"]`);
          await page.click('#fr-next');
        } else if (ans) {
          await page.click(`.fr-opt[data-id="${ans}"]`);
        } else if ((await page.$$('.fr-opt')).length) {
          await (await page.$('.fr-opt')).click();
        } else {
          await page.click('#fr-next');
        }
        await page.waitForFunction(s => document.getElementById('fr-quiz').getAttribute('data-step') !== s, { timeout: 12000 }, before);
      }
      console.log(width, folder, seen.length, seen.join(' '));
      } catch (err) {
        console.error('PATH FAIL', width, folder, err && err.message);
        notes.push(width + '/' + folder + ' ERROR ' + (err && err.message));
      }
      if (page) await page.close().catch(() => {});
    }
  }
  fs.writeFileSync(path.join(OUT, 'notes.json'), JSON.stringify(notes, null, 1));
  console.log('NOTES', notes.length ? notes.join(' | ') : 'none');
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });
