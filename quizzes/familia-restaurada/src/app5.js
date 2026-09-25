
/* ================= RENDER ================= */
var SYM = __SYMBOLS__;
var SYM_OF = {C:"casamento", F:"filhos", O:"constancia", D:"financeiro"};
var stage, fill, backBtn;
function kicker(t){ return "<p class='fr-kicker'>"+t+"</p>"; }
function cta(t, id){ return "<button class='fr-cta' id='"+(id||"fr-next")+"'>"+t+"</button>"; }
function relato(q, who){ return "<div class='fr-relato'><p>«"+q+"»</p><span>"+who+"</span></div>"; }

/* Defesa wp-emoji (padrao seguro do Raizes: neutraliza a funcao, SEM MutationObserver proprio) */
function neutralizarWpEmoji(){
  try{ var t = window.twemoji; if(t && typeof t.parse === "function" && !t.__frOff){ t.__frOff = 1; t.parse = function(n){ return n; }; } return !!(t && t.__frOff); }catch(e){ return false; }
}
function restaurarEmojiNativo(node){
  if(!node) return;
  try{ var imgs = node.querySelectorAll("img.emoji, img.wp-smiley, img[src*='s.w.org/images/core/emoji']");
    for(var i = imgs.length - 1; i >= 0; i--){ var img = imgs[i]; var t = img.getAttribute("alt"); if(t && img.parentNode){ img.parentNode.replaceChild(document.createTextNode(t), img); } } }catch(e){}
}

function visibleSteps(){ return STEPS.filter(isVisible); }
function cur(){ var vs = visibleSteps(); var n = S.history.length ? S.history[S.history.length-1] : vs[0].name;
  for(var i=0;i<vs.length;i++){ if(vs[i].name===n) return {st:vs[i], i:i, vs:vs}; }
  /* a tela salva deixou de valer (ex.: mudou uma resposta): volta pra ultima valida do historico */
  while(S.history.length>1){ S.history.pop(); n=S.history[S.history.length-1]; for(var j=0;j<vs.length;j++){ if(vs[j].name===n) return {st:vs[j], i:j, vs:vs}; } }
  S.history=[vs[0].name]; return {st:vs[0], i:0, vs:vs};
}
function next(){
  var c = cur(); var vs = visibleSteps(); var idx = -1;
  for(var i=0;i<vs.length;i++){ if(vs[i].name===c.st.name){ idx=i; break; } }
  var nx = vs[Math.min(idx+1, vs.length-1)];
  S.history.push(nx.name); persist(); render();
  track("step_"+nx.name, {step_index:idx+1});
}
function back(){ if(S.history.length > 1){ S.history.pop(); persist(); render(); } }

function render(){
  var c = cur(), st = c.st;
  backBtn.classList.toggle("show", c.i > 0 && ["result","pitch","loading","leadgate"].indexOf(st.type)<0);
  fill.style.transform = "scaleX(" + (c.i/(c.vs.length-1)) + ")";
  root.setAttribute("data-step", st.name);
  stage.innerHTML = "";
  var el = document.createElement("div"); stage.appendChild(el);
  window.scrollTo(0,0);
  if(st.type === "open"){ renderOpen(el); }
  else if(st.type === "q"){ renderQ(el, st); }
  else if(st.type === "multi"){ renderMulti(el, st); }
  else if(st.type === "insert"){ el.innerHTML = st.render(); bindNext(el); }
  else if(st.type === "loading"){ renderLoading(el, st); }
  else if(st.type === "leadgate"){ renderLeadGate(el); }
  else if(st.type === "result"){ renderResult(el); }
  else if(st.type === "pitch"){ renderPitch(el); }
  restaurarEmojiNativo(el);
}
function bindNext(el){ var b = el.querySelector("#fr-next"); if(b){ b.addEventListener("click", next); } }

