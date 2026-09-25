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
var ICO_CLOCK = "<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/></svg>";
var ICO_LINK = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1'/><path d='M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1'/></svg>";
var ICO_LOCK = "<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='5' y='11' width='14' height='10' rx='2'/><path d='M8 11V7a4 4 0 0 1 8 0v4'/></svg>";
/* Pagina de diagnostico (secao 7, design 7.6): uma carta pra ela, com dois destaques (nome da situacao e cartao verde da arma) */
function renderResult(el){
  var r = computeScore(), s = SITS[r.sit], nome = esc(S.lead.nome||""), sit = txt(s.t);
  var d2 = txt(s.d2) || ["","",""], linha = LINHA_AREA[r.main](r.sit), care = cuidado(r), hora = horaTxt();
  var passo = MX(s.passo), passoHtml = passo.indexOf(hora)===0 ? "<b>"+hora+"</b>"+passo.slice(hora.length) : passo;
  function P(t, cls){ return t ? "<p class='fr-dx-p"+(cls?" "+cls:"")+"'>"+t+"</p>" : ""; }
  el.innerHTML = "<div class='fr-dx'>"
    /* 1. Topo */
    + "<section class='fr-dx-sec fr-dx-top'>"+kicker("O que está acontecendo na sua casa")
    + "<span class='fr-sym fr-sym-sm' aria-hidden='true'>"+SYM[SYM_OF[r.main]]+"</span>"
    + "<p class='fr-dx-lead'>"+(nome?nome+", o que":"O que")+" você está vivendo tem nome:</p>"
    + "<h1 class='fr-dx-sit'><span class='q'>“</span>"+sit+"<span class='q'>”</span></h1>"
    + "<p class='fr-dx-p fr-dx-center'>É assim que a Pra. Ezenete chama essa situação. E ela tem uma causa que quase ninguém enxerga de primeira.</p>"
    + "<hr class='fr-dx-rule'></section>"
    /* 2. Por dentro */
    + "<section class='fr-dx-sec'>"+P(MX(s.d1))+P(MX(d2[0]))+"<p class='fr-dx-hl'>"+MX(d2[1])+"</p>"+P(MX(d2[2]))
    + (linha ? "<p class='fr-dx-hl fr-dx-hl-i'>"+linha+"</p>" : "")+"</section>"
    /* 3. Por que ainda nao mudou + bloco da oracao */
    + "<section class='fr-dx-sec'><p class='fr-dx-label'>Por que ainda não mudou</p>"+P(MX(s.pq))
    + "<div class='fr-dx-alivio'>"+MX(blocoOracao(nome))+"</div></section>"
    /* 4 e 5. A arma + o primeiro passo (cartao verde) */
    + "<section class='fr-dx-sec'><div class='fr-arma-card' id='fr-arma-card'>"
    + "<p class='fr-dx-label g'>A arma pra essa situação</p>"
    + "<h2 class='fr-arma-nome'>"+ucf(txt(s.arma)).replace(/\.$/,"")+"</h2>"
    + "<p class='fr-arma-princ'>"+MX(s.princ)+"</p>"
    + "<div class='fr-arma-div'></div>"
    + "<p class='fr-dx-label g fr-passo-label'>O primeiro passo · Pra hoje"+(passo.indexOf(hora)>-1?"<span class='fr-hora'>"+ICO_CLOCK+hora+"</span>":"")+"</p>"
    + "<div class='fr-bilhete'>"+passoHtml+"</div>"
    + "<p class='fr-dx-label g fr-voz-label'>Pra falar em voz alta</p>"
    + "<p class='fr-voz'>“"+MX(s.voz)+"”</p>"
    + "</div><p class='fr-printhint'>📌 Tire um print pra não esquecer</p>"
    /* 6. Aviso de cuidado */
    + (care ? "<div class='fr-care'>"+care+"</div>" : "")+"</section>"
    /* 7. Segunda frente */
    + (r.second ? "<section class='fr-dx-sec'><p class='fr-dx-front'>"+ICO_LINK+"<span><b>E tem mais uma coisa pesando aí: "+AREA2_TXT(r.second)+".</b> Não é coincidência quando tudo aperta junto. Uma porta aberta numa área da casa facilita a entrada nas outras.</span></p></section>" : "")
    /* 8. Isso e so o primeiro passo */
    + "<section class='fr-dx-sec fr-dx-end'><h2 class='fr-dx-endtitle'>Isso é só o primeiro passo.</h2>"
    + P("O que você acabou de ler é o começo de uma arma só. Pra essa situação ainda tem a oração pronta, os versículos pra declarar em voz alta e o passo a passo do que fazer depois.")
    + P(FRASE_FIM[r.main]())
    + P("A Pra. Ezenete organizou esse caminho inteiro, situação por situação, pra você saber o que fazer em cada uma.")
    + "<ul class='fr-locks'>"+["A oração pronta pra \""+sit+"\"","Os versículos pra declarar","O passo a passo completo","As situações que costumam vir junto"].map(function(x){ return "<li>"+ICO_LOCK+"<span>"+x+"</span></li>"; }).join("")+"</ul>"
    + cta("QUERO VER O CAMINHO COMPLETO")
    + "<p class='fr-guarda'>Guarda o seu primeiro passo. Ele já é seu.</p></section>"
    + "</div>";
  var btn = el.querySelector("#fr-next");
  btn.addEventListener("click", function(){ track("clique_caminho_completo", {area:r.main, situacao:r.sit}); });
  bindNext(el);
  track("resultado_visto", {area:r.main, situacao:r.sit});
  /* Ritmo (7.6 §8): fade suave ao rolar; e medicao (7.6 §9): cartao da arma visivel, uma vez */
  var secs = el.querySelectorAll(".fr-dx-sec"), card = el.querySelector("#fr-arma-card"), armaSent = false;
  function armaVista(){ if(armaSent) return; armaSent = true; track("arma_vista", {area:r.main, situacao:r.sit}); }
  if("IntersectionObserver" in window){
    el.querySelector(".fr-dx").classList.add("fr-anim");
    var io = new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } }); }, {rootMargin:"0px 0px -8% 0px", threshold:0.01});
    Array.prototype.forEach.call(secs, function(x, i){ if(i===0) x.classList.add("in"); else io.observe(x); });
    var io2 = new IntersectionObserver(function(ents){ ents.forEach(function(en){ if(en.isIntersecting && en.intersectionRatio>=0.35){ armaVista(); io2.disconnect(); } }); }, {threshold:[0.35]});
    io2.observe(card);
  }
}
var SITLIST = {
  C:function(){ return EX() ? ["Quando "+ele()+" saiu de casa","Quando chegou o pedido de divórcio","Quando eu não consigo perdoar"] : ["Quando "+ele()+" me feriu com palavras","Quando "+ele()+" me ignora e não conversa comigo","Quando o nosso casamento esfriou","Quando eu desconfio de uma traição"]; },
  F:function(){ return ["Quando o meu filho não quer mais saber da igreja","Quando eu criei no caminho, e mesmo assim ele se desviou","Quando eu descobri que o meu filho está usando drogas","Quando o meu filho é rebelde e me enfrenta"]; },
  O:function(){ return ["Quando eu quero orar, mas não consigo começar","Quando eu não sei o que falar com Deus","Quando a crise da minha casa está roubando a minha oração","Quando eu sou "+g("a única","o único")+" que ora dentro de casa"]; },
  D:function(){ return ["Quando as dívidas tiram a minha paz","Quando o meu nome está sujo e as cobranças não param","Quando sou eu que seguro a casa "+g("sozinha","sozinho"),"Quando eu tenho vergonha de dever e de pedir ajuda"]; }
};
var REAGE = {campanha:"faz a campanha", jejum:"jejua", madrugada:"passa a madrugada de joelho", pedi:"pede oração pra todo mundo", conversei:"conversa, cobra, dá bronca", chorei:null, tudo:null};
function renderPitch(el){
  var r = computeScore(), s = SITS[r.sit], sit = txt(s.t), nome = esc(S.lead.nome||""), url = checkoutUrl(r.main), t = tentou();
  /* Bloco 2 */
  var b2;
  if(LUTOU()){
    var re = [];
    if(t.indexOf("tudo")>-1 || (V("oracao")==="campanha" && t.indexOf("campanha")<0)) re.push("faz a campanha");
    ["campanha","jejum","madrugada","pedi","conversei"].forEach(function(k){ if(t.indexOf(k)>-1 && re.indexOf(REAGE[k])<0) re.push(REAGE[k]); });
    if(t.indexOf("tudo")>-1){ ["jejua","passa a madrugada de joelho"].forEach(function(x){ if(re.indexOf(x)<0) re.push(x); }); }
    if(t.indexOf("chorei")>-1) re.push("chora escondido e fica "+g("quieta","quieto"));
    var dp = V("depois"), dtx = dp==="melhorou" ? " Às vezes alivia. Você respira e pensa: agora vai. Aí volta." : (dp==="nada"||dp==="piorou") ? " E a situação continua igual, ou pior." : dp==="cansando" ? " E você vai cansando." : "";
    var tl = Ls("tentou");
    b2 = "<p>A situação aperta. Você reage: "+re.join(", ")+"."+dtx+"</p>"
      + "<p>E vem junto uma culpa que ninguém merece: <b>\"será que o problema sou eu?\"</b>.</p>"
      + (lutouVerbos().length ? "<p>Quem já "+joinE(lutouVerbos())+" por essa casa não tem fé pequena.</p>" : "")
      + "<p><span class='fr-hl'>O problema não é você.</span></p>";
  } else if(ORA()==="SIM"){
    b2 = "<p>Você ora "+(V("oracao")==="hora"?"todo dia":"do seu jeito")+". E mesmo assim a situação continua.</p><p>Aí vem a pergunta que ninguém merece carregar: <b>\"será que o problema sou eu?\"</b>.</p><p><span class='fr-hl'>O problema não é você.</span></p>";
  } else {
    b2 = "<p>A situação aperta. Você sabe que devia orar, mas não sabe nem por onde começar."+(t.indexOf("conversei")>-1?" Você conversa, cobra, dá bronca.":"")+(t.indexOf("chorei")>-1?" Você chora escondido e fica "+g("quieta","quieto")+".":"")+" E a situação continua.</p><p>E vem a culpa: <b>\"será que o problema sou eu?\"</b>.</p><p><span class='fr-hl'>O problema não é você.</span></p>";
  }
  var b3area = {
    C:"Tem briga que se resolve com a boca fechada. Tem ferida que só fecha com perdão. Tem frieza que precisa de gesto de carinho dentro de casa, e não de cobrança.",
    F:"Filho que não quer ouvir não volta com mais sermão. Às vezes a arma é orar em silêncio e deixar a porta aberta. Às vezes é tirar a culpa das suas costas.",
    O:"Oração que não sai não volta com mais culpa. Volta com cinco minutos fiéis, a Palavra na boca e um lugar pra Deus no meio da sua correria.",
    D:"Dívida não se resolve com mais um pedido de milagre. Se enfrenta com os números na luz, sabedoria pra renegociar e coragem de pedir ajuda."}[r.main];
  var sits = SITLIST[r.main](), lista = [sit].concat(sits.filter(function(x){ return x!==sit; })).slice(0,4);
  var nomeDe = {C:" com espaço pro nome "+dele(), F:" com espaço pro nome do seu filho"}[r.main];
  var E_ = r.main==="C" ? ele() : "ele", D_ = r.main==="C" ? dele() : "dele";
  var faq1 = {C:ele()+" volta", F:"meu filho volta pra Deus", D:"a dívida some"}[r.main];
  el.innerHTML = "<div class='fr-pitch'>"
    + kicker("O que fazer")
    + "<h1 class='fr-h1' style='text-align:left !important'>"+(nome?nome+", agora":"Agora")+" você sabe o que está acontecendo na sua casa: <em>\""+sit+"\"</em>. E já tem a primeira arma pra essa situação.</h1>"
    + "<p>Me dá dois minutos. Quero te mostrar por que essa situação volta, e o que fazer em cada situação que aparece aí dentro.</p>"
    + "<div class='fr-sec'>"+b2+"</div>"
    + "<div class='fr-sec'><p>Pensa num remédio. Ninguém trata dor de dente com xarope de tosse. Pode tomar o vidro inteiro que o dente continua doendo. E ninguém chama a doente de fraca por isso.</p>"
    + "<p>Cada situação tem uma causa. E cada causa pede um remédio. A Palavra diz que as armas da nossa luta são poderosas em Deus pra destruir fortalezas (2 Coríntios 10:4). <b>Armas, no plural.</b> E a Pra. Ezenete ensina: nem toda situação pede a mesma arma.</p>"
    + "<p>"+b3area+"</p>"
    + "<p><span class='fr-hl'>"+(LUTOU()?"Não foi falta de fé. Foi o mesmo remédio pra toda situação.":"Não é falta de fé. É que ninguém te mostrou o remédio pra essa situação.")+"</span></p></div>"
    + "<div class='fr-sec'><p>É assim que a Pra. Ezenete ensina há mais de 20 anos. Três passos, nessa ordem:</p>"
    + "<div class='fr-min'><span class='mico'>🔎</span><div><h3>1. Entender o que tá acontecendo de verdade.</h3><p>Não é \"Senhor, abençoa a minha casa\". É \"Senhor, é quando "+E_+" chega e não fala comigo\". Quem não entende a causa ora sem saber o que pedir.</p></div></div>"
    + "<div class='fr-min'><span class='mico'>🗡️</span><div><h3>2. Usar a arma daquela situação.</h3><p>A Palavra, a declaração, orar por "+E_+", o louvor, o silêncio, o perdão, o arrependimento, o jejum, uma atitude prática.</p></div></div>"
    + "<div class='fr-min'><span class='mico'>🗣️</span><div><h3>3. Falar a Palavra e fazer a sua parte.</h3><p>Declarar em voz alta, orar com o nome "+D_+" e dar um passo pequeno ainda hoje. Oração sem atitude cansa.</p></div></div>"
    + "<p style='margin-top:14px'>Você já viu isso no seu resultado, com a primeira arma e o Pra hoje. <b>Agora imagina isso pra cada situação da sua casa.</b></p></div>"
    + "<div class='fr-sec' id='fr-b5'><span class='fr-sym' aria-hidden='true'>"+SYM[SYM_OF[r.main]]+"</span>"
    + "<h2 class='fr-h2' style='text-align:center !important'>Isso, pronto pra você usar em casa, existe. Chama <em>"+MATERIAL[r.main]+"</em>: <i style='font-weight:400'>"+SUB[r.main]+"</i>.</h2>"
    + "<p>É um manual de oração montado a partir de mais de 20 anos de ensino da Pra. Ezenete. São 20 situações reais, dessas que a gente vive e não conta pra ninguém. Pra cada situação, uma arma. Em cada uma você encontra:</p>"
    + ["O que está acontecendo, do jeito que dói","A causa, e a arma certa pra ela","O que fazer, passo a passo","Os versículos pra declarar","Uma oração pronta"+(nomeDe?","+nomeDe:""),"Uma declaração curta pra repetir durante o dia","O Pra hoje: uma ação simples pra fazer hoje mesmo","Espaço pra anotar o que Deus falar"].map(function(x){ return "<p class='fr-check'>"+x+"</p>"; }).join("")
    + "<p style='margin-top:18px'><b>As situações que mais parecem com a sua:</b></p><ul class='sits'>"+lista.map(function(x,i){ return "<li"+(i===0?" class='me'":"")+">\""+x+"\"</li>"; }).join("")+"</ul>"
    + "<p style='margin-top:14px'>E ainda: a parte que ensina como orar pela sua casa, qual é a sua autoridade e quem é o seu inimigo de verdade; uma rotina simples de 5 a 15 minutos; como montar um quarto de guerra; e declarações diárias pra sua área.</p>"
    + "<p>Pra ler no celular ou imprimir.</p></div>"
    + "<div class='fr-sec'><p>A Pra. Ezenete Rodrigues está há mais de 20 anos à frente do Ministério de Intercessão da Estância Paraíso, em Sabará (MG). Já formou mais de 200 mil pessoas na intercessão. É autora de <i>Uma Vida de Milagres</i>.</p>"
    + "<p>Ela não ensina de livro. Ela mesma conta que, quando começou a orar com um grupo de intercessoras, cinco minutos de oração era muito pra ela. <b>Ninguém começa grande. A gente começa fiel.</b></p></div>"
    + "<div class='fr-sec'><span class='fr-stars'>★★★★★</span>"
    + relato("Deus quebrou toda maldição herditaria na minha vida e de minha família,toda honra e gloria a ele","@katianascimento9902")
    + relato("Cura e libertação de coisas que não entendia, já estava cansada de buscar, jejuar e continuar do mesmo jeito. Glória a Deus","@andrezarosolen")
    + relato("Eu fui grandemente abençoada, foi o sobrenatural de Deus. Pude entender a importância de ser filha. Glorioso","@maria.rgoncalves")
    + "<p class='fr-legend'><i>Relatos reais publicados nas redes da Pra. Ezenete. São testemunhos pessoais e não representam promessa de resultado.</i></p></div>"
    + "<div class='fr-sec'><div class='fr-price'><p class='plabel'>O "+MATERIAL[r.main]+" sai por:</p><div class='p12'>R$ "+CFG.avista+" <small>à vista</small></div><div class='pav'>ou em até "+CFG.parcelas+" no cartão</div><br><span class='pnote'>No Pix ou no cartão.</span><p class='fr-note' style='margin-top:14px'>Pagamento único. Você acessa pela plataforma Eduzz, logo depois da confirmação do pagamento.</p></div></div>"
    + "<div class='fr-sec'><div class='fr-card'><b>🛡️ Garantia de 7 dias</b><br>Você tem 7 dias pra ler, orar e usar. Se dentro de 7 dias você entender que não é pra você, é só pedir o reembolso e devolvemos cada centavo.<br><b>O risco fica com a gente.</b></div></div>"
    + "<div class='fr-sec'>"
    + (faq1 ? "<div class='fr-faq'><b>Isso garante que "+faq1+"?</b><p>Não. Nenhuma página garante que alguém vai mudar. Milagre é decisão de Deus, não produto de livro. O que o material te dá é entender a causa e saber o que fazer, na oração, em cada situação.</p></div>" : "")
    + "<div class='fr-faq'><b>E se "+E_+" não quer mudar?</b><p>Você responde pela sua oração e pela sua obediência, não pelas escolhas "+D_+". Interceder é justamente orar por quem não está orando por si.</p></div>"
    + "<div class='fr-faq'><b>Eu quase não oro. Serve pra mim?</b><p>Serve. O material começa do começo: uma rotina de 5 a 15 minutos e uma oração pronta em cada situação. Você não precisa saber orar bonito.</p></div>"
    + "<div class='fr-faq'><b>Não tenho tempo.</b><p>A rotina do material é de 5 a 15 minutos. Cada situação cabe numa manhã.</p></div>"
    + "<div class='fr-faq'><b>Faço tratamento ou terapia.</b><p>Continue. O material é formação espiritual e caminha junto com o cuidado profissional.</p></div>"
    + "<div class='fr-faq'><b>Estou sofrendo agressão.</b><p>A sua segurança vem primeiro: "+(fem()?"180 ou 190":"190")+". Você pode continuar orando de um lugar seguro.</p></div>"
    + "<div class='fr-faq'><b>Como recebo?</b><p>Pela plataforma Eduzz. Logo depois da confirmação do pagamento, o acesso chega no e-mail da compra e também fica em Minhas Compras, na Eduzz. Dá pra ler no celular ou imprimir.</p></div>"
    + "<div class='fr-faq'><b>Como pago?</b><p>No Pix ou no cartão. À vista, R$ 47. No cartão, dá pra parcelar em até 11x.</p></div>"
    + "<div class='fr-faq'><b>E se eu não gostar?</b><p>Você tem 7 dias de garantia. É só pedir o reembolso.</p></div></div>"
    + "<div class='fr-sec'><p>"+(nome?nome+", agora":"Agora")+" você sabe o que está acontecendo na sua casa. Cada semana sem saber o que fazer é mais uma semana cansando.</p>"
    + "<p class='fr-verdict' style='text-align:left'>Deus é quem restaura. A sua parte é orar do jeito certo e obedecer.</p>"
    + "<a class='fr-cta fr-buy' id='fr-buy2' href='"+url+"'>"+BTN[r.main]+"</a>"
    + "<p class='fr-later'>Não é pra agora? Tudo bem. Guarda o seu resultado e faz o Pra hoje. Ele já é seu.</p></div>"
    + "<div style='height:90px'></div></div>"
    + "<div class='fr-fixedcta' id='fr-fixed'><a class='fr-cta fr-buy' id='fr-buy' href='"+url+"'>"+BTN[r.main]+"</a></div>";
  el.querySelectorAll(".fr-buy").forEach(function(a){ a.addEventListener("click", function(){ track("checkout_click", {area:r.main, situacao:r.sit}); }); });
  var fx = el.querySelector("#fr-fixed"), b5 = el.querySelector("#fr-b5");
  function chk(){ if(!document.body.contains(b5)){ window.removeEventListener("scroll", chk); return; } fx.classList.toggle("show", b5.getBoundingClientRect().top < window.innerHeight*0.9); }
  window.addEventListener("scroll", chk, {passive:true}); chk();
  track("pitch_visto", {area:r.main});
}

