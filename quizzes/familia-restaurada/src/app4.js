
/* ================= PONTUACAO (secao 6) ================= */
var ORDER = ["C","F","O","D"];
var FRASE_AREA = {C:"C", CX:"C", F:"F", O:"O", D:"D"};
function computeScore(){
  var sc = {C:0,F:0,O:0,D:0};
  STEPS.forEach(function(st){
    if(!st.key || !isVisible(st)) return;
    var v = V(st.key); if(v==null) return;
    (Array.isArray(v)?v:[v]).forEach(function(id){ var op = optOf(st.key,id); if(op && op.p){ Object.keys(op.p).forEach(function(k){ sc[k]+=op.p[k]; }); } });
  });
  if(!CAS()) sc.C = 0;   /* dignidade */
  if(!FIL()) sc.F = 0;
  var elig = ORDER.filter(function(a){ return (a!=="C"||CAS()) && (a!=="F"||FIL()); });
  var fa = FRASE_AREA[V("frase")] || null;
  var ranked = elig.slice().sort(function(x,y){
    if(sc[y]!==sc[x]) return sc[y]-sc[x];
    if(x===fa) return -1; if(y===fa) return 1;
    return ORDER.indexOf(x)-ORDER.indexOf(y);
  });
  var main = ranked[0];
  var second = (ranked[1] && sc[ranked[1]]>=2) ? ranked[1] : null;
  return { score:sc, main:main, second:second, sit:sitFor(main) };
}
function sitFor(area){
  if(area==="C"){ var c=V("cenaCas"); return {hum:"C1",naofala:"C2",deito:"C15",embora:"C7",oro:"C7",amor:"C10",dor:"C14",perdoar:"C14",paz:"C14"}[c] || (EX()?"C14":"C2"); }
  if(area==="F"){ return {criei:"F2",medo:"F7",ouve:"F8",bem:"F20"}[V("cenaFil")] || "F2"; }
  if(area==="O"){ return {teto:"O7",direcao:"O2",choro:"O2",comosei:"O2",vontade:"O5",parar:"O12",comecar:"O1",ensinou:"O1",cansada:"O15"}[V("jeitoOrar")] || "O2"; }
  return {paga:"D1",vergonha:"D16",seguro:"D11"}[V("dinheiro")] || "D1";
}

/* ================= OS 4 RESULTADOS (secao 7, doc v3: pagina de diagnostico "carta") ================= */
var AREA_NAME = {C:"Casamento", F:"Filhos", O:"Vida de Oração", D:"Financeiro"};
var AREA_NOME = {C:"Casamento", F:"Filhos", O:"Oração", D:"Financeiro"};
var MATERIAL = {C:"Casamento Restaurado", F:"Filhos Restaurados", O:"Vida de Oração Restaurada", D:"Financeiro Restaurado"};
var SUB = {C:"20 armas espirituais para restaurar o seu casamento", F:"20 armas espirituais para restaurar os seus filhos", O:"20 armas espirituais para restaurar a sua vida de oração", D:"20 armas espirituais para restaurar o seu financeiro"};
var BTN = {C:"QUERO AS 20 ARMAS PRO MEU CASAMENTO", F:"QUERO AS 20 ARMAS PRO MEU FILHO", O:"QUERO AS 20 ARMAS PRA MINHA VIDA DE ORAÇÃO", D:"QUERO AS 20 ARMAS PRO MEU FINANCEIRO"};
/* Variante masculina (7.1): sozinha->sozinho, calada->calado, mae->pai, perdoada->perdoado (+ adjetivos que falam dele). Pronomes do conjuge via ele()/dele()/g(). */
var MX_RULES = [[/sozinha/g,"sozinho"],[/calada/g,"calado"],[/perdoada/g,"perdoado"],[/ficando pequena/g,"ficando pequeno"],[/está cansada/g,"está cansado"],
  [/Escondida,/g,"Escondido,"],[/menos filha/g,"menos filho"],[/a salvadora/g,"o salvador"],[/está cheia/g,"está cheio"],[/culpada/g,"culpado"],
  [/quem foi ferida/g,"quem foi ferido"],[/Tem mulher que/g,"Tem homem que"],[/quem cuide dela/g,"quem cuide dele"],[/como mãe/g,"como pai"],
  [/A reação de mãe/g,"A reação de pai"],[/muita mãe/g,"muito pai"],[/separada/g,"separado"]];
