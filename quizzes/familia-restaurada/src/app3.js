{ name:"t27-quebra", type:"insert", render:function(){
    var ob = V("objecao"), h = "", rel;
    var legenda = "<p class='fr-legend'>Relato real publicado nas redes da Pra. Ezenete. É o testemunho pessoal dela e não representa promessa de resultado.</p>";
    if(ob==="A"){
      h = "<h2 class='fr-h2'>Sobre o medo de se frustrar de novo: <em>ele é justo. E tem explicação.</em></h2>"
        + "<div class='fr-card'>Você não orou errado por falta de fé. "+(LUTOU()?"Você orou do mesmo jeito pra toda situação, porque foi o que te ensinaram.":"Você orou do jeito que aprendeu, sem ninguém te mostrar o que fazer em cada situação.")
        + "<br><br>A Pra. Ezenete fala isso com franqueza de mãe: oração não é negócio, não é troca. Você não ora pra comprar um resultado. E ela mesma conta que, quando começou, cinco minutos de oração era muito pra ela.<br><br><b>O que muda não é a quantidade. É entender a causa e usar a arma certa pra aquela situação.</b></div>";
      rel = relato("Cura e libertação de coisas que não entendia, já estava cansada de buscar, jejuar e continuar do mesmo jeito. Glória a Deus","@andrezarosolen");
    } else if(ob==="A2"){
      h = "<h2 class='fr-h2'>Sobre o medo de começar e não dar em nada: <em>é normal. E tem resposta.</em></h2>"
        + "<div class='fr-card'>Ninguém começa grande. A Pra. Ezenete conta que, quando começou, cinco minutos de oração era muito pra ela.<br><br>E oração não é negócio, não é troca. Você não ora pra comprar um resultado. Você ora porque Deus é Pai e escuta.<br><br><b>O que ajuda a começar não é força de vontade. É saber o que fazer pra situação que você tá vivendo.</b></div>";
      rel = relato("Cura e libertação de coisas que não entendia, já estava cansada de buscar, jejuar e continuar do mesmo jeito. Glória a Deus","@andrezarosolen");
    } else if(ob==="B"){
      var hs = {cedo:"A sua hora é cedinho, antes da casa acordar.", almoco:"A sua hora é no almoço.", noite:"A sua hora é à noite, quando a casa silencia.", sem:"A sua casa não para. Eu sei."};
      h = "<h2 class='fr-h2'>Sobre o tempo: <em>ninguém vai te pedir três horas de joelho.</em></h2>"
        + "<div class='fr-card'>"+(hs[V("hora")]?hs[V("hora")]+"<br><br>":"")+"O conselho da Pra. Ezenete é simples: cai da cama já de joelhos. Cinco, dez minutos, antes do celular. E durante o dia a Palavra vai com você: no ônibus, no carro, lavando louça.<br><br><b>Pequeno e fiel vale mais que grande e nunca.</b></div>";
      rel = relato("Estou passando dias maravilhosos com VCS, é um dos como se estivessem dentro da minha casa🙌! Obrigado pastora @ezenete.rodrigues. Agradeço a Deus por fazer parte junto com vocês","@sandraregina_leao");
    } else {
      var quem = (CAS() ? ele() : FIL() ? "o seu filho" : "o pessoal da sua casa");
      h = "<h2 class='fr-h2'>Sobre "+quem+" não querer mudar: <em>você tem razão. Você não controla a vontade de ninguém.</em></h2>"
        + "<div class='fr-card'>Ninguém vira robô porque alguém orou. Deus trata com "+(CAS()?ele():"ele")+", mas não anula a vontade "+(CAS()?dele():"dele")+".<br><br>Só que interceder é exatamente isso: orar por quem não está orando por si mesmo. A sua oração não fica pendurada no comportamento "+(CAS()?dele():"dele")+". Fica firmada em Deus.<br><br><b>E tem mais: quase sempre a primeira coisa que Deus trata é o nosso coração.</b></div>";
      rel = relato("Deus quebrou toda maldição herditaria na minha vida e de minha família,toda honra e gloria a ele","@katianascimento9902");
    }
    return kicker("Sobre o que te segura") + h + rel + legenda + cta("ENTENDI, QUERO VER O MEU RESULTADO");
  }},
{ name:"t28-sonho", type:"q", key:"sonho",
  title:"Agora quero te ouvir sobre outra coisa. Se Deus mexesse nisso, qual seria a primeira cena que você ia ver?",
  opts:function(){ var ar = V("area");
    if(ar==="C" && EX()) return [o("dormir","🌱","Eu dormindo em paz, sem essa dor no peito")]; /* ex-casada: só esta cena */
    if(ar==="C") return [o("conversa","🗨️",function(){return Ele()+" chegando em casa e conversando comigo";}),o("igreja","⛪","A gente sentado junto na igreja"),o("paz","🕊️","Paz. Sem grito, sem porta batendo")];
    if(ar==="F") return [o("louvando","🎶","Meu filho louvando a Deus de novo"),o("abraco","🤗","Ele me abraçando e pedindo a bênção"),o("semmedo","😴","Dormir sem medo do telefone tocar de madrugada")];
    if(ar==="D") return [o("app","📱","Abrir o aplicativo do banco sem medo"),o("nome","✅","Nome limpo"),o("deitar","😴","Deitar sem pensar em conta")];
    return [o("acordar","☀️","Acordar com vontade de orar"),o("chorar","😭","Chorar na presença de Deus"),o("saber","🗣️","Orar sabendo o que dizer")];
  } },
