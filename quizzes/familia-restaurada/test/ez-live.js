const puppeteer = require('puppeteer-core');
const fs = require('fs');
const URL0 = 'https://www.ezeneterodrigues.com.br/quiz-familia/';
const SHOTS = __dirname + '/../screenshots';
const P = JSON.parse(fs.readFileSync(__dirname + '/paths-ez.json', 'utf8'));
const only = process.argv[2];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const out = [];
  for (const path of P) {
    if (only && path.id !== only) continue;
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.setRequestInterception(true);
    let posted = null, postResp = null, currentStep = null, postedAt = null;
    const tr = [];
    page.on('request', req => {
      const u = req.url();
      if (u.includes('facebook.com/tr')) { try { const q = new URL(u).searchParams; tr.push({ step: currentStep, id: q.get('id'), ev: q.get('ev'), method: req.method() }); } catch(e){} }
      if (u.includes('script.google.com') && req.method() === 'POST') {
        posted = req.postData(); postedAt = currentStep;
        if (path.live) { console.log('LIVE POST at', new Date().toString()); return req.continue(); }
        return req.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      req.continue();
    });
    page.on('response', r => { if (r.url().includes('script.google') ) postResp = (postResp||'') + r.status() + ' '; });
    const cdp = await page.target().createCDPSession(); await cdp.send('Network.enable');
    const trc = [];
    cdp.on('Network.requestWillBeSent', e => { const u = e.request.url; if (/facebook\.com\/tr/.test(u)) { let q; try { q = new URL(u).searchParams; } catch(x) { return; } trc.push({ step: currentStep, id: q.get('id'), ev: q.get('ev'), cd: q.get('cd[step]') || '', t: new Date().toTimeString().slice(0,8) }); } });
    const url = URL0 + '?reset=1' + (path.utm ? '&' + path.utm : '');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('#fr-quiz', { timeout: 30000 });
    const pixInfo = await page.evaluate(() => ({ fbq: typeof fbq, ver: window.fbq && fbq.version, pys: window.pysOptions ? JSON.stringify(window.pysOptions.facebook && window.pysOptions.facebook.pixelIds) : null }));
    const visited = [], texts = {}, errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    for (let guard = 0; guard < 80; guard++) {
      const step = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
      currentStep = step; if (visited[visited.length-1] !== step) visited.push(step);
      await sleep(150);
      texts[step] = await page.$eval('#fr-stage', el => el.innerText);
      if (path.shots.includes(step)) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await sleep(step === 't35-resultado' ? 1500 : 600);
        await page.screenshot({ path: `${SHOTS}/ez-mobile-${path.id}-${step}.png` });
        if (step === 't35-resultado' || step === 't41-pitch') { await page.evaluate(() => document.querySelectorAll('.fr-dx-sec').forEach(e => e.classList.add('in'))); await sleep(1200); const q = await page.$('#fr-quiz'); await q.screenshot({ path: `${SHOTS}/ez-mobile-${path.id}-${step}-full.png` }); }
      }
      if (step === 't41-pitch') break;
      const ans = path.a[step], before = step;
      if (step === 't01-abertura') await page.click(`.fr-gcard[data-v="${path.sexo}"]`);
      else if (step.includes('loading')) {}
      else if (step === 't35-resultado') {
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 250) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } });
        await sleep(1500);
        await page.$eval('#fr-next', b => b.scrollIntoView({ block: 'center' })); await sleep(300);
        await page.click('#fr-next'); await sleep(1500);
      } else if (step === 't34-captura') {
        await page.type('#fr-nome', path.nome); await page.type('#fr-zap', '31999990000'); await page.type('#fr-email', 'teste.quiz@example.com');
        await page.click('#fr-next');
      } else if (Array.isArray(ans)) { for (const id of ans) await page.click(`.fr-opt[data-id="${id}"]`); await page.click('#fr-next'); }
      else if (ans) { const b = await page.$(`.fr-opt[data-id="${ans}"]`); if (!b) { errs.push(step + ' missing ' + ans); break; } await b.click(); }
      else if ((await page.$$('.fr-opt')).length) { errs.push(step + ' no answer'); await (await page.$('.fr-opt')).click(); }
      else await page.click('#fr-next');
      await page.waitForFunction(s => document.getElementById('fr-quiz').getAttribute('data-step') !== s, { timeout: 15000 }, before).catch(() => errs.push('stuck ' + before));
    }
    await sleep(2500);
    const info = await page.evaluate(() => ({ href: (document.querySelector('#fr-buy')||{}).href, href2: (document.querySelector('#fr-buy2')||{}).href, score: window.__FR && window.__FR.computeScore(), fbqLog: window.__fbqLog }));
    let checkout = null;
    if (path.live && info.href) {
      const cp = await ctx.newPage(); await cp.setUserAgent(UA);
      await cp.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      const resp = await cp.goto(info.href, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => null);
      await sleep(3000);
      checkout = { status: resp && resp.status(), finalUrl: cp.url(), title: await cp.title() };
      await cp.screenshot({ path: `${SHOTS}/ez-mobile-checkout.png` });
    }
    const r = { id: path.id, pixInfo, visited: visited.length, steps: visited, errs, posted: posted && JSON.parse(posted), postedAt, postResp, tr, trc, info, checkout, t35: texts['t35-resultado'], t02: texts['t02-idade'] };
    out.push(r);
    console.log(JSON.stringify({ id: r.id, pixInfo, visited: r.visited, errs, postedAt, postResp, score: info.score && [info.score.main, info.score.sit], href: info.href, checkout, fbq: (info.fbqLog||[]).filter(c => c[0] !== 'init').map(c => c.join(':')), tr: trc.filter(t => !/Quiz_step_/.test(t.ev)).map(t => `${t.id}:${t.ev}@${t.step}`), trSteps: trc.filter(t => /Quiz_step_/.test(t.ev)).length }, null, 1));
    await ctx.close();
  }
  fs.writeFileSync(__dirname + '/results-ez.json', JSON.stringify(out, null, 1));
  await browser.close();
})();