/* ================= BOOT ================= */
function boot(){
  root.innerHTML = "<div class='fr-topbar'><button class='fr-back' id='fr-back' aria-label='Voltar'>&#8249;</button><div class='fr-progress'><div class='fr-progress-fill' id='fr-fill'></div></div></div><div class='fr-stage' id='fr-stage'></div>";
  stage = root.querySelector("#fr-stage"); fill = root.querySelector("#fr-fill"); backBtn = root.querySelector("#fr-back");
  backBtn.addEventListener("click", back);
  if(!S.history || !S.history.length || typeof S.history[0] !== "string"){ S.history = [STEPS[0].name]; }
  render(); track("view");
  try{ var tent = 0; var ivWp = setInterval(function(){ var n = neutralizarWpEmoji(); restaurarEmojiNativo(root); if(n || ++tent >= 16){ clearInterval(ivWp); } }, 500);
    window.addEventListener("load", function(){ setTimeout(function(){ neutralizarWpEmoji(); restaurarEmojiNativo(root); }, 400); }); }catch(e){}
}
window.__FR = { S:S, computeScore:computeScore, visibleSteps:visibleSteps, V:V, checkoutUrl:checkoutUrl, sitTitulo:sitTitulo };
if(document.readyState === "loading"){ document.addEventListener("DOMContentLoaded", boot); } else { boot(); }
})();
