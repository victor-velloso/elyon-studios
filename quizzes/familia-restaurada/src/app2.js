
/* ================= ETAPAS ================= */
function o(id,e,t,p,show){ return {id:id,e:e,t:t,p:p||null,show:show||null}; }
function Q(name,key,title,opts,cfg){ return Object.assign({name:name,type:"q",key:key,title:title,opts:opts},cfg||{}); }
function txt(t){ return typeof t==="function" ? t() : t; }
function stepOpts(st){ var list = typeof st.opts==="function" ? st.opts() : st.opts; return list.filter(function(x){ return !x.show || x.show(); }); }
function stepByKey(k){ for(var i=0;i<STEPS.length;i++){ if(STEPS[i].key===k) return STEPS[i]; } return null; }
function isVisible(st){ return !st.showIf || st.showIf(); }
/* V(key): resposta so vale se a tela ainda aparece pra ela e a opcao ainda existe (regra de ouro: nada de eco de resposta que nao vale) */
function V(k){
  if(k==="sexo") return A.sexo;
  var st = stepByKey(k); var v = A[k];
  if(!st || v==null) return null;
  if(!isVisible(st)) return null;
  var ids = stepOpts(st).map(function(x){ return x.id; });
  if(st.type==="multi"){ var f = v.filter(function(x){ return ids.indexOf(x)>-1; }); return f.length ? f : null; }
  return ids.indexOf(v)>-1 ? v : null;
}
function optOf(k,id){ var st=stepByKey(k); if(!st) return null; var l=stepOpts(st); for(var i=0;i<l.length;i++){ if(l[i].id===id) return l[i]; } return null; }
function L(k){ var v=V(k); if(v==null) return ""; var op=optOf(k,v); return op ? txt(op.t) : ""; }
function Ls(k){ return (V(k)||[]).map(function(id){ var op=optOf(k,id); return op?txt(op.t):""; }); }

var TEMPO_ECO = {meses:"alguns meses", ano:"mais ou menos 1 ano", d25:"de 2 a 5 anos", m5:"mais de 5 anos"};
var HORA_TXT = {cedo:"Amanhã cedinho", almoco:"No seu almoço", noite:"Hoje à noite", sem:"Quando der"};
function horaTxt(){ return HORA_TXT[V("hora")] || "Quando der"; }