Q("t29-sentir","sentir","E você? O que mais quer sentir de novo?",[o("paz","🕊️","Paz"),o("alegria","😊","Alegria de verdade"),o("forca","💪","Força pra continuar"),o("presenca","✨","A presença de Deus perto de mim")],{grid:true}),
{ name:"t30-sonho-insercao", type:"insert", render:function(){
    return "<h2 class='fr-h2'>Guarda essa cena: <em>\""+esc(L("sonho"))+"\"</em>.</h2>"
      + "<div class='fr-card'>Não é pedir demais. É o coração de Deus pela sua casa. <b>\"Se não for o Senhor o construtor da casa, será inútil trabalhar na construção\" (Salmos 127:1).</b><br><br>A sua parte não é carregar tudo "+g("sozinha","sozinho")+". É entender o que tá acontecendo e fazer a sua parte com Deus. <span class='fr-hl'>E pra isso existe um jeito.</span></div>"
      + cta("CONTINUAR");
  }},
Q("t31-compromisso","compromisso","Se você entendesse hoje o que tá acontecendo na sua casa e o que fazer, você faria, nem que fosse 10 minutos por dia?",[
  o("sim","✅","Sim. É disso que eu preciso."),o("medo","🤲",function(){return "Sim, mas tenho medo de não conseguir "+g("sozinha","sozinho")+".";}),o("acho","🤔","Acho que sim. Quero entender melhor primeiro.")]),