function renderOpen(el){
  el.innerHTML = "<span class='fr-badge'>Teste gratuito · O que está acontecendo na minha casa? · 5 minutos</span>"
    + "<h1 class='fr-h1'>A sua casa tá pesada e você já não sabe mais <em>o que fazer?</em></h1>"
    + "<p class='fr-sub'>O casamento. Um filho. A oração. As contas. Quando uma coisa aperta, parece que tudo aperta junto.</p>"
    + "<p class='fr-sub' style='margin-bottom:14px'>Responda e entenda por que isso tá acontecendo na sua casa e o que fazer, na oração, pra essa situação. <span class='fr-hl'>Cada situação tem uma causa e pede uma arma espiritual diferente. No final, você vê qual é a da sua.</span></p>"
    + "<p class='fr-arrow'>↓ Responda para começar ↓</p>"
    + "<h2 class='fr-h2' style='margin:6px 0 12px'>Pra começar, você é:</h2>"
    + "<div class='fr-gender'>"
    + "<button class='fr-gcard' data-v='Mulher'><span class='big'>👩</span>Mulher</button>"
    + "<button class='fr-gcard' data-v='Homem'><span class='big'>👨</span>Homem</button>"
    + "</div>"
    + "<p class='fr-authority'>Com base no ensino da Pra. Ezenete Rodrigues, há mais de 20 anos à frente do Ministério de Intercessão da Estância Paraíso, em Sabará (MG).</p>";
  el.querySelectorAll(".fr-gcard").forEach(function(b){
    b.addEventListener("click", function(){ A.sexo = b.getAttribute("data-v"); persist(); track("start", {sexo:A.sexo}); setTimeout(next, 120); });
  });
}
function optBtn(st, op, sel){
  var t = txt(op.t); var e = txt(op.e);
  return "<button class='fr-opt"+(st.quote?" quote":"")+(sel?" sel":"")+"' data-id='"+op.id+"'>"+(e?"<span class='fr-emoji'>"+e+"</span>":"")+"<span>"+(st.quoted?"\""+t+"\"":t)+"</span></button>";
}
function renderQ(el, st){
  var opts = stepOpts(st);
  var h = "<h2 class='fr-h2'>"+txt(st.title)+"</h2>" + (st.support?"<p class='fr-support'>"+st.support+"</p>":"")
    + "<div class='fr-opts"+(st.grid?" grid":"")+(st.small?" small":"")+"'>";
  opts.forEach(function(op){ h += optBtn(st, op, false); });
  el.innerHTML = h + "</div>";
  el.querySelectorAll(".fr-opt").forEach(function(b){
    b.addEventListener("click", function(){ A[st.key] = b.getAttribute("data-id"); persist(); b.classList.add("sel"); setTimeout(next, 140); });
  });
}
function renderMulti(el, st){
  var opts = stepOpts(st), ids = opts.map(function(x){ return x.id; });
  var chosen = (A[st.key]||[]).filter(function(x){ return ids.indexOf(x)>-1; });
  var h = "<h2 class='fr-h2'>"+txt(st.title)+"</h2>" + (st.support?"<p class='fr-support'>"+st.support+"</p>":"")
    + "<div class='fr-opts"+(st.grid?" grid":"")+(st.small?" small":"")+"'>";
  opts.forEach(function(op){ h += optBtn(st, op, false); });
  el.innerHTML = h + "</div>" + cta("CONTINUAR");
  var btn = el.querySelector("#fr-next");
  function sync(){ btn.disabled = chosen.length === 0; el.querySelectorAll(".fr-opt").forEach(function(b){ b.classList.toggle("sel", chosen.indexOf(b.getAttribute("data-id")) > -1); }); }
  el.querySelectorAll(".fr-opt").forEach(function(b){
    b.addEventListener("click", function(){
      var v = b.getAttribute("data-id"), p = chosen.indexOf(v);
      if(p > -1){ chosen.splice(p,1); }
      else if(st.exclusive && v===st.exclusive){ chosen = [v]; }
      else { if(st.exclusive){ var ex = chosen.indexOf(st.exclusive); if(ex>-1) chosen.splice(ex,1); } chosen.push(v); }
      A[st.key] = chosen.slice(); persist(); sync();
    });
  });
  btn.addEventListener("click", function(){ if(chosen.length){ next(); } });
  sync();
}
function renderLoading(el, st){
  var msgs = st.msgsFn ? st.msgsFn() : st.msgs;
  el.innerHTML = "<div class='fr-loading'><p class='fr-loadpct' id='fr-pct'>0%</p><div class='fr-loadbar'><div id='fr-lb' style='transform:scaleX(0)'></div></div><p class='fr-loadtxt' id='fr-lt'></p></div>";
  var t = el.querySelector("#fr-lt"), pct = el.querySelector("#fr-pct"), bar = el.querySelector("#fr-lb");
  var p = 0, dur = st.dur||4000, step = 60, name = st.name;
  t.textContent = msgs[0][1];
  var iv = setInterval(function(){
    if(root.getAttribute("data-step")!==name){ clearInterval(iv); return; }
    p += 100/(dur/step);
    if(p >= 100){ p = 100; clearInterval(iv); setTimeout(function(){ if(root.getAttribute("data-step")===name) next(); }, 350); }
    pct.textContent = Math.round(p)+"%"; bar.style.transform = "scaleX(" + (p/100) + ")";
    var m = msgs[0][1]; msgs.forEach(function(x){ if(p>=x[0]) m = x[1]; }); t.textContent = m;
  }, step);
}
