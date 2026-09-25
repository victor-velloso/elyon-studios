const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const u of ['quiz-raizes','quiz-familia-restaurada']) { const p = await b.newPage(); let hit = false; p.on('request', r => { if (r.url().includes('utmify')) hit = true; });
    await p.goto(`https://escoladeintercessao.com.br/${u}/?utm_content=teste`, { waitUntil: 'networkidle2' }); console.log(u, 'utmify loaded:', hit); await p.close(); }
  await b.close(); })();
