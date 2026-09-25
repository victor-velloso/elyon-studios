const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const url of ['https://escoladeintercessao.com.br/quiz-raizes/','https://escoladeintercessao.com.br/quiz-familia-restaurada/']) {
    const p = await b.newPage(); await p.setUserAgent('Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36');
    const fb = [];
    p.on('request', r => { const u = r.url(); if (/facebook\.(com|net)/.test(u)) fb.push(r.method()+' '+u.slice(0,110)); });
    p.on('requestfailed', r => { const u = r.url(); if (/facebook/.test(u)) fb.push('FAILED '+u.slice(0,80)+' '+r.failure().errorText); });
    await p.goto(url + '?utm_source=teste', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 6000));
    const st = await p.evaluate(() => { try { const s = fbq.getState(); return s.pixels.map(x => x.id); } catch (e) { return String(e); } });
    console.log(url, 'pixels:', JSON.stringify(st)); fb.forEach(x => console.log('   ', x));
    await p.close();
  }
  await b.close();
})();
