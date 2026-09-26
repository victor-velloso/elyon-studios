const puppeteer = require('puppeteer-core');
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
(async () => {
  for (const stealth of [false]) {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'].concat(stealth?['--disable-blink-features=AutomationControlled']:[]) });
  const p = await b.newPage(); await p.setUserAgent(UA);
  await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const c = await p.target().createCDPSession(); await c.send('Network.enable');
  const fb = [];
  c.on('Network.requestWillBeSent', e => { const u = e.request.url; if (/facebook\.com\/(tr|privacy_sandbox)/.test(u)) { let ev=''; try{ev=new URL(u).searchParams.get('ev')}catch(x){}; fb.push(e.type+' '+e.request.method+' ev='+ev+' '+(e.request.postData||'').slice(0,80)); } });
  c.on('Network.loadingFailed', e => fb.push('FAIL '+e.errorText+' '+e.blockedReason));
  await p.goto('https://www.ezeneterodrigues.com.br/quiz-familia/?reset=1', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  const wd = await p.evaluate(() => navigator.webdriver);
  await p.evaluate(async () => { const w=ms=>new Promise(r=>setTimeout(r,ms)); fbq('trackCustom','Quiz_step_t02-idade',{step_index:2}); await w(1500); fbq('trackCustom','Quiz_resultado_visto',{area:'F',situacao:'F2'}); await w(1500); fbq('trackCustom','Quiz_probeA',{area:'F'}); await w(1500); fbq('trackCustom','Quiz_step_t03-civil'); });
  await new Promise(r => setTimeout(r, 4000));
  console.log('stealth', stealth, 'webdriver', wd); fb.forEach(x => console.log('  ', x));
  await b.close();
  }
})();