function MX(s){ s = txt(s)||""; if(fem()) return s; MX_RULES.forEach(function(r){ s = s.replace(r[0], r[1]); }); return s; }
function T18(id){ return tentou().indexOf(id)>-1; }
function jovem(){ return ["a25","a33","a40"].indexOf(V("idade"))>-1; }  /* F20: ate 40 anos, sem "e netos" */
var LINHA_AREA = {
  C:function(sit){
    if(sit==="C14") return "";
    if(sit==="C7") return "<b>"+g("Ele não é o seu inimigo","Ela não é a sua inimiga")+"</b>, mesmo tendo ido embora. A luta é contra o que está prendendo a mente "+dele()+".";
    return "E guarda isto: <b>"+g("o seu marido não é o seu inimigo.","a sua esposa não é a sua inimiga.")+"</b> "+Ele()+" pode estar muito "+g("errado","errada")+". Mas a luta é contra o que está entrando pela brecha."; },
  F:function(){ return "<b>Ele responde pelas escolhas dele. Você responde pela sua parte.</b> E isso já tira um peso enorme das suas costas."; },
  O:function(){ return "<b>E não é Deus que desistiu de você.</b>"; },
  D:function(){ return "<b>Deus não te chamou pra barganhar. Chamou pra trazer tudo pra luz, com Ele.</b>"; }
};
var FRASE_FIM = {
  C:function(){ return EX() ? "E o fim de um casamento quase nunca deixa uma dor só. Tem a mágoa, a saudade, a raiva, o recomeço." : "E casamento quase nunca tem uma situação só. Tem a palavra que feriu, o silêncio, a frieza, a desconfiança, a mágoa que não sai."; },
  F:function(){ return "E com filho quase nunca é uma situação só. Tem a igreja que ficou pra trás, as amizades, a rebeldia, o medo de madrugada."; },
  O:function(){ return "E o que afasta a gente da oração quase nunca é uma coisa só: a vontade que some, a rotina que engole, a crise que rouba, não saber o que dizer."; },
  D:function(){ return "E aperto de dinheiro quase nunca vem sozinho. Vem a dívida, a vergonha, o peso de segurar tudo, a noite sem dormir."; }
};
function AREA2_TXT(a){ return {C:(EX()?"a dor do casamento que acabou":"o seu casamento"), F:"o seu filho", O:"a sua vida de oração", D:"as contas da casa"}[a]; }
function sitTitulo(id){ var s = SITS[id]; return s ? txt(s.t) : ""; }
/* Cada situacao: t (titulo), d1 (cena), d2 [antes, destaque em negrito, depois], pq (por que ainda nao mudou), arma, princ (principio), passo, voz. */
var SITS = {
  C1:{ t:function(){return "Quando "+ele()+" me feriu com palavras";},
    d1:function(){return "Não é só o que "+ele()+" fala. É o jeito. Aquele tom de desprezo que dói mais que a própria palavra. E a frase fica martelando depois, na hora da louça, na hora de deitar.";},
    d2:function(){return ["E tem uma coisa que quase ninguém percebe: a ferida não fica no dia em que a palavra foi dita.","De tanto voltar na sua cabeça, ela começa a parecer verdade sobre você.","E você vai ficando pequena dentro da própria casa. É por essa ferida aberta que o inimigo entra. Não pela boca "+dele()+". Pelo que ficou em você."];},
    pq:function(){return "Quando dói assim, parece que só existem dois caminhos: devolver na mesma moeda ou engolir calada. Os dois deixam a ferida aberta."+(T18("conversei")?" Por isso cada discussão deixa a casa mais pesada.":"")+(T18("chorei")?" E engolir chorando escondido só empurra a dor mais pra dentro.":"");},
    arma:"entregar a ferida e guardar a própria boca.",
    princ:function(){return "Não é revidar. Também não é fingir que não doeu. É levar a ferida pra Deus antes que ela vire raiz. A palavra "+dele()+" feriu. A sua pode curar, ou pode abrir mais uma brecha.";},
    passo:function(){return horaTxt()+", escreva num papel a frase que mais te feriu, do jeito que "+ele()+" falou. Leia pra Deus em voz alta e diga: \"Senhor, isso doeu. Eu não vou deixar essa frase morar em mim\". Depois rasgue o papel.";},
    voz:"O que foi dito contra mim não define quem eu sou." },
  C2:{ t:function(){return "Quando "+ele()+" me ignora e não conversa comigo";},
    d1:function(){return Ele()+" chega e o que você recebe é um \"oi\", quando recebe. Você puxa assunto e volta um \"hum\". E começa a se perguntar se ainda existe casamento, ou só duas pessoas dividindo o mesmo teto.";},
    d2:function(){return ["O que você ainda não enxergou é que esse silêncio quase nunca é só contra você. Pode ser cansaço, vergonha, mágoa, pressão lá fora. Só que, do lado de cá, ele costuma virar outra coisa: a gente começa a se culpar, a medir cada palavra, a se sentir sozinha dentro de casa.","É assim que o silêncio vira muro. E o inimigo não precisa de briga nenhuma pra separar uma casa. O muro basta.",""];},
    pq:function(){return "A reação natural é insistir: cobrar conversa, mandar indireta, falar mais alto. Só que porta fechada por dentro não abre no grito. Cobrança fecha mais."+(T18("conversei")?" E você já viu isso acontecer: quanto mais cobra, mais "+ele()+" se fecha.":"");},
    arma:"o silêncio diante de Deus, e a paciência.",
    princ:function(){return "Parece o contrário do que você quer, mas é aqui que começa: falar com Deus sobre "+ele()+" antes de falar com "+ele()+". Tem tempo de calar e tempo de falar. Deus sabe abrir a porta que você não consegue abrir na força.";},
    passo:function(){return "Hoje, não cobre nada. Faça um gesto de cuidado em silêncio: um café do jeito que "+ele()+" gosta, uma roupa passada, um bilhete curto de \"estou orando por você\". E não comente. "+horaTxt()+", fique cinco minutos em silêncio diante de Deus. Diga só: \"Senhor, estou aqui\". E espere.";},
    voz:function(){return "Deus fala com "+ele()+" onde a minha voz não chega.";} },
  C15:{ t:function(){return "Quando eu me sinto "+g("sozinha","sozinho")+" dentro do casamento";},
    d1:function(){return Ele()+" está em casa. Dorme do seu lado. E mesmo assim você deita sozinha. Tem alguém do seu lado, e parece que não tem ninguém.";},
    d2:function(){return ["Tem uma coisa que quase ninguém fala:","a solidão dentro do casamento dói mais que a de quem mora sozinha, porque vem com vergonha.",g("Tem marido","Tem esposa")+", então parece que não tem direito de se sentir assim. Aí a gente engole, resolve tudo, carrega tudo. E um coração vazio por muito tempo começa a mendigar o amor que não chega, e a endurecer quando ele não vem. É nessa secura que a brecha abre."];},
    pq:function(){return "O jeito natural é esperar que "+ele()+" perceba. Cobrar atenção, ou desistir e se fechar também. Só que ninguém consegue encher um vazio que não foi feito pra ser preenchido por "+ele()+".";},
    arma:"a intimidade com Deus.",
    princ:function(){return "Antes de esperar tudo "+dele()+", deixar Deus preencher o lugar que só Ele preenche. Quem está cheia de Deus para de mendigar amor e passa a oferecer. E isso muda o clima de uma casa.";},
    passo:function(){return horaTxt()+", feche a porta e faça o caminho que a Pra. Ezenete ensina, nessa ordem: agradeça por uma coisa, conte pra Deus como você se sente, sem enfeitar, coloque uma música de adoração e fique cinco minutos em silêncio. Só depois peça. E anote o que vier.";},
    voz:"Deus me vê. Eu não sou invisível pra Ele." },
  C7:{ t:function(){return "Quando "+ele()+" saiu de casa";},
    d1:function(){return EX() ? "O casamento acabou no papel, mas não acabou aí dentro. Mesmo separada, você ainda ora por "+ele()+". Isso diz muito sobre o tamanho do amor que ficou."
                              : "A mala saiu pela porta, ou "+ele()+" foi saindo aos poucos. Agora o lado "+dele()+" da cama está vazio, e a casa ficou grande demais. E você não aceita que acabou.";},
    d2:function(){return ["A vontade é correr atrás, ou provar que "+ele()+" errou. O que quase ninguém percebe é que","a batalha não está na porta de casa. Está na mente "+dele()+":","nos argumentos que prendem "+ele()+" lá fora, nas vozes ao redor. E ali ninguém entra no grito. Entra de joelhos."];},
    pq:function(){return "Mensagem, cobrança, ameaça, implorar: tudo isso tenta abrir no braço uma porta que só Deus alcança. Você não controla a vontade "+dele()+". E nem precisa."+(T18("conversei")?" Você já conversou, já cobrou, e viu que por aí não muda.":"");},
    arma:function(){return "ficar na brecha pela mente "+dele()+".";},
    princ:function(){return "Interceder é se colocar entre Deus e "+ele()+": orar pela mente "+dele()+", pelas pessoas ao redor "+dele()+", pela salvação "+dele()+". Com a Palavra na boca, e não implorando. Pedir com fé é diferente de implorar com desespero. Deus vai aonde você não pode ir.";},
    passo:function(){return "Escolha um horário fixo pra orar por "+ele()+" e marque no celular como compromisso. Hoje, nesse horário, leia em voz alta 2 Coríntios 10:4-5 colocando o nome "+dele()+": \"as armas com que eu luto são poderosas em Deus pra destruir as fortalezas na mente de ___\".";},
    voz:"Deus vai aonde eu não posso ir." },
  C10:{ t:"Quando o nosso casamento esfriou",
    d1:"Ainda tem amor aí. Mas virou rotina: conversa sobre conta, sobre o que falta no mercado. Carinho de verdade, olhar nos olhos, faz tempo. Dois cansados dividindo a mesma casa.",
    d2:function(){return ["E o perigo aqui é justamente não ter briga.","Frieza não faz barulho, então ninguém corre pra apagar.","Ela vai esfriando devagar, até o dia em que vocês viram dois estranhos dentro de casa. Casamento frio não acaba numa explosão. Acaba no silêncio da rotina. E essa é uma brecha que quase ninguém vigia."];},
    pq:function(){return "O jeito natural é esperar a vontade voltar sozinha, ou esperar que "+ele()+" tome a iniciativa. Só que fogo não volta esperando. Volta quando alguém coloca lenha.";},
    arma:"voltar ao primeiro amor, com atitude.",
    princ:"Em Apocalipse 2, Jesus dá o remédio pra quem abandonou o primeiro amor: lembrar de onde caiu e voltar a praticar as primeiras obras. Serve pro casamento também. Não é sentimento primeiro. É gesto primeiro, e o sentimento vem atrás.",
    passo:function(){return "Faça hoje uma \"primeira obra\", daquelas do começo: um bilhete no bolso "+dele()+", um convite pra um café a dois, ou uma foto antiga mandada pra "+ele()+" com a frase \"lembra disso?\". "+horaTxt()+", entregue o seu casamento de novo a Deus, com as suas palavras.";},
    voz:"O Espírito Santo sopra sobre as brasas do meu casamento." },
  C14:{ t:"Quando eu não consigo perdoar",
    d1:function(){ var c = V("cenaCas");
      if(c==="perdoar") return "Você sabe o que "+ele()+" fez. E toda vez que lembra, a raiva sobe de novo, como se tivesse sido ontem.";
      if(c==="paz") return "Você quer recomeçar. Quer paz. Mas alguma coisa do que ficou pra trás ainda não te deixa virar a página.";
      return "O casamento acabou. A dor não. Ela volta quando você vê uma foto, quando o nome "+dele()+" aparece, quando alguém pergunta."; },
    d2:function(){return ["O que quase ninguém te explica é que","a mágoa não prende quem feriu. Prende quem foi ferida.","Uma parte de você ficou lá, no dia da dor. É o que a Palavra chama de raiz de amargura: ela brota escondida e vai contaminando o resto. A paz, a oração, até o jeito de olhar pra frente."];},
    pq:"Tem mulher que já disse \"eu perdoo\" mil vezes e continua sentindo a mesma coisa, e acha que o problema é ela. Não é. É que ensinaram o perdão como sentimento. E sentimento não obedece.",
    arma:"o perdão como decisão.",
    princ:function(){return "Perdoar não é dizer que não doeu. Não é voltar a confiar. Não é deixar alguém continuar te ferindo. É tirar "+ele()+" da sua prisão interior e entregar a Deus o direito de julgar. É uma decisão, às vezes tomada todo dia, até o sentimento acompanhar.";},
    passo:function(){return horaTxt()+", pegue uma folha e escreva o que "+ele()+" fez que te feriu. Sem filtro. Leia cada item em voz alta e diga: \"Eu perdoo ___ por isso. Eu entrego a Ti, Senhor, o direito de julgar\". Depois rasgue a folha e anote a data de hoje.";},
    voz:"Eu entrego a Deus o direito de julgar. Eu estou livre." },
  F2:{ t:"Quando eu criei no caminho, e mesmo assim ele se desviou",
    d1:"Você levou pela mão pra igreja. E mesmo assim ele foi pra um caminho que você nunca imaginou. Agora uma pergunta não te deixa em paz: \"onde foi que eu errei?\". E a cabeça volta em cada bronca, cada ausência, cada decisão.",
    d2:function(){return ["O que você ainda não enxergou é que","essa culpa parece humildade, mas não é. É uma arma apontada pra você.","Quem passa o dia se acusando não tem força pra orar pelo filho. E a Palavra diz quem é o acusador. Enquanto você carrega essa culpa, a oração pelo seu filho fica travada. É exatamente isso que o inimigo quer."];},
    pq:function(){return "A reação de mãe é tentar consertar: conversar, aconselhar, chorar, cobrar. Tudo por amor. Mas tudo isso feito debaixo de culpa sai pesado, e ele sente."+(T18("conversei")?" Você já conversou, já cobrou, já deu bronca. E ele continua longe.":"");},
    arma:"deixar Deus tirar a culpa das suas costas.",
    princ:"Se você errou em alguma coisa, e todo pai e toda mãe erra, existe perdão. Condenação, não. O \"ensina a criança no caminho\" mostra um caminho de sabedoria. Não é uma sentença contra você. Você intercede de pé, perdoada, e não debaixo da acusação.",
    passo:function(){return horaTxt()+", escreva num papel tudo aquilo de que você se acusa como mãe. Leia cada item diante de Deus: onde houve erro, peça perdão; onde não houve, diga em voz alta \"isso eu não aceito\". Depois rasgue e escreva no lugar Romanos 8:1: \"Agora já não há condenação para os que estão em Cristo Jesus\". Cole onde você vai ver todo dia.";},
    voz:"Eu não carrego a culpa das escolhas do meu filho." },
  F7:{ t:"Quando o meu filho anda com más companhias",
    d1:function(){return "Ele sai e o seu coração vai junto. Cada demora, cada mensagem sem resposta, e a cabeça já imagina o pior."+((V("lutas")||[]).indexOf("f_vicio")>-1?" E as amizades mudaram. Você já não sabe direito quem está do lado dele.":"");},
    d2:function(){return ["O que quase ninguém percebe é que","o medo empurra a gente pra dois extremos: vigiar e proibir tudo, ou se calar pra não brigar.","Os dois abrem distância. E um filho longe de casa por dentro fica muito mais perto do que tem lá fora. A luta pela identidade dele não é com os amigos. É espiritual, e começa dentro de casa."];},
    pq:"Sermão, proibição, desconfiança: tudo nasce do amor e do medo. Só que sermão afasta. Presença aproxima.",
    arma:"orar pelos lugares por onde ele anda, e chegar perto dentro de casa.",
    princ:"São duas mãos. Uma é a oração que entra onde você não entra: a escola, a rua, o trabalho, o celular. A outra é trazer ele pra perto. Filho perto de casa por dentro é muito mais difícil de ser levado.",
    passo:function(){return "Chame ele pra um lanche ou uma volta, só vocês dois, sem cobrança nenhuma. Na conversa, pergunte o nome de um amigo de quem ele gosta muito. "+horaTxt()+", ore por esse amigo pelo nome.";},
    voz:"O Senhor guarda a saída e a chegada do meu filho." },
  F8:{ t:"Quando o meu filho é rebelde e me enfrenta",
    d1:"Qualquer conversa vira briga. Você fala, e ele não ouve. Tem dia que você não reconhece o filho que carregou no colo.",
    d2:function(){return ["O que quase ninguém te conta é que, nessa hora,","a briga já não é sobre o assunto. É sobre quem ganha.","E quando vira queda de braço, os dois perdem: ele se fecha mais, e a sua voz vai perdendo o peso dentro de casa. Autoridade que precisa gritar já está perdendo a guerra."];},
    pq:"O jeito natural é falar mais, falar mais alto, repetir o sermão. Pelo filho que não quer ouvir, a arma quase nunca é falar mais.",
    arma:"autoridade com mansidão, e a estratégia que vem de Deus.",
    princ:"A Pra. Ezenete conta que, numa fase de guerra dentro de casa com o filho, ela parou e pediu a Deus uma estratégia. E Deus mostrou pra ela uma coisa que ela não estava enxergando. Cada filho tem um jeito. O que abre um, fecha o outro. Por isso a estratégia vem de Deus, e não do grito.",
    passo:function(){return "Faça hoje uma coisa com ele em que você não vai corrigir nada. Nem a roupa, nem o quarto, nem o jeito de falar. Só estar junto. "+horaTxt()+", peça a Deus uma estratégia pra esse filho e anote o que vier.";},
    voz:"A minha autoridade não precisa de grito pra ser autoridade." },
  F20:{ t:function(){ return jovem() ? "Quando vamos consagrar os nossos filhos" : "Quando vamos consagrar os nossos filhos e netos"; },
    d1:"Graças a Deus, o seu filho está bem. E mesmo assim tem uma inquietação aí dentro: você vê o que o mundo tem feito com tanto filho por aí, e quer cobrir o seu antes que a vida aperte.",
    d2:function(){return ["Você está enxergando uma coisa que muita mãe só enxerga depois:","o alvo do inimigo não é só a casa de hoje. É a geração.","E a hora de cobrir é justamente quando está tudo bem, não quando já apertou."];},
    pq:"A maioria das famílias só ora forte pelos filhos quando a crise chega. Aí é correr atrás. Você tem a chance de fazer o contrário.",
    arma:"a bênção falada sobre ele.",
    princ:"Ana recebeu o filho e o entregou ao Senhor. Consagrar é reconhecer em voz alta que o seu filho é herança de Deus, e entregar a Ele o que já é Dele. A Pra. Ezenete conta que o pai dela a gerava em oração no culto das cinco da manhã. Hoje ela é a oração do pai.",
    passo:"Abençoe o seu filho com Números 6:24-26, trocando o \"te\" pelo nome dele: \"O Senhor te abençoe e te guarde…\". Se der, com a mão sobre ele. Se ele estiver longe, faça sobre uma foto e mande uma mensagem dizendo que orou por ele hoje.",
    voz:"Os meus filhos são herança do Senhor." },
  O7:{ t:"Quando eu oro e parece que Deus não me ouve",
    d1:"Você ora, e parece que a oração bate no teto e volta. O mesmo pedido, de novo e de novo. E vem aquele pensamento que dá medo de falar em voz alta: \"será que Deus parou de me ouvir?\".",
    d2:function(){return ["O que quase ninguém percebe é que","o perigo aqui não é a demora. É o que a demora vai fazendo com você.","O desânimo chega devagar e sussurra que não adianta. E desistir no meio é abortar o que estava sendo gerado. O inimigo não consegue impedir Deus de ouvir. Então ele tenta convencer você a parar."];},
    pq:"O jeito natural é orar mais alto, mais tempo, ou pedir pra mais gente orar junto. Só que o que falta não é volume. É saber que a resposta tem tempo, e o que fazer enquanto ela não chega.",
    arma:"perseverar e confiar no tempo de Deus.",
    princ:"Daniel orou e ficou vinte e um dias sem ver resposta. Depois soube que tinha sido ouvido desde o primeiro dia (Daniel 10:12). A demora não é silêncio de Deus. E a sua fé não fica na resposta. Fica em Deus.",
    passo:function(){return horaTxt()+", escreva a lista dos pedidos pelos quais você ora há muito tempo, cada um com a data em que começou. Ao lado de cada um, escreva: \"Deus ouviu desde o primeiro dia\". Depois leia Daniel 10:12 em voz alta.";},
    voz:"A demora não é silêncio de Deus. É o tempo de Deus." },
  O2:{ t:"Quando eu não sei o que falar com Deus",
    d1:function(){ var j = V("jeitoOrar");
      if(j==="choro") return "Você chega diante de Deus e as palavras não saem. Só saem lágrimas. Você não sabe nem o que pedir.";
      if(j==="comosei") return "Você quer falar com Deus, mas não sabe como. Fala do jeito que sabe, e fica achando que é pouco.";
      return "Você ora, mas sente que ora sem direção. As mesmas frases de sempre, e a sensação de que não está chegando a lugar nenhum."; },
    d2:function(){return ["E tem uma coisa que ninguém te disse:","isso não é problema de fé.","Muita gente acha que oração de verdade é aquela cheia de palavras bonitas, da irmã que fala sem parar. Perto disso, a própria oração parece pobre. E essa vergonha vai afastando a gente de Deus, um pouquinho por dia."];},
    pq:"O jeito natural é se esforçar pra falar mais, ou procurar vídeo de como orar. Só que o que falta não é esforço. São palavras. E Deus já te deu as Dele.",
    arma:"orar a Palavra.",
    princ:"Quando faltam palavras, você usa as de Deus. Os próprios discípulos pediram \"Senhor, ensina a gente a orar\", e Jesus deu uma oração pronta. Os Salmos foram escritos pra serem orados. Isso não é preguiça espiritual. É sabedoria.",
    passo:function(){return horaTxt()+", abra o Salmo 23 e leia em voz alta, devagar. Depois de cada versículo, pare e diga uma frase sua pra Deus. Por exemplo: \"O Senhor é o meu pastor. Pai, cuida de mim hoje\". E anote qual versículo falou mais com você.";},
    voz:"Quando me faltam palavras, eu oro a Palavra." },
  O5:{ t:"Quando eu perdi a vontade de orar",
    d1:"Não é que você não saiba orar. É que a vontade sumiu. Parece que não tem mais o que falar com Deus. E isso dá medo, porque você sabe que precisa.",
    d2:function(){return ["O que a Pra. Ezenete ensina muda tudo aqui:","a fé não esfria. O que acontece é distância.","A fé que Deus colocou em você não morreu. E isso é uma boa notícia, porque distância dá pra voltar. O perigo é ficar esperando a vontade voltar sozinha. Enquanto você espera sentir, a distância cresce."];},
    pq:"O jeito natural é esperar o dia em que a vontade volta, ou se forçar e se sentir culpada quando não consegue. As duas coisas cansam.",
    arma:"decidir antes de sentir, e falar com a própria alma.",
    princ:"O salmista fazia isso: conversava com a própria alma e mandava ela esperar em Deus (Salmos 42:11). O sentimento vem depois do passo, e não antes.",
    passo:function(){return horaTxt()+", diga pra Deus em voz alta: \"Eu não tenho vontade, mas eu estou aqui\". Depois coloque um louvor de que você gosta e cante junto, do começo ao fim, mesmo sem vontade.";},
    voz:"Minha alma, espere em Deus. Eu ainda vou louvá-Lo." },
  O12:{ t:"Quando a rotina não me deixa tempo para Deus",
    d1:"Você quer orar mais. De verdade. Mas o dia engole tudo. E fica aquela sensação de estar devendo pra Deus.",
    d2:function(){return ["O que quase ninguém percebe é","a promessa escondida no \"quando\": quando as coisas acalmarem, quando a vida der uma folga.","Essa fase não chega. A vida com Deus não espera a fase ideal. E cada dia esperando a hora certa, a culpa cresce e a oração diminui."];},
    pq:"O jeito natural é prometer uma hora inteira de oração, que nunca cabe no dia. Aí não cumpre, se sente mal e desiste de novo.",
    arma:"dar um lugar e uma hora pra Deus dentro da rotina de verdade.",
    princ:"Não é largar as tarefas. É dar a Deus um lugar fixo no meio delas, mesmo pequeno, e espalhar oração pelo resto do dia. Jesus disse a Marta que só uma coisa era necessária.",
    passo:"Escolha uma âncora que já existe no seu dia: o café, o banho, o ônibus. Escreva num papel: \"Este é o meu horário com Deus\". Amanhã, nessa âncora, cumpra cinco minutos. Só cinco.",
    voz:"A minha vida com Deus não espera a fase ideal." },
  O1:{ t:"Quando eu quero orar, mas não consigo começar",
    d1:function(){ return V("jeitoOrar")==="ensinou"
      ? "Você quer falar com Deus, mas ninguém nunca te mostrou por onde começar. E fica a sensação de que todo mundo sabe, menos você."
      : "Você sente o desejo. Sabe que precisa. \"Agorinha eu oro.\" E o agorinha não chega. O dia passa e fica pra amanhã."; },
    d2:function(){return ["O que trava não é falta de fé.","É o tamanho que a oração ganhou.","Muita gente imagina que orar de verdade é uma hora de joelho, com as palavras certas, no lugar certo. Como isso nunca cabe no dia, nunca começa. E quanto mais o tempo passa, mais difícil parece."];},
    pq:"O jeito natural é esperar o momento certo, ou prometer que amanhã vai ser diferente. Só que o momento certo não aparece sozinho.",
    arma:"começar pequeno, antes de tudo.",
    princ:"A Pra. Ezenete ensina: cai da cama já de joelhos. Cinco minutos, dez, não importa. O que importa é que, antes de qualquer coisa, você diz a Deus que depende Dele. Pequeno e fiel vale mais que grande e nunca.",
    passo:"Hoje à noite, coloque a Bíblia em cima do seu celular. Amanhã, antes de pegar o celular, sente na beirada da cama e diga: \"Senhor, hoje eu começo contigo\". Só isso. Faça sete dias seguidos. Se falhar um, continue no outro.",
    voz:"O meu tempo com Deus começa agora, não depois." },
  O15:{ t:"Quando a crise da minha casa está roubando a minha oração",
    d1:"A casa aperta tanto que não sobra força nem pra orar. Você está cansada demais. E às vezes nem sabe mais o que pedir.",
    d2:function(){return ["Quando a casa aperta desse jeito,","a oração vira mais um peso na lista.","Como se tudo dependesse de você. Não depende. Você não é a salvadora da sua casa. Jesus é."];},
    pq:"O jeito natural é achar que precisa de mais força pra orar mais. Só que ninguém sai do cansaço colocando mais peso nas costas.",
    arma:"entregar o peso a Deus, e deixar outras pessoas orarem com você.",
    princ:"A Bíblia manda lançar sobre Deus toda a ansiedade, e manda também carregar o fardo uns dos outros. A sua parte agora não é fazer mais. É entregar, e deixar outras pessoas carregarem junto.",
    passo:function(){return horaTxt()+", diga a Deus com sinceridade: \"Senhor, as minhas forças acabaram\". Isso não é falta de fé. Depois mande uma mensagem pra duas ou três pessoas de confiança pedindo que orem por você nesta semana.";},
    voz:"Eu não carrego este fardo sozinha." },
  D1:{ t:"Quando as dívidas tiram a minha paz",
    d1:function(){ return (V("dinheiro")==="paga"?"Paga uma conta, aparece outra. ":"")+"O dinheiro virou um peso que não sai da cabeça."+(V("frase")==="D"?" E de noite, quando devia descansar, é nisso que você pensa.":""); },
    d2:function(){return ["O que quase ninguém percebe é que","o medo cresce no escuro.","Enquanto a dívida não tem tamanho, ela parece impagável. Aí a gente evita olhar: o boleto vai pra gaveta, o aplicativo do banco fica fechado. E quanto menos olha, maior ela fica por dentro. Não é só o dinheiro que aperta. É a paz que vai embora."];},
    pq:"O jeito natural é pedir um milagre e torcer. Ou trabalhar mais e não olhar. Só que o que foge da luz continua crescendo.",
    arma:"trazer tudo pra luz e entregar a ansiedade.",
    princ:"Filipenses 4 não diz \"não tenha problemas\". Diz: leve tudo a Deus em oração, com gratidão, e a paz Dele vai guardar o seu coração. Colocar a dívida no papel diante de Deus não é falta de fé. É parar de fugir.",
    passo:function(){return horaTxt()+", pegue uma folha e escreva no alto: \"Senhor, eu olho para isso contigo\". Embaixo, comece a lista do que você deve: pra quem, quanto, quantas parcelas faltam. Mesmo que não termine hoje, comece.";},
    voz:"Eu não fujo mais. Eu trago tudo pra luz, diante de Deus." },
  D16:{ t:"Quando eu tenho vergonha de dever e de pedir ajuda",
    d1:"Ninguém sabe o tamanho do buraco. E a vergonha pesa quase mais que a própria dívida.",
    d2:function(){return ["O que a vergonha faz é","mandar a gente se esconder.","Foi assim no jardim, com Adão e Eva. Escondida, a gente passa aperto calada, fica longe de quem podia ajudar, e ainda carrega uma culpa que parece espiritual: \"crente endividado envergonha o nome do Senhor\". Mas estar devendo não te faz menos filha."];},
    pq:"O jeito natural é resolver sozinha, em segredo, antes que alguém descubra. Só que o segredo é justamente o que dá força pra vergonha.",
    arma:"receber a graça e sair do esconderijo.",
    princ:"Deus foi atrás de Adão e Eva quando eles se esconderam. Em Cristo não há condenação. A resposta pra dívida não é o isolamento. É a verdade, a humildade e um plano, um passo de cada vez.",
    passo:"Diga a Deus, com as suas palavras, do que você tem vergonha. Chame pelo nome. Depois mande uma mensagem pra alguém maduro na fé: \"Estou passando por um aperto e preciso de oração. Posso conversar com você?\".",
    voz:"Em Cristo Jesus não há condenação pra mim." },
  D11:{ t:function(){return "Quando sou eu que seguro a casa "+g("sozinha","sozinho");},
    d1:"Tudo passa por você. Conta, compra, problema, o mês que vem. E você está cansada. Quem cuida de todo mundo quase nunca tem quem cuide dela.",
    d2:function(){return ["O que quase ninguém percebe é que","esse cansaço não é só do corpo. É de carregar sozinha o que não foi feito pra uma pessoa só.","Moisés tentou, e ouviu do sogro: \"o que você está fazendo não é bom, você vai se esgotar\". Quem segura tudo acaba com vergonha de pedir ajuda, e a oração vira mais uma obrigação."];},
    pq:"O jeito natural é aguentar mais um pouco. Trabalhar mais, dormir menos, não reclamar. Só que força tem limite.",
    arma:"entregar o peso a Deus e aceitar ajuda.",
    princ:"Jesus disse: \"Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso\". Não é o descanso de parar de trabalhar. É parar de carregar sozinha o que é de Deus carregar, e deixar outras pessoas dividirem o peso.",
    passo:function(){return horaTxt()+", faça uma lista do que está nas suas costas. Em oração, entregue a Deus, item por item, o que só Ele resolve. E escolha uma tarefa pra pedir ajuda hoje: um filho, um parente, uma irmã da igreja. Uma só.";},
    voz:"Eu não preciso carregar tudo sozinha." }
};
/* 7.1 · 3. Bloco da oracao (entra logo depois do "Por que ainda nao mudou") */
var DEPOIS_LINHA = {melhorou:"Por isso melhora uns dias e volta tudo.", nada:"Por isso parece que Deus não te ouve. Ele ouve. A arma é que era outra.", cansando:"Por isso você foi cansando. Não era pra carregar desse jeito.", piorou:"Por isso, em vez de melhorar, piorou."};
function blocoOracao(nome){
  if(LUTOU()){
    var t = tentou(), feitos = [];
    var todos = t.indexOf("tudo")>-1;  /* "Tudo isso, mais de uma vez" = campanha, jejum e madrugada */
    if(todos || t.indexOf("campanha")>-1) feitos.push("fez campanha");
    if(todos || t.indexOf("jejum")>-1) feitos.push("jejuou");
    if(todos || t.indexOf("madrugada")>-1) feitos.push("passou madrugada de joelho");
    if(!feitos.length) feitos.push("fez campanha");  /* veio da T8 */
    return "<b>"+(nome?nome+", escuta":"Escuta")+": não foi falta de fé.</b> Quem já "+joinE(feitos)+" por essa casa não tem fé pequena. Você lutou com a arma que te ensinaram. Só que essa situação pede outra."
      + (DEPOIS_LINHA[V("depois")] ? " "+DEPOIS_LINHA[V("depois")] : "");
  }
  if(ORA()==="SIM") return "<b>E não é falta de oração.</b> Você ora. Mas orar do mesmo jeito pra tudo é como tentar abrir todas as portas da casa com uma chave só.";
  return "<b>E se a oração anda difícil, ou nunca foi costume, isso não quer dizer que a sua fé acabou.</b> Quer dizer que ninguém te mostrou o que fazer numa situação como essa. Dá pra começar de onde você está. Hoje.";
}
function cuidado(r){
  var l = V("lutas")||[];
  if(r.main==="C" && (r.sit==="C1" || l.indexOf("c_desprezo")>-1))
    return fem() ? "Se além das palavras existe agressão, ameaça ou medo dentro de casa, a sua segurança vem primeiro. Ligue 180 (Central de Atendimento à Mulher, gratuito, 24 horas) ou 190 em emergência. Orar e se proteger andam juntos."
                 : "Se além das palavras existe agressão, ameaça ou medo dentro de casa, a sua segurança vem primeiro. Ligue 190 em emergência. Orar e se proteger andam juntos.";
  if(r.main==="F" && (l.indexOf("f_vicio")>-1 || V("cenaFil")==="medo"))
    return "Se o seu filho está no vício, em depressão ou em risco, oração e ajuda profissional andam juntas: CAPS, médico, psicólogo. Em crise, CVV 188 (gratuito, 24 horas).";
  if(r.main==="O" && l.indexOf("o_longe")>-1 && l.indexOf("o_vontade")>-1)
    return "Se o desânimo virou uma tristeza que não passa, falta de vontade de viver ou crise de ansiedade, procure também um médico ou psicólogo. Um não substitui o outro. Em crise, CVV 188.";
  if(r.main==="D")
    return "Se o aperto está tirando o seu sono a ponto de você pensar em desistir, fala com alguém hoje: CVV 188, gratuito, 24 horas. E procure orientação financeira: pedir ajuda é sabedoria.";
  return "";
}