Q("t32-frase","frase","Então vamos ao ponto. Qual dessas frases parece ter sido escrita sobre a SUA vida?",[
  o("C","💍",function(){return "Não aguento mais tanto desprezo. Eu só queria "+g("o meu marido","a minha esposa")+" de volta, de verdade, dentro de casa.";},{C:3},CASADA),
  o("CX","💔",function(){return Ele()+" foi embora, mas a dor ficou morando aqui dentro.";},{C:3},EX),
  o("F","👧","Eu sempre me culpo pelo meu filho. Às vezes não tenho força nem pra orar, só choro.",{F:3},FIL),
  o("O","🔥","Eu quero orar, mas não consigo começar. Parece que não tenho o que falar com Deus.",{O:3}),
  o("D","🧾","Paga uma conta, aparece outra. Tenho vergonha e não durmo pensando nisso.",{D:3})],{quoted:true, quote:true}),
{ name:"t33-loading", type:"loading", dur:4200, msgs:[[0,"Olhando com calma pra sua casa..."],[35,"Entendendo o que está acontecendo na sua casa..."],[75,"Separando o que fazer pra sua situação..."]] },
{ name:"t34-captura", type:"leadgate" },
{ name:"t35-resultado", type:"result" },
{ name:"t36-interesse", type:"q", key:"interesse", title:"Existe um jeito de orar pra cada situação, e ele começa exatamente pela que apareceu no seu resultado. É o que a Pra. Ezenete ensina há mais de 20 anos. Quer ver como funciona?",
  opts:[o("ver","👉","Quero ver"),o("entender","🤔","Quero entender melhor primeiro")] },
{ name:"t37-diferenca", type:"insert", render:function(){
    var lut = LUTOU(), sim = ORA()==="SIM";
    var headA = (lut||sim) ? "O jeito que te ensinaram" : "Quando ninguém te ensina";
    var a1 = lut ? "A mesma oração pra toda situação: campanha, campanha, campanha" : sim ? "O mesmo jeito de orar pra tudo" : "Não saber nem por onde começar";
    var colA = "<p>"+a1+"</p><p>Pedido vago: \"Senhor, abençoa a minha casa\"</p>"
      + ((lut && V("depois")==="melhorou") ? "<p>Alívio de uns dias, e volta tudo</p>" : "")
      + "<p>Cansaço e culpa: \"será que o problema sou eu?\"</p>";
    var colB = "<p>1. <b>Entender o que tá acontecendo de verdade</b>, do jeito que dói (\"quando "+ele()+" me ignora e não conversa comigo\", \"quando o meu filho não quer mais saber da igreja\")</p>"
      + "<p>2. <b>Usar a arma daquela situação</b>: a Palavra, o louvor, o silêncio, o perdão, o arrependimento, o jejum, uma atitude</p>"
      + "<p>3. <b>Falar a Palavra em voz alta e fazer</b> o Pra hoje</p>"
      + "<p>Oração com direção, que você consegue fazer todo dia</p>";
    return "<h2 class='fr-h2'>Olha a diferença:</h2>"
      + "<div class='fr-cmp'><div class='col a'><span class='ico'>😩</span><b class='h'>"+headA+"</b>"+colA+"</div><div class='col b'><span class='ico'>🗡️</span><b class='h'>A Arma Certa</b>"+colB+"</div></div>"
      + "<p class='fr-sub'>Por que nessa ordem? Porque quem não entende a causa ora sem saber o que pedir. <span class='fr-hl'>E oração sem atitude cansa.</span></p>"
      + cta("FAZ SENTIDO, CONTINUAR");
  }},
{ name:"t38-quem-ensina", type:"insert", render:function(){
    return "<span class='fr-stars'>★★★★★</span>"
      + "<h2 class='fr-h2'>Antes de te mostrar o que fazer, <em>conhece quem ensina.</em></h2>"
      + "<div class='fr-card'>A Pra. Ezenete Rodrigues está há mais de 20 anos à frente do Ministério de Intercessão da Estância Paraíso, em Sabará (MG). A caminhada dela está ligada à intercessão do Diante do Trono, na Igreja Batista da Lagoinha. Já formou mais de 200 mil pessoas na intercessão. É autora do livro <i>Uma Vida de Milagres</i>."
      + (V("origem")==="agora" ? "<br><br>Aos 15 anos, os médicos mandaram a família preparar o enterro. Deus a levantou. Essa história virou livro e virou um chamado: ensinar o povo de Deus a orar pela própria casa." : "")
      + "</div>"
      + "<p class='fr-kicker'>Dois relatos reais</p>"
      + relato("Eu fui grandemente abençoada, foi o sobrenatural de Deus. Pude entender a importância de ser filha. Glorioso","@maria.rgoncalves")
      + relato("Com certeza, avançamos 1000 côvados nessas águas do Trono de Deus.....dias indeléveis!!..... gratidão ao Senhor por todos vocês","@pra.tania_almeida")
      + "<p class='fr-legend'>Relatos reais publicados nas redes da Pra. Ezenete. São testemunhos pessoais e não representam promessa de resultado.</p>"
      + cta("QUERO SABER O QUE FAZER");
  }},
Q("t39-autocrenca","autocrenca","Agora que você entendeu o que está acontecendo: você acredita que a história da sua casa pode ser diferente daqui pra frente?",[o("creio","🙌","Creio"),o("quero","🙏","Quero crer. Preciso de direção.")]),
{ name:"t40-loading-plano", type:"loading", dur:3000, msgsFn:function(){ return [[0,"Separando o que fazer em \""+sitNome(computeScore().sit)+"\"..."],[40,"Escolhendo as situações que parecem com a sua..."],[85,"Pronto."]]; } },
{ name:"t41-pitch", type:"pitch" }
];
