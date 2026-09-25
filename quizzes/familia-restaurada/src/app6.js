function lcf(s){ s=String(s||"").replace(/\.$/,""); return /^Deus/.test(s) ? s : s.charAt(0).toLowerCase()+s.slice(1); }
function respostasLegiveis(){
  var o = {sexo:A.sexo||""};
  STEPS.forEach(function(st){ if(!st.key) return; var v=V(st.key); if(v==null) return; o[st.key] = Array.isArray(v) ? Ls(st.key) : L(st.key); });
  return o;
}
function renderLeadGate(el){
  el.innerHTML = "<p class='fr-rootemoji'>🏠</p>"
    + "<h2 class='fr-h2'>Pronto. Já dá pra ver o que está acontecendo na sua casa, <em>e o que fazer.</em></h2>"
    + "<p class='fr-sub'>O resultado abre aqui na tela, agora. Só me diz quem é você.</p>"
    + "<input class='fr-input' id='fr-nome' type='text' placeholder='Primeiro nome' autocomplete='given-name'>"
    + "<input class='fr-input' id='fr-zap' type='tel' inputmode='tel' placeholder='WhatsApp (com DDD)' autocomplete='tel'>"
    + "<input class='fr-input' id='fr-email' type='email' inputmode='email' placeholder='E-mail' autocomplete='email'>"
    + "<label class='fr-optin'><input type='checkbox' id='fr-optin'><span>Aceito receber mensagens da equipe da Pra. Ezenete no WhatsApp e no e-mail.</span></label>"
    + cta("VER O QUE ESTÁ ACONTECENDO NA MINHA CASA")
    + "<p class='fr-note'>🔒 Seus dados ficam com a equipe da Pra. Ezenete Rodrigues. Sem spam. Pra sair, é só responder SAIR no WhatsApp.</p>";
  el.querySelector("#fr-next").addEventListener("click", function(){
    var nome = el.querySelector("#fr-nome"), zap = el.querySelector("#fr-zap"), email = el.querySelector("#fr-email");
    var ok = true; [nome, zap, email].forEach(function(f){ f.classList.remove("err"); });
    if(!nome.value.trim()){ nome.classList.add("err"); ok = false; }
    var digits = zap.value.replace(/\D/g,""); if(digits.length < 10){ zap.classList.add("err"); ok = false; }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())){ email.classList.add("err"); ok = false; }
    if(!ok) return;
    S.lead = { nome:nome.value.trim().split(/\s+/)[0], nome_completo:nome.value.trim(), whatsapp:digits, email:email.value.trim(), optin:el.querySelector("#fr-optin").checked };
    persist();
    var r = computeScore();
    /* Mapa de campos = integracao/README-leads-planilha.md (Theo), colunas A-T da planilha "Leads Quiz Família Restaurada" */
    var payload = {
      nome:S.lead.nome_completo, whatsapp:S.lead.whatsapp, email:S.lead.email,
      resultado:AREA_NOME[r.main], segunda_area:r.second?AREA_NOME[r.second]:"",
      situacao:sitTitulo(r.sit), oracao:L("oracao")||"", objecao:L("objecao")||"", tempo:L("tempo")||"",
      aceite:!!S.lead.optin,
      utms:leadUtms(),
      score:r.score, respostas:respostasLegiveis(),
      ts:new Date().toISOString(), fonte:CFG.fonte,
      /* extras (ignorados pelas colunas, úteis no payload_json) */
      situacao_id:r.sit, checkout:CFG.checkout[r.main]
    };
    try{
      if(CFG.leadWebhookUrl){ fetch(CFG.leadWebhookUrl, {method:"POST", mode:"no-cors", headers:{"Content-Type":"text/plain"}, body:JSON.stringify(payload), keepalive:true}); }
    }catch(e){}
    track("lead", {area:r.main, area2:r.second||"", situacao:r.sit});
    next();
  });
}
function tx(v){ return MX(txt(v)); }
function imgCode(id){ if(id==="D1") return "$1"; if(id==="D16") return "$16"; if(id==="D11") return "$11"; return id; }
function cfgImg(key){ var m = CFG.images || {}; return m[key] || ""; }
var ICONS = {
  door:"<path d='M5 21V5a1 1 0 0 1 1-1h12v18'/><path d='M3 21h18'/><circle cx='15' cy='12' r='.8' fill='currentColor'/>",
  bubble:"<path d='M5 16.5A7 7 0 1 1 12 20H6l-2 2z'/>",
  home:"<path d='M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z'/>",
  bed:"<path d='M3 18V11a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7'/><path d='M3 14h18M3 18h18'/><path d='M7 9V7h5'/>",
  clock:"<circle cx='12' cy='12' r='8'/><path d='M12 8v4l3 2'/>",
  phone:"<rect x='7' y='3' width='10' height='18' rx='2'/><path d='M11 18h2'/>",
  camera:"<path d='M4 8h3l2-2h6l2 2h3v11H4z'/><circle cx='12' cy='13' r='3'/>",
  flame:"<path d='M12 3s5 4 5 8a5 5 0 0 1-10 0c0-2 1.2-3.2 2.2-4.2 0 2 1.2 2.8 2.2 2.8C11.4 7 12 5 12 3z'/>",
  book:"<path d='M5 4.5h11a2 2 0 0 1 2 2V20H7a2 2 0 0 0-2 2z'/><path d='M5 4.5v16'/>",
  church:"<path d='M12 3v3M10 6h4'/><path d='M6 21V11l6-4 6 4v10'/><path d='M10 21v-4h4v4'/>",
  help:"<circle cx='12' cy='12' r='8'/><path d='M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.4-1.2.9-1.2 1.8'/><path d='M12 17h.01'/>",
  shield:"<path d='M12 3 5 6v6c0 4 2.8 6.4 7 8 4.2-1.6 7-4 7-8V6z'/>",
  globe:"<circle cx='12' cy='12' r='8'/><path d='M3 12h18'/><path d='M12 4c2.5 2.4 2.5 13.6 0 16-2.5-2.4-2.5-13.6 0-16z'/>",
  wall:"<path d='M4 5h16v14H4z'/><path d='M4 9.5h16M4 14h16M8 5v4.5M12 9.5V14M16 14v5'/>",
  battery:"<rect x='2' y='7' width='18' height='10' rx='2'/><path d='M22 10v4M6 12h.01'/>",
  clipboard:"<rect x='6' y='4' width='12' height='16' rx='2'/><path d='M9 4.5h6V7H9zM9 11h6M9 15h4'/>",
  brain:"<path d='M9 7a3 3 0 0 0-3 3 2.5 2.5 0 0 0 0 5A3 3 0 0 0 9 18h1V7z'/><path d='M15 7a3 3 0 0 1 3 3 2.5 2.5 0 0 1 0 5 3 3 0 0 1-3 3h-1V7z'/><path d='M12 7v11'/>",
  eyeoff:"<path d='M4 4l16 16'/><path d='M9.5 6.3A9 9 0 0 1 12 6c5 0 8 6 8 6a16 16 0 0 1-2.4 3'/><path d='M6 6.8C4.2 8.2 3 10 3 12s4 6 9 6c1.2 0 2.3-.3 3.3-.7'/>",
  shh:"<path d='M9 10a3 3 0 1 1 6 0v3H9z'/><path d='M12 16v2M9.5 18h5'/>",
  box:"<path d='M3 8l9-4 9 4-9 4z'/><path d='M3 8v8l9 4 9-4V8'/><path d='M12 12v8'/>",
  hands:"<path d='M8 12V6.5a1.4 1.4 0 0 1 2.8 0V12'/><path d='M10.8 11V5.2a1.4 1.4 0 0 1 2.8 0V12'/><path d='M13.6 11V8a1.4 1.4 0 0 1 2.8 0v6.2c0 3-1.8 5-4.8 5H9.2A3.6 3.6 0 0 1 5.6 15v-2.2a1.4 1.4 0 0 1 2.8 0'/>",
  key:"<circle cx='8' cy='14' r='3'/><path d='M10.8 14H20l-1.6 1.8L20 17.6'/>",
  sprout:"<path d='M12 21V11'/><path d='M12 11c0-4 3-6 7-6-1 4-3 6-7 6z'/><path d='M12 14c0-3-2.4-5-6-5 1 3 2.8 5 6 5z'/>",
  sword:"<path d='M14.5 4 20 9.5'/><path d='M13 6l5 5-7.5 7.5H6V14z'/><path d='M4 20l4-4'/>",
  lock:"<rect x='5' y='11' width='14' height='9' rx='2'/><path d='M8 11V8a4 4 0 0 1 8 0v3'/>",
  check:"<path d='M5 12.5 9.5 17 19 7'/>",
  cloud:"<path d='M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.6 1.6A3.5 3.5 0 0 0 7 18z'/>",
  pin:"<path d='M12 17v4'/><path d='M8 8l2-4h4l2 4v5l-2 2h-4l-2-2z'/>",
  mail:"<rect x='3' y='5' width='18' height='14' rx='2'/><path d='M4 7l8 6 8-6'/>",
  card:"<rect x='3' y='6' width='18' height='12' rx='2'/><path d='M3 10h18'/>",
  coffee:"<path d='M5 8h10v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z'/><path d='M15 9h2a2 2 0 0 1 0 4h-2'/><path d='M8 20h6'/>",
  heart:"<path d='M12 19s-6.5-4-6.5-8A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 6.5 3c0 4-6.5 8-6.5 8z'/>",
  music:"<path d='M9 17.5a2.4 2.4 0 1 1-1.6-2.3V6l9-2v8'/><circle cx='16.4' cy='14.2' r='2.1'/>",
  list:"<path d='M9 7h11M9 12h11M9 17h11'/><path d='M4 7h.01M4 12h.01M4 17h.01'/>",
  pen:"<path d='M4 20l3.2-.8L18.5 8l-2.8-2.8L4.4 16.5z'/><path d='M13.2 6.6l2.8 2.8'/>",
  search:"<circle cx='11' cy='11' r='6'/><path d='M20 20l-3.5-3.5'/>",
  megaphone:"<path d='M4 10v4l9 3.5V6.5z'/><path d='M13 9.5a3 3 0 0 1 0 5'/><path d='M7 14.2V17a2 2 0 0 0 2 2'/>",
  refresh:"<path d='M20 12a8 8 0 1 1-2-5.3'/><path d='M20 4v5h-5'/>",
  moon:"<path d='M20 14.5A7.5 7.5 0 1 1 9.5 4 6 6 0 0 0 20 14.5z'/>",
  hand:"<path d='M8 11V6.2a1.3 1.3 0 0 1 2.6 0V11'/><path d='M10.6 10V5a1.3 1.3 0 0 1 2.6 0v6'/><path d='M13.2 10.5V7.2a1.3 1.3 0 0 1 2.6 0V14c0 3.2-1.7 5.5-5 5.5H9A3.5 3.5 0 0 1 5.5 16v-3.2a1.3 1.3 0 0 1 2.6 0'/>",
  alert:"<path d='M12 4 21 20H3z'/><path d='M12 10v4M12 17h.01'/>",
  sun:"<circle cx='12' cy='12' r='3.5'/><path d='M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18'/>",
  compass:"<circle cx='12' cy='12' r='8'/><path d='m14.8 9.2-1.6 4.2-4.2 1.6 1.6-4.2z'/>",
  user:"<circle cx='12' cy='8' r='3'/><path d='M6 19c1.2-2.6 3-4 6-4s4.8 1.4 6 4'/>",
  ear:"<path d='M7 10a5 5 0 0 1 10 0c0 3-2 3.5-2 6'/><path d='M10 16.5a2.5 2.5 0 0 0 2.5 2.5'/>",
  tear:"<path d='M7 4h8l3 3v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z'/><path d='M15 4v3h3M8 14c1.5 1 2 2 4 1.2'/>",
  cycle:"<path d='M4 12a8 8 0 0 1 13-6l1.5-1.5'/><path d='M16 3h4v4'/><path d='M20 12a8 8 0 0 1-13 6l-1.5 1.5'/><path d='M8 21H4v-4'/>",
  pix:"<path d='M8.2 8.2 12 4.4l3.8 3.8L12 12z'/><path d='M8.2 15.8 12 19.6l3.8-3.8L12 12z'/>"
};
function ico(name, px){
  var p = ICONS[name] || ICONS.check;
  var s = px || 22;
  return "<svg class='fr-ico' viewBox='0 0 24 24' width='"+s+"' height='"+s+"' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>"+p+"</svg>";
}
function icoCirc(name){ return "<span class='fr-icirc'>"+ico(name, 20)+"</span>"; }
function dropNode(n){ if(n){ if(n.parentNode) n.parentNode.removeChild(n); } }
function bindMedia(scope){
  var imgs = scope.querySelectorAll("img.fr-fall, img.fr-symimg");
  Array.prototype.forEach.call(imgs, function(img){
    img.addEventListener("error", function(){
      var fb = img.getAttribute("data-fb");
      if(fb){ img.removeAttribute("data-fb"); img.src = fb; return; }
      var mode = img.getAttribute("data-drop") || "box";
      if(mode==="sym"){
        var area = img.getAttribute("data-area");
        var host = img.parentNode;
        if(host){ if(SYM[SYM_OF[area]]) host.innerHTML = SYM[SYM_OF[area]]; }
        return;
      }
      if(mode==="img"){ dropNode(img); return; }
      if(mode==="desk"){
        var desk = img.parentNode;
        while(desk){ if(desk.classList){ if(desk.classList.contains("fr-desk")) break; } desk = desk.parentNode; }
        dropNode(desk);
        return;
      }
      dropNode(img.parentNode);
    });
  });
}
function symHtml(area, px){
  var key = {C:"simbolo_C", F:"simbolo_F", O:"simbolo_O", D:"simbolo_D"}[area];
  var url = cfgImg(key);
  var wh = px || 56;
  var inline = SYM[SYM_OF[area]] || "";
  if(!url) return "<span class='fr-sym' style='width:"+wh+"px;height:"+wh+"px'>"+inline+"</span>";
  return "<span class='fr-sym' style='width:"+wh+"px;height:"+wh+"px'><img class='fr-symimg' data-drop='sym' data-area='"+area+"' alt='' width='"+wh+"' height='"+wh+"' src='"+esc(url)+"'></span>";
}
function sceneHtml(sitId){
  var primary = cfgImg(imgCode(sitId));
  var areaCh = sitId.charAt(0)==="D" ? "$" : sitId.charAt(0);
  var fb = cfgImg("area_"+areaCh);
  if(!primary) primary = fb;
  if(!primary) return "";
  var extra = "";
  if(fb){ if(fb!==primary) extra = " data-fb='"+esc(fb)+"'"; }
  return "<div class='fr-ar'><img class='fr-fall' loading='lazy' alt='' src='"+esc(primary)+"'"+extra+"></div>";
}
function imgTag(url, alt, drop){
  if(!url) return "";
  return "<img class='fr-fall' loading='lazy' alt='"+esc(alt||"")+"' data-drop='"+(drop||"box")+"' src='"+esc(url)+"'>";
}
var IRMAS = {
  C:["Palavras que ainda doem","O muro do silêncio","Casamento no piloto automático","Desconfiança que não dorme","Mágoa que não passa"],
  F:["A culpa de mãe","Filho se afastando da fé","Queda de braço em casa","O medo de cada saída"],
  O:["Travada na hora de começar","Sem palavras diante de Deus","Cansada demais pra orar","Orando sozinha pela casa"],
  D:["Dívida tirando a paz","Nome sujo, telefone tocando","A casa inteira nas costas","Vergonha de estar devendo"]
};
function chipFlex(s){
  if(!fem()) return s.replace(/sozinha/g,"sozinho").replace(/Sozinha/g,"Sozinho").replace(/mãe/g,"pai");
  return s;
}
function tresIrmas(area, nome){
  var pool = (IRMAS[area]||[]).map(chipFlex).filter(function(x){ return x!==nome; });
  return pool.slice(0, 3);
}
function poolOferta(area){
  if(area==="C"){
    if(EX()) return ["O vazio que "+ele()+" deixou","Divórcio batendo na porta","Mágoa que não passa"];
    return ["Palavras que ainda doem","O muro do silêncio","Casamento no piloto automático","Desconfiança que não dorme"];
  }
  if(area==="F") return ["Filho se afastando da fé", chipFlex("A culpa de mãe"), "Filho preso no vício", "Queda de braço em casa"];
  if(area==="O") return ["Travada na hora de começar","Sem palavras diante de Deus","Cansada demais pra orar", chipFlex("Orando sozinha pela casa")];
  return IRMAS.D.slice();
}
function quatroChips(area, nome){
  var pool = poolOferta(area).filter(function(x){ return x!==nome; });
  var out = [nome];
  pool.forEach(function(x){ if(out.length!==4) out.push(x); });
  return out;
}
function reageCurta(){
  if(LUTOU()){
    var t = tentou(), r = [];
    if(t.indexOf("tudo")!==-1 || t.indexOf("campanha")!==-1 || V("oracao")==="campanha") r.push("campanha");
    if(t.indexOf("tudo")!==-1 || t.indexOf("jejum")!==-1) r.push("jejum");
    if(t.indexOf("tudo")!==-1 || t.indexOf("madrugada")!==-1) r.push("madrugada");
    if(!r.length) r.push("campanha");
    return r.join(", ");
  }
  if(ORA()==="SIM") return "Você ora";
  return "Cobra, chora escondido, espera";
}
function voltaCurta(){
  if(!LUTOU()) return "E continua igual";
  var d = V("depois");
  if(d==="melhorou") return "Alivia uns dias";
  if(d==="nada") return "Nada muda";
  if(d==="cansando") return "Você cansa";
  if(d==="piorou") return "Piora";
  return "E continua igual";
}
function watchOnce(node, fn){
  if(!node) return;
  if(!("IntersectionObserver" in window)){ fn(); return; }
  var io = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ if(en.isIntersecting){ fn(); io.disconnect(); } });
  }, {threshold:0.01});
  io.observe(node);
}
function fadeIn(root){
  var box = root.querySelector(".fr-dx, .fr-pitch");
  if(!box) return;
  var secs = root.querySelectorAll(".fr-blk");
  if(!("IntersectionObserver" in window)) return;
  box.classList.add("fr-anim");
  var io = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
  }, {rootMargin:"0px 0px -8% 0px", threshold:0.01});
  Array.prototype.forEach.call(secs, function(x, i){ if(i===0) x.classList.add("in"); else io.observe(x); });
}
function renderResult(el){
  var r = computeScore(), s = SITS[r.sit];
  var nome = esc(S.lead.nome||""), sitN = tx(s.nome), quando = txt(s.t);
  var hora = horaTxt(), al = blocoOracao(), care = cuidado(r), linha = LINHA_AREA[r.main](r.sit);
  var lead = (nome ? nome+", o" : "O")+" que você está vivendo tem nome:";
  var sinais = s.sinais.map(function(x){ return "<li>"+icoCirc(x.i)+"<span>"+esc(tx(x.t))+"</span></li>"; }).join("");
  var chips = s.tentou.map(function(x){ return "<span class='fr-chipx'>"+esc(tx(x))+"</span>"; }).join("<span class='fr-dotsep'>·</span>");
  var intro = s.passoIntro ? "<p class='fr-passo-intro'>"+esc(tx(s.passoIntro))+"</p>" : "";
  var passos = s.passo.map(function(x, i){ return "<li><span class='fr-n'>"+(i+1)+"</span><span>"+esc(tx(x))+"</span></li>"; }).join("");
  var irm = tresIrmas(r.main, sitN).map(function(x){ return "<span class='fr-blur'>"+esc(x)+"</span>"; }).join("");
  var front = "";
  if(r.second){
    front = "<section class='fr-blk fr-dx-sec'><p class='fr-front'>"+symHtml(r.second, 28)+"<span><b>Também pesa aí: "+AREA2_TXT(r.second)+".</b> Quando tudo aperta junto, não é coincidência.</span></p></section>";
  }
  el.innerHTML = "<div class='fr-folha fr-dx'>"
    + "<section class='fr-blk fr-dx-top'>"
    + symHtml(r.main, 56)
    + "<p class='fr-selo'>O QUE ESTÁ ACONTECENDO NA SUA CASA</p>"
    + "<p class='fr-dx-lead'>"+lead+"</p>"
    + "<h1 class='fr-dx-sit'><span class='q'>“</span>"+esc(sitN)+"<span class='q'>”</span></h1>"
    + "<p class='fr-frase'>"+esc(tx(s.frase))+"</p>"
    + sceneHtml(r.sit)
    + "<hr class='fr-dx-rule'></section>"
    + "<section class='fr-blk fr-dx-sec'>"
    + "<p class='fr-dx-label'>POR DENTRO</p>"
    + "<p class='fr-reco'>Você se reconhece aqui?</p>"
    + "<ul class='fr-sinais'>"+sinais+"</ul>"
    + "<p class='fr-virada'>"+esc(tx(s.virada))+"</p>"
    + (linha ? "<p class='fr-linha'>"+linha+"</p>" : "")
    + "<hr class='fr-dx-rule'></section>"
    + "<section class='fr-blk fr-dx-sec'>"
    + "<p class='fr-dx-label'>POR QUE AINDA NÃO MUDOU</p>"
    + "<div class='fr-tentou'>"+chips+"<span class='fr-seta' aria-hidden='true'>"+ico("refresh", 18)+"</span><p class='fr-chave'>"+esc(tx(s.chave))+"</p></div>"
    + "<div class='fr-dx-alivio'>"+icoCirc(al.ico)+"<div>"+al.html+"</div></div>"
    + "<hr class='fr-dx-rule'></section>"
    + "<section class='fr-blk fr-dx-sec'><div class='fr-arma-card' id='fr-arma-card'>"
    + "<p class='fr-arma-kicker'>"+ico("sword", 18)+" A ARMA PRA ESSA SITUAÇÃO</p>"
    + "<h2 class='fr-arma-nome'>"+esc(tx(s.arma))+"</h2>"
    + "<p class='fr-arma-princ'>"+esc(tx(s.princ))+"</p>"
    + "<div class='fr-bilhete'><span class='fr-tape' aria-hidden='true'></span>"
    + "<div class='fr-bilhete-top'><div><p class='fr-passo-kicker'>O PRIMEIRO PASSO · "+esc(hora)+"</p></div>"+ "<span class='fr-acao'>"+ico(s.acao||"check", 64)+"</span></div>"
    + intro
    + "<ol class='fr-passos'>"+passos+"</ol>"
    + "<p class='fr-voz-kicker'>"+ico("bubble", 16)+" PRA FALAR EM VOZ ALTA</p>"
    + "<p class='fr-voz'>“"+esc(tx(s.voz))+"”</p>"
    + "<button type='button' class='fr-printbtn' id='fr-print'>"+ico("pin", 16)+" Tire um print pra não esquecer</button>"
    + "</div></div>"
    + (care ? "<div class='fr-care'>"+ico("phone", 18)+"<span>"+care+"</span></div>" : "")
    + "</section>"
    + front
    + "<section class='fr-blk fr-dx-sec fr-dx-end'>"
    + "<h2 class='fr-dx-endtitle'>Isso é só o primeiro passo.</h2>"
    + "<ol class='fr-trilha' id='fr-trilha'>"
    + "<li class='on'><span class='dot'>"+ico("check", 16)+"</span><div><b>O primeiro passo pra “"+esc(sitN)+"”</b><i>já é seu</i></div></li>"
    + "<li><span class='dot'>"+ico("lock", 16)+"</span><div>A oração pronta</div></li>"
    + "<li><span class='dot'>"+ico("lock", 16)+"</span><div>Os versículos pra declarar</div></li>"
    + "<li><span class='dot'>"+ico("lock", 16)+"</span><div>O passo a passo completo</div></li>"
    + "<li><span class='dot'>"+ico("lock", 16)+"</span><div>As situações que costumam vir junto:<span class='fr-blurs'>"+irm+"</span></div></li>"
    + "</ol>"
    + "<p class='fr-dx-p fr-center'>A Pra. Ezenete organizou o caminho inteiro, situação por situação.</p>"
    + cta("QUERO VER O CAMINHO COMPLETO")
    + "<p class='fr-guarda'>Guarda o seu primeiro passo. Ele já é seu.</p>"
    + "</section></div>";
  var btn = el.querySelector("#fr-next");
  btn.addEventListener("click", function(){ track("clique_caminho_completo", {area:r.main, situacao:r.sit}); });
  var pr = el.querySelector("#fr-print");
  if(pr) pr.addEventListener("click", function(){ track("clique_print", {area:r.main, situacao:r.sit}); });
  bindNext(el);
  bindMedia(el);
  track("resultado_visto", {area:r.main, situacao:r.sit});
  fadeIn(el);
  var armaSent = false, passoSent = false;
  watchOnce(el.querySelector("#fr-arma-card"), function(){ if(armaSent) return; armaSent = true; track("arma_vista", {area:r.main, situacao:r.sit}); });
  watchOnce(el.querySelector("#fr-trilha"), function(){ if(passoSent) return; passoSent = true; track("primeiro_passo_visto", {area:r.main, situacao:r.sit}); });
  void quando;
}
function nomePronome(area){
  if(area==="C") return dele();
  if(area==="F") return "do seu filho";
  return "";
}
function phoneHtml(area){
  var capa = cfgImg("capa_"+area);
  if(!capa) return "";
  var prev = area==="C" ? cfgImg("preview_C") : "";
  var sheets;
  if(prev) sheets = "<div class='fr-sheet a'><img class='fr-fall' data-drop='img' alt='' src='"+esc(prev)+"'></div><div class='fr-sheet b'><img class='fr-fall' data-drop='img' alt='' src='"+esc(prev)+"'></div>";
  else sheets = "<div class='fr-sheet a paper'></div><div class='fr-sheet b paper'></div>";
  return "<div class='fr-desk'>"+sheets+"<div class='fr-phone'><div class='scr'><img class='fr-fall' data-drop='desk' loading='lazy' alt='Capa do material' src='"+esc(capa)+"'></div></div></div>";
}
function interiorHtml(area){
  var nomeN = nomePronome(area);
  var ora = nomeN ? "Oração pronta, com espaço pro nome "+nomeN : "Oração pronta";
  var items = [
    {i:"search", t:"O que está acontecendo"},
    {i:"sword", t:"A arma e o passo a passo"},
    {i:"hands", t:ora},
    {i:"check", t:"O Pra hoje"}
  ];
  var lis = items.map(function(x){ return "<li>"+ico(x.i, 18)+"<span>"+esc(x.t)+"</span></li>"; }).join("");
  var prev = area==="C" ? cfgImg("preview_C") : "";
  var fig = prev ? "<div class='fr-ar fr-ar-page'><img class='fr-fall' loading='lazy' alt='Página de uma situação no material' src='"+esc(prev)+"'></div>" : "";
  return fig+"<ul class='fr-calls'>"+lis+"</ul>";
}
function cicloHtml(){
  var n2 = reageCurta(), n3 = voltaCurta();
  return "<div class='fr-ciclo'>"
    + "<svg class='fr-ciclo-ring' viewBox='0 0 200 200' aria-hidden='true'><path d='M100 28a72 72 0 0 1 62 36' fill='none' stroke='#A25A38' stroke-width='1.5'/><path d='M162 100a72 72 0 0 1-36 62' fill='none' stroke='#A25A38' stroke-width='1.5'/><path d='M100 172a72 72 0 0 1-62-36' fill='none' stroke='#A25A38' stroke-width='1.5'/><path d='M38 100a72 72 0 0 1 36-62' fill='none' stroke='#A25A38' stroke-width='1.5'/></svg>"
    + "<div class='cn c1'><span class='k'>1</span><b>A situação aperta</b></div>"
    + "<div class='cn c2'><span class='k'>2</span><b>Você reage</b><span class='sub'>"+esc(n2)+"</span></div>"
    + "<div class='cn c3'><span class='k'>3</span><b>"+esc(n3)+"</b></div>"
    + "<div class='cn c4'><span class='k'>4</span><b>Vem a culpa</b><span class='sub'>“será que o problema sou eu?”</span></div>"
    + "<div class='cmid'>O problema não é você.</div>"
    + "</div>"
    + (LUTOU() ? "<p class='fr-ciclo-nota'>Quem já lutou assim por essa casa não tem fé pequena.</p>" : "");
}
function p3chips(area){
  var map = {
    C:[["shh","Briga","boca fechada"],["hands","Ferida","perdão"],["coffee","Frieza","gesto de carinho"]],
    F:[["door","Não quer ouvir","orar e deixar a porta aberta"],["box","Culpa","tirar das costas"],["hands","Medo","presença"]],
    O:[["clock","Não sai","5 minutos fiéis"],["book","Sem palavras","a Palavra na boca"],["pin","Correria","um lugar fixo pra Deus"]],
    D:[["sun","Dívida","os números na luz"],["compass","Sufoco","sabedoria pra renegociar"],["hands","Peso","coragem de pedir ajuda"]]
  };
  return (map[area]||[]).map(function(x){
    return "<span class='fr-p3chip'>"+ico(x[0], 16)+"<span><b>"+esc(x[1])+"</b> "+esc(x[2])+"</span></span>";
  }).join("");
}
function renderPitch(el){
  var r = computeScore(), s = SITS[r.sit];
  var sitN = tx(s.nome), quando = txt(s.t), nome = esc(S.lead.nome||"");
  var url = checkoutUrl(r.main);
  var p3fig = cfgImg("p3");
  var p3img = p3fig ? "<div class='fr-p3art'><img class='fr-fall' loading='lazy' alt='' src='"+esc(p3fig)+"'></div>" : "<div class='fr-p3art fr-p3fallback' aria-hidden='true'>"+ico("alert", 28)+ico("coffee", 28)+"</div>";
  var chips = quatroChips(r.main, sitN).map(function(x, i){
    var tag = i===0 ? "<i class='me'>a sua</i>" : "";
    return "<span class='fr-sitchip"+(i===0?" on":"")+"'>"+esc(x)+tag+"</span>";
  }).join("");
  var autora = cfgImg("autora");
  var foto = autora ? "<img class='fr-autora fr-fall' data-drop='img' loading='lazy' alt='Pra. Ezenete Rodrigues' src='"+esc(autora)+"'>" : "";
  var relatos = [
    {k:"relato1", who:"@katianascimento9902"},
    {k:"relato2", who:"@andrezarosolen"},
    {k:"relato3", who:"@maria.rgoncalves"}
  ].map(function(x){
    var u = cfgImg(x.k);
    var im = u ? "<img class='fr-fall' data-drop='img' loading='lazy' alt='Relato de "+esc(x.who)+"' src='"+esc(u)+"'>" : "";
    return "<figure class='fr-slide'>"+im+"<figcaption>"+esc(x.who)+"</figcaption></figure>";
  }).join("");
  var faq1 = {C:ele()+" volta", F:"meu filho volta pra Deus", D:"a dívida some"}[r.main];
  var faq = "";
  if(faq1) faq += "<details class='fr-acc'><summary>Isso garante que "+esc(faq1)+"?</summary><p>Não. Milagre é decisão de Deus. O material te mostra a causa e o que fazer em cada situação.</p></details>";
  faq += "<details class='fr-acc'><summary>E se "+ele()+" não quer mudar?</summary><p>Você responde pela sua oração, não pelas escolhas "+dele()+". Interceder é orar por quem não ora.</p></details>"
    + "<details class='fr-acc'><summary>Quase não oro. Serve pra mim?</summary><p>Serve. Começa do começo, com oração pronta. Não precisa orar bonito.</p></details>"
    + "<details class='fr-acc'><summary>Não tenho tempo.</summary><p>De 5 a 15 minutos. Cada situação cabe numa manhã.</p></details>"
    + "<details class='fr-acc'><summary>Faço tratamento ou terapia.</summary><p>Continue. Um caminha junto com o outro.</p></details>"
    + "<details class='fr-acc'><summary>Estou sofrendo agressão.</summary><p>A sua segurança vem primeiro: 180 ou 190.</p></details>"
    + "<details class='fr-acc'><summary>Como recebo?</summary><p>Logo depois do pagamento, no e-mail da compra e em Minhas Compras, na Eduzz.</p></details>"
    + "<details class='fr-acc'><summary>Como pago?</summary><p>Pix ou cartão. R$ "+CFG.avista+" à vista ou "+CFG.parcelas+".</p></details>"
    + "<details class='fr-acc'><summary>E se eu não gostar?</summary><p>Você tem 7 dias pra pedir o reembolso.</p></details>";
  var btn = "<a class='fr-cta fr-buy' href='"+esc(url)+"'>"+BTN[r.main]+"</a>";
  var also = r.second ? "<span class='fr-also'>"+symHtml(r.second, 22)+" também: "+AREA2_TXT(r.second)+"</span>" : "";
  var p3fecha = LUTOU() ? "Não foi falta de fé. Foi o mesmo remédio pra tudo." : "Não é falta de fé. Faltou o remédio certo.";
  var passo3nome = r.main==="C" ? dele() : "dele";
  el.innerHTML = "<div class='fr-pitch'>"
    + "<section class='fr-blk fr-sum'>"
    + "<p class='fr-selo'>SEU RESULTADO</p>"
    + "<div class='fr-sumrow'>"+symHtml(r.main, 40)+"<span class='fr-sitchip on'>"+esc(sitN)+"</span>"+also+"</div>"
    + "<p class='fr-okarma'>"+ico("check", 16)+" Primeira arma na mão</p>"
    + "<p class='fr-dx-p'>"+(nome?nome+", ":"")+"me dá 2 minutos. Quero te mostrar por que isso volta, e o que fazer em cada situação.</p>"
    + "</section>"
    + "<section class='fr-blk'><h2 class='fr-h2'>Por que parece que nada muda</h2>"+cicloHtml()+"</section>"
    + "<section class='fr-blk'>"
    + p3img
    + "<p class='fr-dx-p'>Ninguém trata dor de dente com xarope de tosse. Pode tomar o vidro inteiro.</p>"
    + "<p class='fr-chave'>Cada situação tem uma causa. E cada causa, a sua arma.</p>"
    + "<p class='fr-verse'>“As armas da nossa luta são poderosas em Deus.” <span>2 Coríntios 10:4</span></p>"
    + "<div class='fr-p3chips'>"+p3chips(r.main)+"</div>"
    + "<p class='fr-ciclo-nota'>"+p3fecha+"</p>"
    + "</section>"
    + "<section class='fr-blk'><h2 class='fr-h2'>Como a Pra. Ezenete ensina há mais de 20 anos:</h2>"
    + "<ol class='fr-stepper'>"
    + "<li class='done'><span class='fr-num'>1<span class='ok'>"+ico("check", 12)+"</span></span><div><b>Entender o que está acontecendo.</b><p>Não é “abençoa minha casa”. É dar nome à situação.</p><i class='done-note'>você já fez</i></div></li>"
    + "<li><span class='fr-num'>2</span><div><b>Usar a arma daquela situação.</b><p>Palavra, louvor, silêncio, perdão, jejum, atitude.</p></div></li>"
    + "<li><span class='fr-num'>3</span><div><b>Falar a Palavra e fazer a sua parte.</b><p>Em voz alta, com o nome "+esc(passo3nome)+", e um passo hoje.</p></div></li>"
    + "</ol>"
    + "<p class='fr-dx-p'>O passo 1 você já viu no resultado. Agora imagina isso pra cada situação da sua casa.</p>"
    + "</section>"
    + "<section class='fr-blk' id='fr-b5'>"
    + "<h2 class='fr-h2'>"+esc(MATERIAL[r.main])+"</h2>"
    + "<p class='fr-submat'>"+esc(SUB[r.main])+"</p>"
    + "<p class='fr-dx-p fr-center'>Manual de oração · 20 situações reais · uma arma pra cada</p>"
    + phoneHtml(r.main)
    + "<p class='fr-dx-label'>POR DENTRO DE CADA SITUAÇÃO</p>"
    + interiorHtml(r.main)
    + "<p class='fr-ainda'>E ainda: versículos pra declarar, uma declaração pro dia e espaço pra anotar.</p>"
    + "<p class='fr-dx-label'>AS SITUAÇÕES QUE MAIS PARECEM COM A SUA</p>"
    + "<div class='fr-sitchips'>"+chips+"</div>"
    + "<p class='fr-capitulo'>No material, a sua está no capítulo “"+esc(quando)+"”.</p>"
    + "<p class='fr-dx-label'>E MAIS</p>"
    + "<ul class='fr-extras'>"
    + "<li>"+icoCirc("clock")+"<span>Rotina de 5 a 15 minutos</span></li>"
    + "<li>"+icoCirc("door")+"<span>Como montar um quarto de guerra</span></li>"
    + "<li>"+icoCirc("shield")+"<span>A sua autoridade e quem é o inimigo de verdade</span></li>"
    + "</ul>"
    + "<p class='fr-center fr-dx-p'>"+ico("phone", 18)+" No celular ou impresso.</p>"
    + "</section>"
    + "<section class='fr-blk fr-quem'>"
    + foto
    + "<h2 class='fr-h2'>Pra. Ezenete Rodrigues</h2>"
    + "<ul class='fr-selosnum'>"
    + "<li><b>20+ anos</b><span>à frente da intercessão da Estância Paraíso</span></li>"
    + "<li><b>200 mil</b><span>pessoas formadas na intercessão</span></li>"
    + "<li><b>Autora</b><span>de Uma Vida de Milagres</span></li>"
    + "</ul>"
    + "<p class='fr-dx-p'>Ela conta que, no começo, 5 minutos de oração era muito. Ninguém começa grande. A gente começa fiel.</p>"
    + "</section>"
    + "<section class='fr-blk'>"
    + "<p class='fr-stars'>★★★★★</p>"
    + "<div class='fr-car'><div class='fr-car-track' id='fr-car-track'>"+relatos+"</div></div>"
    + "<div class='fr-car-nav'><button type='button' id='fr-car-prev' aria-label='Relato anterior'>"+ico("refresh", 18)+"</button><button type='button' id='fr-car-next' aria-label='Próximo relato'>"+ico("refresh", 18)+"</button></div>"
    + "<p class='fr-legend'>Relatos reais das redes da Pra. Ezenete. Não são promessa de resultado.</p>"
    + "</section>"
    + "<section class='fr-blk'><div class='fr-price'>"
    + (cfgImg("capa_"+r.main) ? "<div class='fr-pricecapa'><img class='fr-fall' data-drop='img' alt='' src='"+esc(cfgImg("capa_"+r.main))+"'></div>" : "")
    + "<p class='plabel'>"+esc(MATERIAL[r.main])+"</p>"
    + "<div class='p12'>R$ "+CFG.avista+"</div>"
    + "<p class='fr-av'>à vista, no Pix ou no cartão</p>"
    + "<p class='fr-parc'>ou <b>"+CFG.parcelas+"</b> no cartão</p>"
    + "<p class='fr-pag'>"+ico("pix", 18)+" "+ico("card", 18)+" Pagamento único.</p>"
    + "<ul class='fr-sealrow'>"
    + "<li>"+icoCirc("shield")+"<span>7 dias pra pedir reembolso</span></li>"
    + "<li>"+icoCirc("mail")+"<span>Acesso no e-mail e em Minhas Compras, na Eduzz</span></li>"
    + "<li>"+icoCirc("phone")+"<span>No celular ou impresso</span></li>"
    + "</ul>"
    + btn.replace("fr-buy'", "fr-buy' id='fr-buy-top'")
    + "</div></section>"
    + "<section class='fr-blk fr-gar'>"
    + "<div class='fr-seal7' aria-hidden='true'><span>7</span><small>DIAS</small></div>"
    + "<p><b>Garantia de 7 dias.</b> Leia, ore, use. Se não for pra você, pede o reembolso em até 7 dias e devolvemos tudo.</p>"
    + "</section>"
    + "<section class='fr-blk'>"+faq+"</section>"
    + "<section class='fr-blk'>"
    + "<div class='fr-antes'>"
    + "<div class='col a'><span class='ico'>"+ico("cloud", 28)+"</span><b>Sem direção</b><p>a mesma oração pra tudo</p><p>cansaço e culpa</p></div>"
    + "<div class='col b'><span class='ico'>"+ico("compass", 28)+"</span><b>Com direção</b><p>saber o que está acontecendo</p><p>uma arma e um passo pra cada situação</p></div>"
    + "</div>"
    + "<p class='fr-dx-p fr-center'>Deus é quem restaura. A sua parte é orar com direção e obedecer.</p>"
    + btn.replace("fr-buy'", "fr-buy' id='fr-buy2'")
    + "<p class='fr-later'>Não é pra agora? Guarda o seu primeiro passo. Ele já é seu.</p>"
    + "</section>"
    + "<div style='height:110px'></div></div>"
    + "<div class='fr-fixedcta' id='fr-fixed'><a class='fr-cta fr-buy' id='fr-buy' href='"+esc(url)+"'>"+BTN[r.main]+"</a></div>";
  el.querySelectorAll(".fr-buy").forEach(function(a){ a.addEventListener("click", function(){ track("checkout_click", {area:r.main, situacao:r.sit}); }); });
  var trackEl = el.querySelector("#fr-car-track");
  var prev = el.querySelector("#fr-car-prev"), nextb = el.querySelector("#fr-car-next");
  if(prev) prev.addEventListener("click", function(){ if(trackEl) trackEl.scrollBy({left:-trackEl.clientWidth, behavior:"smooth"}); });
  if(nextb) nextb.addEventListener("click", function(){ if(trackEl) trackEl.scrollBy({left:trackEl.clientWidth, behavior:"smooth"}); });
  bindMedia(el);
  fadeIn(el);
  var fx = el.querySelector("#fr-fixed"), b5 = el.querySelector("#fr-b5");
  function chk(){ if(!document.body.contains(b5)){ window.removeEventListener("scroll", chk); return; } var show = !ge(b5.getBoundingClientRect().top, window.innerHeight * 0.9); fx.classList.toggle("show", show); }
  window.addEventListener("scroll", chk, {passive:true}); chk();
  track("pitch_visto", {area:r.main});
  void sitN;
}
function boot(){
  root.innerHTML = "<div class='fr-topbar'><button class='fr-back' id='fr-back' aria-label='Voltar'>&#8249;</button><div class='fr-progress'><div class='fr-progress-fill' id='fr-fill'></div></div></div><div class='fr-stage' id='fr-stage'></div>";
  stage = root.querySelector("#fr-stage"); fill = root.querySelector("#fr-fill"); backBtn = root.querySelector("#fr-back");
  backBtn.addEventListener("click", back);
  if(!S.history || !S.history.length || typeof S.history[0] !== "string"){ S.history = [STEPS[0].name]; }
  render(); track("view");
  try{ var tent = 0; var ivWp = setInterval(function(){ var n = neutralizarWpEmoji(); restaurarEmojiNativo(root); tent = tent+1; if(n || ge(tent, 16)){ clearInterval(ivWp); } }, 500);
    window.addEventListener("load", function(){ setTimeout(function(){ neutralizarWpEmoji(); restaurarEmojiNativo(root); }, 400); }); }catch(e){}
}
window.__FR = { S:S, computeScore:computeScore, visibleSteps:visibleSteps, V:V, checkoutUrl:checkoutUrl, sitTitulo:sitTitulo, sitNome:sitNome };
if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();
