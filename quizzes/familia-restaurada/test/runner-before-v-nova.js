const puppeteer = require('puppeteer-core');
const fs = require('fs');
const URL0 = process.env.QUIZ_URL || 'http://localhost:8765/index.html';
const LIVE = process.env.LIVE_LEAD === '1';
const SHOTS = process.env.SHOTS || '';
const P = JSON.parse(fs.readFileSync(__dirname + '/paths.json', 'utf8'));
const only = process.argv[2];
(async () => {
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const results = [];
  for (const path of P) {
    if (only && path.id !== only) continue;
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.setRequestInterception(true);
    let posted = null, postedAtStep = null;
    page.on('request', req => {
      if (req.url().includes('script.google.com')) {
        posted = req.postData();
        postedAtStep = currentStep;
        if (LIVE) return req.continue();
        return req.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
      }
      req.continue();
    });
    let currentStep = null;
    const q = path.utm ? ('?' + path.utm) : '';
    await page.goto(URL0 + (URL0.includes('?') ? '&' : '?') + 'reset=1' + (q ? '&' + q.slice(1) : ''), { waitUntil: 'networkidle0' });
    const visited = [], texts = {}, errs = [], opts = {};
    page.on('pageerror', e => errs.push(String(e)));
    for (let guard = 0; guard < 80; guard++) {
      const step = await page.$eval('#fr-quiz', el => el.getAttribute('data-step'));
      currentStep = step;
      if (visited[visited.length - 1] !== step) visited.push(step);
      await new Promise(r => setTimeout(r, 120));
      texts[step] = await page.$eval('#fr-stage', el => el.innerText);
      opts[step] = await page.$$eval('.fr-opt', els => els.map(b => b.getAttribute('data-id')));
      if (SHOTS && path.shots && path.shots.includes(step)) {
        await page.screenshot({ path: `${SHOTS}/${path.id}-${step}.png` });
        if (step === 't35-resultado' || step === 't41-pitch') { await new Promise(r=>setTimeout(r,400)); await page.screenshot({ path: `${SHOTS}/${path.id}-${step}-full.png`, fullPage: true }); }
      }
      if (step === 't41-pitch') break;
      if (path.absentOpt && path.absentOpt[step] && await page.$(`.fr-opt[data-id="${path.absentOpt[step]}"]`)) errs.push(`${step}: option ${path.absentOpt[step]} should be hidden`);
      const ans = path.a[step];
      const before = step;
      if (step === 't01-abertura') await page.click(`.fr-gcard[data-v="${path.sexo}"]`);
      else if (step.includes('loading')) { /* auto */ }
      else if (step === 't34-captura') {
        await page.type('#fr-nome', path.nome || 'Teste Quiz');
        await page.type('#fr-zap', '31999990000');
        await page.type('#fr-email', 'teste.quiz+' + path.id + '@example.com');
        if (path.optin) await page.click('#fr-optin');
        await page.click('#fr-next');
      } else {
        const multi = await page.$('.fr-opts') && await page.$('#fr-next') && (await page.$$('.fr-opt')).length > 0;
        if (Array.isArray(ans)) { for (const id of ans) { const b = await page.$(`.fr-opt[data-id="${id}"]`); if (!b) errs.push(`${step}: option ${id} not shown`); else await b.click(); } await page.click('#fr-next'); }
        else if (ans) { const b = await page.$(`.fr-opt[data-id="${ans}"]`); if (!b) { errs.push(`${step}: option ${ans} not shown`); break; } await b.click(); }
        else if ((await page.$$('.fr-opt')).length) { errs.push(`${step}: no answer in spec`); await (await page.$('.fr-opt')).click(); }
        else await page.click('#fr-next');
      }
      await page.waitForFunction(s => document.getElementById('fr-quiz').getAttribute('data-step') !== s, { timeout: 9000 }, before).catch(() => errs.push('stuck at ' + before));
    }
    const pitch = await page.evaluate(() => ({
      href: (document.querySelector('#fr-buy') || {}).href, href2: (document.querySelector('#fr-buy2') || {}).href,
      btn: (document.querySelector('#fr-buy') || {}).textContent, score: window.__FR.computeScore()
    }));
    if (SHOTS && path.shots) {
      if (path.shots.includes('t41-pitch-price')) { await page.evaluate(() => document.querySelector('.fr-price').scrollIntoView({block:'center'})); await new Promise(r=>setTimeout(r,500)); await page.screenshot({ path: `${SHOTS}/${path.id}-t41-pitch-price.png` }); }
    }
    const allText = Object.values(texts).join('\n');
    const r = { id: path.id, visited: visited.length, steps: visited, errs, pitch, posted: posted ? JSON.parse(posted) : null, postedAtStep, texts };
    // assertions
    const fail = [];
    const e = path.expect;
    if (e.screens && visited.length !== e.screens) fail.push(`screens ${visited.length} != ${e.screens}`);
    if (e.area && pitch.score.main !== e.area) fail.push(`area ${pitch.score.main} != ${e.area}`);
    if (e.sit && pitch.score.sit !== e.sit) fail.push(`sit ${pitch.score.sit} != ${e.sit}`);
    if (e.second !== undefined && pitch.score.second !== e.second) fail.push(`second ${pitch.score.second} != ${e.second}`);
    if (e.score) for (const k in e.score) if (pitch.score.score[k] !== e.score[k]) fail.push(`score ${k} ${pitch.score.score[k]} != ${e.score[k]}`);
    if (e.checkout && !(pitch.href || '').startsWith(e.checkout)) fail.push(`checkout ${pitch.href}`);
    if (e.checkout && !(pitch.href2 || '').startsWith(e.checkout)) fail.push(`checkout2 ${pitch.href2}`);
    for (const s of (e.present || [])) if (!visited.includes(s)) fail.push(`missing ${s}`);
    for (const s of (e.absent || [])) if (visited.includes(s)) fail.push(`should skip ${s}`);
    for (const t of (e.contains || [])) if (!allText.includes(t)) fail.push(`text missing: ${t}`);
    for (const t of (e.notContains || [])) { const hit = Object.entries(texts).find(([k, v]) => !k.startsWith('t18') && !k.startsWith('t08') && v.includes(t)); if (hit) fail.push(`forbidden text "${t}" on ${hit[0]}`); }
    if (visited.indexOf('t34-captura') < 0 || visited.indexOf('t34-captura') > visited.indexOf('t35-resultado')) fail.push('capture not before result');
    if (!posted) fail.push('no lead POST'); else if (postedAtStep !== 't34-captura') fail.push('lead posted at ' + postedAtStep);
    for (const st in (e.optsExact || {})) if (JSON.stringify(opts[st]) !== JSON.stringify(e.optsExact[st])) fail.push(`${st} options ${JSON.stringify(opts[st])} != ${JSON.stringify(e.optsExact[st])}`);
    if (posted) { const pl = JSON.parse(posted); const need = ['nome','whatsapp','email','resultado','segunda_area','situacao','oracao','objecao','tempo','aceite','utms','score','respostas','ts','fonte'];
      for (const k of need) if (!(k in pl)) fail.push('payload missing ' + k);
      const AN = {C:'Casamento',F:'Filhos',O:'Oração',D:'Financeiro'};
      if (pl.resultado !== AN[pitch.score.main]) fail.push('payload resultado ' + pl.resultado);
      if (pl.fonte !== 'quiz-familia-restaurada') fail.push('payload fonte ' + pl.fonte);
      if (typeof pl.aceite !== 'boolean') fail.push('payload aceite not boolean');
      if (!pl.situacao) fail.push('payload situacao empty');
      if (e.utmPayload) for (const k in e.utmPayload) if (pl.utms[k] !== e.utmPayload[k]) fail.push('payload utm ' + k + '=' + pl.utms[k]); }
    r.opts = opts;
    if (e.utm && !(pitch.href || '').includes(e.utm)) fail.push('utm not passed: ' + pitch.href);
    if (errs.length) fail.push(...errs);
    r.fail = fail; r.pass = fail.length === 0;
    results.push(r);
    console.log(`${r.pass ? 'PASS' : 'FAIL'} ${path.id} screens=${visited.length} area=${pitch.score.main} sit=${pitch.score.sit} second=${pitch.score.second} score=${JSON.stringify(pitch.score.score)} checkout=${pitch.href}`);
    if (!r.pass) console.log('   ', fail.join(' | '));
    await page.close();
  }
  fs.writeFileSync(__dirname + '/results.json', JSON.stringify(results, null, 1));
  await browser.close();
})();
