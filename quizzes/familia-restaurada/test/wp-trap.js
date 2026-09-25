const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.evaluateOnNewDocument(() => {
    const log = (v) => { if (String(v).includes('%3A%3A') || String(v).includes('::')) console.log('TRAP ' + String(v).slice(0,160) + '\n' + new Error().stack.split('\n').slice(2,7).join('\n')); };
    const sa = Element.prototype.setAttribute; Element.prototype.setAttribute = function(n, v){ if (n==='href') log(v); return sa.apply(this, arguments); };
    const d = Object.getOwnPropertyDescriptor(HTMLAnchorElement.prototype, 'href'); Object.defineProperty(HTMLAnchorElement.prototype, 'href', { get: d.get, set(v){ log(v); d.set.call(this, v); }, configurable: true });
  });
  p.on('console', m => { if (m.text().startsWith('TRAP')) console.log(m.text()); });
  await p.goto('https://escoladeintercessao.com.br/quiz-familia-restaurada/?reset=1&utm_source=teste&utm_medium=teste&utm_campaign=teste&utm_content=teste&utm_term=teste&fbclid=teste', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  const out = await p.evaluate(async () => {
    const a = document.createElement('a'); a.href = 'https://chk.eduzz.com/2a5cwqts?utm_content=teste'; a.textContent='x'; document.getElementById('fr-quiz').appendChild(a);
    await new Promise(r => setTimeout(r, 3000));
    return { injected: a.getAttribute('href'), cookies: document.cookie.split(';').filter(c=>/utm|pys|content/i.test(c)).map(c=>c.trim().slice(0,90)), stored: localStorage.getItem(Object.keys(localStorage).find(k=>/fr/i.test(k))||'')?.slice(0,300), keys: Object.keys(localStorage) };
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