var STEPS = [
{ name:"t01-abertura", type:"open" },
Q("t02-idade","idade","Quantos anos você tem?",[o("a25","🌷","Até 25"),o("a33","🌸","26 a 33"),o("a40","🌼","34 a 40"),o("a50","🌻","41 a 50"),o("a60","🌺","51 a 60"),o("a61","💐","Mais de 60")]),
Q("t03-civil","civil","Hoje você é...",[
  o("casada","💍",function(){return g("Casada","Casado");}),
  o("junto","🏠","Moro junto"),
  o("ex","💔",function(){return g("Já fui casada (separada ou divorciada)","Já fui casado (separado ou divorciado)");}),
  o("viuva","🕊️",function(){return g("Viúva","Viúvo");}),
  o("solteira",function(){return g("🙋‍♀️","🙋‍♂️");},function(){return g("Solteira","Solteiro");})]),
Q("t04-filhos","filhos","Você tem filhos?",[o("peq","🧒","Sim, pequenos (até 12)"),o("adol","🧑","Sim, adolescentes"),o("adul","👨‍👩‍👧","Sim, já adultos"),o("varias","👨‍👩‍👧‍👦","Tenho de várias idades"),o("nao","🚫","Não tenho filhos")]),
Q("t05-igreja","igreja","E a sua vida de igreja hoje, na real?",[o("semana","⛪","Congrego toda semana"),o("consigo","🙂","Vou quando consigo"),o("esfriei","🥶","Esfriei, quase não vou"),o("naocong","❤️","Hoje não congrego, mas amo a Deus")]),
Q("t06-tempo-fe","tempoFe","Há quanto tempo você caminha com Deus?",[o("m2","🌱","Menos de 2 anos"),o("d2","🌿","De 2 a 10 anos"),o("m10","🌳","Mais de 10 anos"),o("vida","📖","A vida inteira. Cresci na igreja.")]),
Q("t07-quem-ora","quemOra","Na sua casa, quem ora pela família?",[
  o("so",function(){return g("🙋‍♀️","🙋‍♂️");},function(){return g("Só eu, sozinha","Só eu, sozinho");}),
  o("casal","🤝",function(){return g("Eu e meu marido","Eu e minha esposa");},null,function(){return CASADA();}),
  o("fam","👵","Eu e alguém da família"),
  o("ninguem","😔","Hoje ninguém ora direito. Nem eu.",{O:1})]),
Q("t08-oracao","oracao","E a sua oração hoje, como está? Na real, sem julgamento.",[
  o("hora","🙏","Oro todo dia, com hora e lugar"),
  o("jeito","💬","Oro todo dia, do meu jeito, falando com Deus durante o dia"),
  o("campanha","📿","Oro mais quando aperta: faço campanha ou propósito"),
  o("vezes","🕰️","Oro de vez em quando, quando lembro",{O:1}),
  o("quase","😶","Quase não oro mais",{O:1}),
  o("nunca","🤍","Nunca tive o costume de orar")],{support:"Não tem resposta certa. É só pra eu entender a sua realidade."}),
Q("t09-origem","origem","Por onde você conhece a Pra. Ezenete?",[o("ig","📱","Pelo Instagram"),o("yt","▶️","Pelo YouTube"),o("dt","🎶","Pelo Diante do Trono ou pela Lagoinha"),o("ind","🗣️","Alguém me indicou"),o("agora","👋","Estou conhecendo agora")]),
Q("t10-hora","hora","Qual hora do dia é mais sua, sem ninguém te pedindo nada?",[o("cedo","🌅","Cedinho, antes da casa acordar"),o("almoco","☀️","Na hora do almoço"),o("noite","🌙","À noite, quando a casa silencia"),o("sem","🌀","Não tenho essa hora. Minha casa não para.")]),
{ name:"t11-insercao", type:"insert", render:function(){
    var h;
    if(V("quemOra")==="so"){
      h = "<p class='fr-quote'>\"Sou eu "+g("sozinha","sozinho")+" pra tudo.\"</p><div class='fr-card'>A gente escuta essa frase de muita "+mulherDeDeus()+". Se é a sua, respira: você não é "+g("a única","o único")+", e estar "+g("cansada","cansado")+" não quer dizer que a sua fé acabou.<br><br>As próximas perguntas são sobre o que está acontecendo aí dentro. Responde com o coração.</div>";
    } else if(V("quemOra")==="ninguem" || ORA()==="NAO"){
      h = "<h2 class='fr-h2'>Obrigada pela sinceridade.</h2><div class='fr-card'>Isso não é motivo de vergonha. Tem fase em que a casa aperta tanto que até a oração some. E tem gente que nunca aprendeu por onde começar.<br><br>Continua comigo. No final você vai entender o que está acontecendo, e o que fazer.</div>";
    } else {
      var longa = ["m10","vida"].indexOf(V("tempoFe"))>-1;
      h = "<h2 class='fr-h2'>Que bom que você não carrega isso "+g("sozinha","sozinho")+".</h2><div class='fr-card'>"+(longa?"E com tanto tempo de caminhada com Deus, deve doer ainda mais ver uma situação que não muda, né?<br><br>":"")+"Continua comigo. As próximas perguntas são sobre a sua casa.</div>";
    }
    return h + cta("CONTINUAR");
  }},
{ name:"t12-lutas", type:"multi", key:"lutas", small:true, title:"O que está pesando dentro da sua casa hoje? Marque tudo que é verdade.", opts:[
  o("c_desprezo","💔","Desprezo e palavras que ferem",{C:1},CASADA),
  o("c_frio","🧊","Casamento frio, dois estranhos em casa",{C:1},CASADA),
  o("c_traicao","🚪",function(){return "Traição, ou "+ele()+" saiu de casa";},{C:1},CASADA),
  o("c_separacao","💔","A separação ainda dói todo dia",{C:1},EX),
  o("c_magoa","😣",function(){return "Mágoa do que "+ele()+" fez comigo";},{C:1},EX),
  o("f_longe","🙏","Filho longe de Deus",{F:1},FIL),
  o("f_vicio","🌫️","Filho no vício ou em más companhias",{F:1},FIL),
  o("f_rebelde","😠","Filho rebelde, que não me ouve",{F:1},FIL),
  o("o_vontade","😶","Perdi a vontade de orar",{O:1}),
  o("o_longe","🏜️","Deus parece longe",{O:1}),
  o("d_divida","💸","Dívida que não fecha",{D:1}),
  o("d_seguro","🧾",function(){return "Sou eu que seguro a casa "+g("sozinha","sozinho");},{D:1}),
  o("tudo","🌀","Tudo junto. Uma coisa puxa a outra.")]},
Q("t13-tempo","tempo","E há quanto tempo a sua casa está assim?",[o("meses","🗓️","Alguns meses"),o("ano","📅","Mais ou menos 1 ano"),o("d25","⏳","De 2 a 5 anos"),o("m5","🪨","Mais de 5 anos. Já virou rotina.")]),
{ name:"t14-cena-casamento", type:"q", key:"cenaCas", quoted:true, showIf:CAS,
  title:function(){ return EX() ? "E hoje, quando você pensa no casamento que acabou, o que sai primeiro?" : "Quando você pensa no seu casamento hoje, qual frase sai primeiro?"; },
  opts:function(){ return EX() ? [
    o("dor","💔","Acabou, mas a dor não acabou.",{C:2}),
    o("oro","🙏",function(){return "Ainda oro por "+ele()+", mesmo "+g("separada","separado")+".";},{C:2},function(){ return ORA()!=="NAO"; }),
    o("perdoar","😣",function(){return "Não consigo perdoar o que "+ele()+" fez.";},{C:1}),
    o("paz","🌱","Quero paz pra recomeçar.",{C:1})
  ] : [
    o("hum","😞","Não aguento mais tanta humilhação e desprezo.",{C:2}),
    o("naofala","🤐",function(){return Ele()+" chega em casa e não fala comigo.";},{C:1}),
    o("deito","🛏️",function(){return "Deito "+g("sozinha","sozinho")+", mesmo sendo "+g("casada","casado")+".";},{C:1}),
    o("embora","🚪",function(){return Ele()+" foi embora e eu não aceito.";},{C:2}),
    o("amor","🤍","Tá difícil, mas ainda tem amor aqui.",{C:1})
  ]; } },
Q("t15-filho","cenaFil","E quando você pensa no seu filho (ou filha), o que dói mais?",[
  o("criei","😢","Criei na igreja e mesmo assim se desviou. Eu me culpo.",{F:2}),
  o("medo","😨","Tenho medo do que pode acontecer com ele lá fora.",{F:2}),
  o("ouve","🔇","Ele não me ouve mais. Qualquer conversa vira briga.",{F:1}),
  o("bem","🛡️","Graças a Deus tá bem, mas quero cobrir antes que o mundo pegue.",{F:1})],{quoted:true, showIf:FIL}),
{ name:"t16-como-ora", type:"q", key:"jeitoOrar", quoted:true,
  title:function(){ return ORA()==="NAO" ? "E o que te afasta da oração hoje?" : "E quando você ora, como é?"; },
  opts:function(){ return ORA()==="NAO" ? [
    o("comecar","🕰️","Quero orar, mas não consigo começar.",{O:2}),
    o("comosei",function(){return g("🤷‍♀️","🤷‍♂️");},"Não sei como orar. Falo com Deus do jeito que eu sei.",{O:2}),
    o("cansada","🪫",function(){return "Tô "+g("cansada","cansado")+" demais. A casa não deixa.";},{O:1}),
    o("ensinou","🤍","Nunca ninguém me ensinou.",{O:1})
  ] : [
    o("teto","🧱","Parece que não passa do teto."),
    o("direcao","🧭","Oro, mas sinto que oro sem direção. Não sei como orar direito.",{O:1}),
    o("choro","😭","Só choro. Não sei nem o que pedir."),
    o("vontade","😶","Perdi a vontade. Parece que não tenho o que falar com Deus.",{O:2}),
    o("parar","🕰️","Quero orar mais, mas não consigo parar pra isso.",{O:2})
  ]; } },
Q("t17-dinheiro","dinheiro","E o dinheiro dentro de casa?",[
  o("apertado","🙂","Tá apertado, mas a gente se vira."),
  o("paga","💸","Paga uma conta, aparece outra.",{D:2}),
  o("vergonha","😳","Tenho vergonha. Ninguém sabe o tamanho do buraco.",{D:2}),
  o("seguro","🧾",function(){return "Sou eu que seguro tudo, e tô "+g("cansada","cansado")+".";},{D:1}),
  o("paz","🕊️","Graças a Deus, essa parte tá em paz.")],{quoted:true}),
{ name:"t18-ja-fez", type:"multi", key:"tentou", small:true, exclusive:"nada", title:"O que você já fez pela sua casa até hoje? Marque tudo.",
  support:"Não tem resposta errada. Tudo isso tem valor, e não saber por onde começar também é uma resposta sincera.", opts:[
  o("campanha","📿","Campanha de oração"),o("jejum","🍞","Jejum"),o("madrugada","🌙","Madrugada de joelho"),
  o("pedi","📲","Pedi oração pra todo mundo (vídeo, igreja, grupo)"),o("conversei","🗣️","Conversei, cobrei, dei bronca"),
  o("chorei","🤫",function(){return "Chorei escondido e fiquei "+g("quieta","quieto");}),
  o("tudo","🔁","Tudo isso, mais de uma vez"),o("nada",function(){return g("🤷‍♀️","🤷‍♂️");},"Ainda não fiz nada. Não sei nem por onde começar.")]},
Q("t19-depois","depois","E depois disso, o que aconteceu?",[
  o("melhorou","🔁","Melhorou uns dias e voltou tudo."),
  o("nada","🧱","Nada mudou. Parece que Deus não me ouve."),
  o("cansando","🪫","Eu é que fui cansando. Hoje nem tenho vontade.",{O:1}),
  o("piorou","📉","Piorou.")],{quoted:true, showIf:function(){ return !NADA(); }}),
{ name:"t20-semente", type:"insert", render:function(){
    var armas = "<div class='fr-armas' aria-hidden='true'>🗡️🛡️🤐🙌</div>";
    var mid = "<p class='fr-sub'>A Pra. Ezenete ensina: <b>nem toda situação pede a mesma arma. Um soldado não usa a espada pra tudo.</b></p><p class='fr-sub'>Tem situação que se resolve com a Palavra na boca. Tem situação que se resolve fechando a boca. E tem situação que só anda depois de um perdão.</p>";
    var h;
    if(LUTOU()){
      var t = tentou(), itens = [];
      var camp = t.indexOf("campanha")>-1 || t.indexOf("tudo")>-1 || V("oracao")==="campanha";
      if(camp) itens.push("campanha");
      if(t.indexOf("jejum")>-1 || t.indexOf("tudo")>-1) itens.push("jejum");
      if(t.indexOf("madrugada")>-1 || t.indexOf("tudo")>-1) itens.push("madrugada de joelho");
      h = "<h2 class='fr-h2'>Presta atenção, porque é aqui que muita "+mulherDeDeus()+" se engana.</h2>"
        + "<p class='fr-sub'>Quem já "+joinE(lutouVerbos())+" pela própria casa sabe: o problema não foi falta de oração.</p>"
        + "<p class='fr-sub'>É que, do jeito que quase todo mundo aprende, a gente ora do mesmo jeito pra toda situação."+(camp?" Campanha pela traição. Campanha pelo filho. Campanha pela dívida.":"")+"</p>"
        + mid + "<p class='fr-sub'><span class='fr-hl'>Quando a gente não entende a causa, ora sem saber o que pedir. E aí cansa rápido.</span></p>";
    } else if(ORA()==="SIM"){
      h = "<h2 class='fr-h2'>Presta atenção nisso aqui.</h2>"
        + "<p class='fr-sub'>Você ora "+(V("oracao")==="hora"?"todo dia, com hora e lugar":"todo dia, do seu jeito")+". Isso é precioso. Então não é falta de oração.</p>"
        + "<p class='fr-sub'>A pergunta é outra: <b>você ora do mesmo jeito pra tudo?</b></p>"
        + mid + "<p class='fr-sub'><span class='fr-hl'>Quando a gente não entende a causa, ora sem saber o que pedir.</span></p>";
    } else {
      h = "<h2 class='fr-h2'>Talvez você esteja pensando: \"o problema é que eu não oro\". Calma.</h2>"
        + "<p class='fr-sub'>Tem uma coisa que quase ninguém ensina: cada situação tem uma causa. E cada causa pede um jeito de orar diferente.</p>"
        + mid + "<p class='fr-sub'><span class='fr-hl'>Não é sobre orar horas. É sobre entender o que tá acontecendo e saber o que fazer pra aquela situação.</span></p>";
    }
    return armas + h + cta("NOSSA, FAZ SENTIDO");
  }},
Q("t21-area","area","Se Deus mexesse em UMA coisa na sua casa esta semana, qual seria?",[
  o("C","💍",function(){ return EX() ? "A dor do meu casamento que acabou" : "O meu casamento"; },{C:2},CAS),
  o("F","👧","O meu filho",{F:2},FIL),
  o("O","🔥","A minha vida de oração",{O:2}),
  o("D","🧾","As contas da casa",{D:2})]),
Q("t22-filhos-sentem","filhosSentem","Os seus filhos já sentem o peso do que acontece em casa?",[
  o("sim","💔","Sim. E isso me dói mais que tudo.",{F:1}),
  o("esconde","🙈","Tento esconder, mas eles percebem.",{F:1}),
  o("nao","🤲","Ainda não, e quero que nunca sintam.")],{showIf:FIL}),
{ name:"t23-esconde", type:"q", key:"esconde", title:function(){ return "Seja "+g("sincera","sincero")+" comigo: o que você não conta pra ninguém, nem na igreja?"; }, opts:[
  o("cas","🤐","O que acontece no meu casamento",{C:1},CAS),
  o("fil","🤐","O que o meu filho está vivendo",{F:1},FIL),
  o("ora","🤐","Que a minha oração não tá como eu queria",{O:1}),
  o("div","🤐","O tamanho das dívidas",{D:1}),
  o("cans","🪫",function(){return "Que eu tô "+g("cansada","cansado")+" de tudo";})]},
{ name:"t24-nao-esta-so", type:"insert", render:function(){
    var tp = ucf(TEMPO_ECO[V("tempo")]||"");
    var h = (tp ? "<h2 class='fr-h2'>"+tp+" carregando isso é muito tempo.</h2>" : "");
    if(LUTOU()){
      h += "<p class='fr-sub'>E olha: você não está "+g("sozinha","sozinho")+". Uma frase que a equipe da Pra. Ezenete escuta todo dia é esta:</p>"
        + "<p class='fr-quote'>\"Já jejuei, já fiz campanha, já subi o monte. E a situação da minha casa continua exatamente igual.\"</p>"
        + "<p class='fr-sub'>Se você se viu aí, guarda isso: <span class='fr-hl'>o problema nunca foi a sua vontade de lutar.</span></p>";
    } else {
      h += "<p class='fr-sub'>E olha: você não está "+g("sozinha","sozinho")+". Tem muita "+mulherDeDeus()+" escrevendo isso agora, do jeito dela:</p>"
        + "<p class='fr-quote'>«Minha casa está Revirada já não sei mais o que fazer»</p>"
        + "<p class='fr-sub'>Se você se viu aí, guarda isso: <span class='fr-hl'>não saber o que fazer não quer dizer que você não tem fé. Quer dizer que ninguém te mostrou.</span></p>";
    }
    return h + cta("CONTINUAR");
  }},
Q("t25-consciencia","consciencia","Alguém já te ensinou o que fazer, na oração, pra cada tipo de situação?",[
  o("nunca",function(){return g("🤷‍♀️","🤷‍♂️");},"Nunca ninguém me ensinou"),o("ouvi","👂","Já ouvi falar, mas não sei fazer na prática"),o("pouco","😵","Sei um pouco, mas na hora do aperto esqueço tudo")]),
{ name:"t26-objecao", type:"q", key:"objecao", quoted:true,
  title:function(){ return "Última pergunta antes de montar o seu resultado. Sendo bem "+g("sincera","sincero")+": o que mais te seguraria de "+(ORA()==="NAO"?"começar a orar":"começar a orar diferente")+" pela sua casa?"; },
  opts:[
    o("A","😔","Já orei tanto e nada mudou. Tenho medo de me frustrar de novo.",null,function(){ return ORA()==="SIM"||ORA()==="AS"||LUTOU(); }),
    o("A2","😔","Tenho medo de começar e não dar em nada.",null,function(){ return ORA()==="NAO" && !LUTOU(); }),
    o("B","⏰","Não tenho tempo. Minha casa não para."),
    o("C","🧱",function(){ var quem = CAS()&&FIL() ? g("Meu marido ou meu filho","Minha esposa ou meu filho") : CAS() ? g("Meu marido","Minha esposa") : FIL() ? "Meu filho" : "O pessoal da minha casa"; return "Não adianta só eu. "+quem+" não quer mudar."; })
  ] },
