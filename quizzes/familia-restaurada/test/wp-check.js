const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  for (const [name, url] of [['raizes','https://escoladeintercessao.com.br/quiz-raizes/'],['fr','https://escoladeintercessao.com.br/quiz-familia-restaurada/']]) {
    for (const vp of ['mobile','desktop']) {
      const p = await b.newPage();
      if (vp==='mobile') await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
      else await p.setViewport({ width: 1440, height: 900 });
      const tr = []; const fbevents = [];
      p.on('request', r => { const u = r.url(); if (u.includes('facebook.com/tr')) tr.push(decodeURIComponent(u).match(/[?&]ev=([^&]*)/)?.[1] + ' id=' + (u.match(/[?&]id=(\d+)/)||[])[1]); if (u.includes('fbevents.js')) fbevents.push(u.split('?')[0]); });
      await p.goto(url + '?reset=1', { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise(r => setTimeout(r, 3000));
      const info = await p.evaluate(() => {
        const q = document.getElementById('fr-quiz') || document.getElementById('rz-quiz');
        const vis = s => { const e = document.querySelector(s); if (!e) return 'absent'; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return (cs.display==='none'||cs.visibility==='hidden'||r.height===0) ? 'hidden' : `visible h=${Math.round(r.height)}`; };
        const r = q.getBoundingClientRect();
        return { fbq: typeof window.fbq, loaded: !!(window.fbq && window.fbq.loaded), header: vis('#masthead'), footer: vis('#colophon'),
          quizTop: Math.round(r.top + scrollY), quizLeft: Math.round(r.left), quizWidth: Math.round(r.width), vw: innerWidth, docW: document.documentElement.scrollWidth,
          bg: getComputedStyle(q).backgroundColor, font: getComputedStyle(q.querySelector('h1,h2')||q).fontFamily.slice(0,40) };
      });
      console.log(name, vp, JSON.stringify(info), 'fbevents:', fbevents.length, 'tr:', tr.join(' | '));
      if (vp==='mobile' || name==='fr') await p.screenshot({ path: `../screenshots/wp-${name}-${vp}-abertura.png` });
      await p.close();
    }
  }
  await b.close();
})();
