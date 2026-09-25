
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
  var second = null;
  if(ranked[1]){ if(ge(sc[ranked[1]], 2)){ second = ranked[1]; } }
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
var SUB = {C:"20 armas espirituais para as situações do seu casamento", F:"20 armas espirituais para as situações dos seus filhos", O:"20 armas espirituais para as situações da sua vida de oração", D:"20 armas espirituais para as situações do seu financeiro"};
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
    if(sit==="C7") return "<b>"+g("Ele não é o seu inimigo","Ela não é a sua inimiga")+"</b>, mesmo tendo ido embora.";
    return "<b>"+g("O seu marido não é o seu inimigo.","a sua esposa não é a sua inimiga.")+"</b> A luta é contra o que entra pela brecha.";
  },
  F:function(){ return "<b>Ele responde pelas escolhas dele. Você, pela sua parte.</b>"; },
  O:function(){ return "<b>E não é Deus que desistiu de você.</b>"; },
  D:function(){ return "<b>Deus não te chamou pra barganhar. Chamou pra trazer tudo pra luz, com Ele.</b>"; }
};
function AREA2_TXT(a){ return {C:(EX()?"a dor do casamento que acabou":"o seu casamento"), F:"o seu filho", O:"a sua vida de oração", D:"as contas da casa"}[a]; }
function sitTitulo(id){ var s = SITS[id]; return s ? txt(s.t) : ""; }
function sitNome(id){ var s = SITS[id]; return s ? txt(s.nome) : ""; }
/* t = título "Quando…" (capítulo do PDF). nome = {NOME_SITUACAO}. frase = uma linha. */
var SITS = {
  C1:{
    t:function(){ return "Quando "+ele()+" me feriu com palavras"; },
    nome:"Palavras que ainda doem",
    frase:function(){ return Ele()+" falou uma vez, e a frase fica tocando na sua cabeça até parecer verdade sobre você."; },
    sinais:[
      {i:"bubble", t:"O tom de desprezo dói mais que a palavra"},
      {i:"refresh", t:"A frase volta na louça, na hora de deitar"},
      {i:"user", t:"Você vai ficando pequena dentro de casa"}
    ],
    virada:function(){ return "A ferida não fica no dia em que "+ele()+" falou. De tanto voltar, ela vira verdade sobre você. É por ela que o inimigo entra."; },
    tentou:["Devolver na mesma moeda","Engolir calada"],
    chave:"Os dois deixam a ferida aberta.",
    arma:"Entregar a ferida e guardar a boca",
    princ:"Levar a dor pra Deus antes que ela vire raiz.",
    passo:[
      function(){ return "Escreva a frase que mais te feriu, do jeito que "+ele()+" falou."; },
      'Leia pra Deus: "Isso doeu. Essa frase não vai morar em mim."',
      "Rasgue o papel."
    ],
    voz:"O que foi dito contra mim não define quem eu sou.",
    acao:"tear"
  },
  C2:{
    t:function(){ return "Quando "+ele()+" me ignora e não conversa comigo"; },
    nome:"O muro do silêncio",
    frase:function(){ return Ele()+" chega, dá um \"oi\" quando dá, e você fica medindo cada palavra dentro da própria casa."; },
    sinais:[
      {i:"door", t:function(){ return Ele()+" chega e mal fala"; }},
      {i:"bubble", t:'Você puxa assunto, volta um "hum"'},
      {i:"home", t:"Dois estranhos dividindo o teto"}
    ],
    virada:"O silêncio quase nunca é só contra você. Mas, do lado de cá, ele vira muro. E o inimigo não precisa de briga pra separar uma casa. O muro basta.",
    tentou:["Cobrar conversa","Indireta, falar mais alto"],
    chave:"Porta fechada por dentro não abre no grito.",
    arma:"O silêncio diante de Deus, e a paciência",
    princ:function(){ return "Falar com Deus sobre "+ele()+" antes de falar com "+ele()+"."; },
    passo:[
      "Hoje, não cobre nada.",
      function(){ return "Faça um gesto em silêncio: um café do jeito "+dele()+', um bilhete "estou orando por você".'; },
      function(){ return horaTxt()+', 5 minutos diante de Deus. Diga só: "Senhor, estou aqui."'; }
    ],
    voz:function(){ return "Deus fala com "+ele()+" onde a minha voz não chega."; },
    acao:"coffee"
  },
  C15:{
    t:function(){ return "Quando eu me sinto "+g("sozinha","sozinho")+" dentro do casamento"; },
    nome:function(){ return g("Sozinha do lado ","Sozinho do lado ")+dele(); },
    frase:function(){ return Ele()+" dorme do seu lado, e mesmo assim você deita "+g("sozinha","sozinho")+", e ainda tem vergonha de sentir isso."; },
    sinais:[
      {i:"bed", t:"Tem alguém do lado, parece que não tem ninguém"},
      {i:"shh", t:function(){ return 'Você engole, porque "'+g("tem marido","tem esposa")+'"'; }},
      {i:"box", t:"Resolve tudo, carrega tudo"}
    ],
    virada:"Solidão no casamento dói mais, porque vem com vergonha. E coração vazio por muito tempo começa a mendigar amor, e a endurecer.",
    tentou:[function(){ return "Esperar "+ele()+" perceber"; },"Se fechar também"],
    chave:function(){ return "Ninguém enche um vazio que não foi feito pra "+ele()+" encher."; },
    arma:"A intimidade com Deus",
    princ:"Quem está cheia de Deus para de mendigar amor e passa a oferecer.",
    passoIntro:function(){ return horaTxt()+", de porta fechada:"; },
    passo:[
      "Agradeça por uma coisa.",
      "Conte pra Deus como você se sente, sem enfeitar.",
      "Um louvor e 5 minutos de silêncio. Só depois peça."
    ],
    voz:"Deus me vê. Eu não sou invisível pra Ele.",
    acao:"music"
  },
  C7:{
    t:function(){ return "Quando "+ele()+" saiu de casa"; },
    nome:function(){ return "O vazio que "+ele()+" deixou"; },
    frase:function(){
      if(EX()) return "Acabou no papel, mas aí dentro não acabou, e você ainda ora por "+ele()+".";
      return Ele()+" foi embora, a casa ficou grande demais, e aí dentro você ainda não aceita que acabou.";
    },
    sinais:[
      {i:"door", t:function(){ return "O lado "+dele()+" ficou vazio"; }},
      {i:"moon", t:"A casa ficou grande demais"},
      {i:"phone", t:"A vontade de correr atrás"}
    ],
    virada:function(){ return "A batalha não está na porta de casa. Está na mente "+dele()+". E ali ninguém entra no grito. Entra de joelhos."; },
    tentou:["Mensagem, cobrança","Implorar"],
    chave:function(){ return "Você não controla a vontade "+dele()+". E nem precisa."; },
    arma:function(){ return "Ficar na brecha pela mente "+dele(); },
    princ:function(){ return "Orar pela mente "+dele()+" e por quem está ao redor, com a Palavra, sem implorar."; },
    passo:[
      function(){ return "Escolha um horário fixo pra orar por "+ele()+" e marque no celular."; },
      function(){ return "Hoje, nesse horário, leia 2 Coríntios 10:4-5 com o nome "+dele()+"."; }
    ],
    voz:"Deus vai aonde eu não posso ir.",
    acao:"clock"
  },
  C10:{
    t:"Quando o nosso casamento esfriou",
    nome:"Casamento no piloto automático",
    frase:"Ainda tem amor, mas a conversa virou conta, lista de mercado e cansaço.",
    sinais:[
      {i:"list", t:"Conversa só de conta e mercado"},
      {i:"eyeoff", t:"Olhar nos olhos, faz tempo"},
      {i:"cloud", t:"Dois cansados na mesma casa"}
    ],
    virada:"Frieza não faz barulho, então ninguém corre pra apagar. Casamento frio não acaba numa explosão. Acaba no silêncio da rotina.",
    tentou:[function(){ return "Esperar a vontade voltar"; }, function(){ return "Esperar "+ele()+" tomar a iniciativa"; }],
    chave:"Fogo não volta esperando. Volta quando alguém coloca lenha.",
    arma:"Voltar ao primeiro amor, com atitude",
    princ:"Gesto primeiro, o sentimento vem atrás (Apocalipse 2).",
    passo:[
      function(){ return 'Faça uma "primeira obra": um bilhete no bolso '+dele()+', um café a dois ou uma foto antiga com "lembra disso?".'; },
      function(){ return horaTxt()+", entregue o seu casamento a Deus com as suas palavras."; }
    ],
    voz:"O Espírito Santo sopra sobre as brasas do meu casamento.",
    acao:"heart"
  },
  C14:{
    t:"Quando eu não consigo perdoar",
    nome:"Mágoa que não passa",
    frase:"Acabou, mas a dor volta numa foto, num nome, numa pergunta, e não te deixa virar a página.",
    sinais:[
      {i:"camera", t:"A dor volta numa foto, num nome"},
      {i:"flame", t:"Parece que foi ontem"},
      {i:"book", t:"A página não vira"}
    ],
    virada:"A mágoa não prende quem feriu. Prende quem foi ferida. Uma parte de você ficou lá, no dia da dor.",
    tentou:['Dizer "eu perdoo" e esperar sentir',"Tentar esquecer"],
    chave:"Te ensinaram o perdão como sentimento. E sentimento não obedece.",
    arma:"O perdão como decisão",
    princ:"Não é dizer que não doeu, nem voltar a confiar. É entregar a Deus o direito de julgar.",
    passo:[
      function(){ return "Escreva o que "+ele()+" fez, sem filtro."; },
      'Leia cada item: "Eu perdoo ___ por isso. Entrego a Ti o direito de julgar."',
      "Rasgue e anote a data de hoje."
    ],
    voz:"Eu entrego a Deus o direito de julgar. Eu estou livre.",
    acao:"pen"
  },
  F2:{
    t:"Quando eu criei no caminho, e mesmo assim ele se desviou",
    nome:function(){ return g("A culpa de mãe","A culpa de pai"); },
    frase:'Você levou pela mão pra igreja, e agora a pergunta não sai da cabeça: "onde foi que eu errei?".',
    sinais:[
      {i:"church", t:"Criou na igreja, e ele foi pra outro caminho"},
      {i:"help", t:'"Onde foi que eu errei?"'},
      {i:"refresh", t:"A cabeça volta em cada bronca, cada ausência"}
    ],
    virada:"Essa culpa parece humildade, mas é uma arma apontada pra você. Quem passa o dia se acusando não tem força pra orar pelo filho.",
    tentou:["Conversar, aconselhar, cobrar","Chorar escondido"],
    chave:"Tudo feito debaixo de culpa sai pesado. E ele sente.",
    arma:"Deixar Deus tirar a culpa das suas costas",
    princ:"Onde houve erro, tem perdão. Condenação, não.",
    passo:[
      "Escreva tudo de que você se acusa como mãe.",
      'Onde errou, peça perdão. Onde não, diga: "isso eu não aceito".',
      "Rasgue e cole no lugar Romanos 8:1."
    ],
    voz:"Eu não carrego a culpa das escolhas do meu filho.",
    acao:"tear"
  },
  F7:{
    t:"Quando o meu filho anda com más companhias",
    nome:"O medo de cada saída",
    frase:"Ele sai, o seu coração vai junto, e cada mensagem sem resposta já vira o pior na sua cabeça.",
    sinais:[
      {i:"door", t:"Ele sai e o coração vai junto"},
      {i:"phone", t:"Mensagem sem resposta, e a cabeça imagina o pior"},
      {i:"clock", t:"Cada demora pesa"}
    ],
    virada:"O medo empurra pra dois extremos: vigiar tudo ou se calar. Os dois abrem distância. E filho longe por dentro fica mais perto do que tem lá fora.",
    tentou:["Sermão","Proibir, desconfiar"],
    chave:"Sermão afasta. Presença aproxima.",
    arma:"Orar por onde ele anda e chegar perto em casa",
    princ:"Uma mão na oração, onde você não entra. A outra trazendo ele pra perto.",
    passo:[
      "Chame ele pra um lanche, só vocês dois, sem cobrança.",
      "Pergunte o nome de um amigo de quem ele gosta.",
      function(){ return horaTxt()+", ore por esse amigo pelo nome."; }
    ],
    voz:"O Senhor guarda a saída e a chegada do meu filho.",
    acao:"coffee"
  },
  F8:{
    t:"Quando o meu filho é rebelde e me enfrenta",
    nome:"Queda de braço em casa",
    frase:"Qualquer conversa vira briga, e tem dia que você não reconhece o filho que carregou no colo.",
    sinais:[
      {i:"flame", t:"Qualquer conversa vira briga"},
      {i:"ear", t:"Você fala, ele não ouve"},
      {i:"heart", t:"Nem parece o filho que você carregou no colo"}
    ],
    virada:"A briga já não é sobre o assunto. É sobre quem ganha. E autoridade que precisa gritar já está perdendo a guerra.",
    tentou:["Falar mais alto","Repetir o sermão"],
    chave:"Pra filho que não quer ouvir, a arma quase nunca é falar mais.",
    arma:"Autoridade com mansidão, e a estratégia de Deus",
    princ:"Cada filho tem um jeito. A estratégia vem de Deus, não do grito.",
    passo:[
      "Faça uma coisa com ele sem corrigir nada: nem roupa, nem quarto, nem jeito de falar.",
      function(){ return horaTxt()+", peça a Deus uma estratégia pra esse filho e anote o que vier."; }
    ],
    voz:"A minha autoridade não precisa de grito pra ser autoridade.",
    acao:"pen"
  },
  F20:{
    t:function(){ return jovem() ? "Quando vamos consagrar os nossos filhos" : "Quando vamos consagrar os nossos filhos e netos"; },
    nome:"Filho bem, coração inquieto",
    frase:"Graças a Deus ele tá bem, mas você vê o que o mundo faz com tanto filho e quer cobrir o seu antes que aperte.",
    sinais:[
      {i:"hands", t:"Graças a Deus, ele está bem"},
      {i:"globe", t:"Você vê o que o mundo faz com tanto filho"},
      {i:"shield", t:"E quer cobrir antes que aperte"}
    ],
    virada:"O alvo do inimigo não é só a casa de hoje. É a geração. E a hora de cobrir é quando está tudo bem.",
    tentou:["Orar forte só quando a crise chega"],
    chave:"Aí é correr atrás. Você tem a chance de fazer o contrário.",
    arma:"A bênção falada sobre ele",
    princ:"Dizer em voz alta que o seu filho é herança de Deus.",
    passo:[
      "Abençoe o seu filho com Números 6:24-26, usando o nome dele.",
      'Se der, com a mão sobre ele. Se ele estiver longe, sobre uma foto, e mande "orei por você hoje".'
    ],
    voz:"Os meus filhos são herança do Senhor.",
    acao:"hands"
  },
  O7:{
    t:"Quando eu oro e parece que Deus não me ouve",
    nome:"Oração que bate no teto",
    frase:"Você pede a mesma coisa há tanto tempo que já dá medo de perguntar se Deus ainda escuta.",
    sinais:[
      {i:"refresh", t:"O mesmo pedido, de novo e de novo"},
      {i:"wall", t:"Parece que bate no teto e volta"},
      {i:"help", t:'"Será que Deus parou de me ouvir?"'}
    ],
    virada:"O perigo não é a demora. É o que a demora faz com você. O inimigo não impede Deus de ouvir. Então tenta convencer você a parar.",
    tentou:["Orar mais alto, mais tempo","Pedir pra mais gente orar"],
    chave:"Não falta volume. Falta saber o que fazer enquanto a resposta não chega.",
    arma:"Perseverar no tempo de Deus",
    princ:"Daniel foi ouvido no primeiro dia, e só viu a resposta 21 dias depois (Daniel 10:12).",
    passo:[
      "Liste os pedidos antigos, com a data em que cada um começou.",
      'Ao lado de cada um: "Deus ouviu desde o primeiro dia".',
      "Leia Daniel 10:12 em voz alta."
    ],
    voz:"A demora não é silêncio de Deus. É o tempo de Deus.",
    acao:"list"
  },
  O2:{
    t:"Quando eu não sei o que falar com Deus",
    nome:"Sem palavras diante de Deus",
    frase:"Você chega pra orar, não sabe o que dizer, e fica achando que a sua oração é pobre.",
    sinais:[
      {i:"refresh", t:"As mesmas frases de sempre"},
      {i:"cloud", t:"Às vezes só sai choro"},
      {i:"bubble", t:"Perto da irmã que ora bonito, a sua parece pouca"}
    ],
    virada:'Isso não é problema de fé. É vergonha de orar "feio". E essa vergonha vai afastando você de Deus, um pouquinho por dia.',
    tentou:["Se esforçar pra falar mais","Vídeo de como orar"],
    chave:"Não falta esforço. Faltam palavras. E Deus já te deu as Dele.",
    arma:"Orar a Palavra",
    princ:"Quando faltam palavras, você usa as de Deus. Os Salmos foram escritos pra isso.",
    passo:[
      function(){ return horaTxt()+", leia o Salmo 23 devagar, em voz alta."; },
      "Depois de cada versículo, diga uma frase sua pra Deus.",
      "Anote o versículo que mais falou com você."
    ],
    voz:"Quando me faltam palavras, eu oro a Palavra.",
    acao:"book"
  },
  O5:{
    t:"Quando eu perdi a vontade de orar",
    nome:"A vontade de orar sumiu",
    frase:"Você sabe que precisa, mas a vontade foi embora, e isso dá medo.",
    sinais:[
      {i:"flame", t:"A vontade foi embora"},
      {i:"help", t:"Parece que não tem o que falar com Deus"},
      {i:"alert", t:"E dá medo, porque você sabe que precisa"}
    ],
    virada:"A fé não esfriou. O que tem é distância. E distância dá pra voltar. O perigo é esperar a vontade voltar sozinha.",
    tentou:["Esperar a vontade voltar","Se forçar e se culpar"],
    chave:"As duas coisas cansam.",
    arma:"Decidir antes de sentir",
    princ:"O salmista mandava a própria alma esperar em Deus (Salmos 42:11).",
    passo:[
      function(){ return horaTxt()+', diga em voz alta: "Eu não tenho vontade, mas estou aqui."'; },
      "Coloque um louvor de que você gosta e cante junto, do começo ao fim."
    ],
    voz:"Minha alma, espere em Deus. Eu ainda vou louvá-Lo.",
    acao:"music"
  },
  O12:{
    t:"Quando a rotina não me deixa tempo para Deus",
    nome:"Deus sempre pra depois",
    frase:"Você quer orar, de verdade, mas o dia engole tudo e fica aquela sensação de estar devendo pra Deus.",
    sinais:[
      {i:"clock", t:"O dia engole tudo"},
      {i:"list", t:'"Quando a vida acalmar, eu oro"'},
      {i:"cloud", t:"Aquela sensação de estar devendo pra Deus"}
    ],
    virada:"A fase ideal não chega. E cada dia esperando a hora certa, a culpa cresce e a oração diminui.",
    tentou:["Prometer uma hora inteira de oração"],
    chave:"Não cabe no dia. Você não cumpre, se sente mal e desiste de novo.",
    arma:"Um lugar fixo pra Deus na rotina de verdade",
    princ:"Pequeno e fixo, no meio das tarefas.",
    passo:[
      "Escolha uma âncora do seu dia: o café, o banho, o ônibus.",
      'Escreva: "Este é o meu horário com Deus".',
      "Amanhã, nessa âncora, 5 minutos. Só 5."
    ],
    voz:"A minha vida com Deus não espera a fase ideal.",
    acao:"coffee"
  },
  O1:{
    t:"Quando eu quero orar, mas não consigo começar",
    nome:"Travada na hora de começar",
    frase:'Você quer orar, mas não sabe por onde começar, e o "agorinha eu oro" vira amanhã.',
    sinais:[
      {i:"heart", t:"A vontade existe"},
      {i:"clock", t:'"Agorinha eu oro"… e o agorinha não chega'},
      {i:"help", t:"Parece que todo mundo sabe orar, menos você"}
    ],
    virada:"Não é falta de fé. É o tamanho que a oração ganhou na sua cabeça. Uma hora de joelho nunca cabe no dia, então nunca começa.",
    tentou:["Esperar o momento certo",'"Amanhã vai ser diferente"'],
    chave:"O momento certo não aparece sozinho.",
    arma:"Começar pequeno, antes de tudo",
    princ:"Pequeno e fiel vale mais que grande e nunca.",
    passo:[
      "Hoje à noite, ponha a Bíblia em cima do celular.",
      'Amanhã, antes de pegar o celular: "Senhor, hoje eu começo contigo."',
      "Sete dias seguidos. Se falhar um, continue no outro."
    ],
    voz:"O meu tempo com Deus começa agora, não depois.",
    acao:"phone"
  },
  O15:{
    t:"Quando a crise da minha casa está roubando a minha oração",
    nome:"Cansada demais pra orar",
    frase:"A casa aperta tanto que, quando chega a hora de orar, não sobra força nem pra pedir.",
    sinais:[
      {i:"battery", t:"Sem força nem pra orar"},
      {i:"home", t:"A casa aperta por todo lado"},
      {i:"clipboard", t:"A oração virou mais um peso na lista"}
    ],
    virada:"Parece que tudo depende de você. Não depende. Você não é a salvadora da sua casa. Jesus é.",
    tentou:["Buscar mais força pra orar mais"],
    chave:"Ninguém sai do cansaço colocando mais peso nas costas.",
    arma:"Entregar o peso e deixar outros orarem com você",
    princ:"A sua parte agora não é fazer mais. É entregar.",
    passo:[
      function(){ return horaTxt()+', diga a Deus: "Senhor, as minhas forças acabaram."'; },
      "Mande mensagem pra 2 ou 3 pessoas de confiança pedindo oração nesta semana."
    ],
    voz:"Eu não carrego este fardo sozinha.",
    acao:"phone"
  },
  D1:{
    t:"Quando as dívidas tiram a minha paz",
    nome:"Dívida tirando a paz",
    frase:"O dinheiro virou um peso que não sai da cabeça, nem na hora de deitar.",
    sinais:[
      {i:"brain", t:"Não sai da cabeça"},
      {i:"eyeoff", t:"Dá vontade de nem olhar"},
      {i:"moon", t:"A paz vai embora junto"}
    ],
    virada:"O medo cresce no escuro. Dívida sem tamanho parece impagável. E quanto menos você olha, maior ela fica por dentro.",
    tentou:["Pedir um milagre e torcer","Trabalhar mais e não olhar"],
    chave:"O que foge da luz continua crescendo.",
    arma:"Trazer tudo pra luz e entregar a ansiedade",
    princ:"Levar tudo a Deus em oração, com gratidão (Filipenses 4:6-7).",
    passo:[
      function(){ return horaTxt()+', escreva no alto de uma folha: "Senhor, eu olho para isso contigo."'; },
      "Comece a lista: pra quem, quanto, quantas parcelas. Mesmo que não termine hoje."
    ],
    voz:"Eu não fujo mais. Eu trago tudo pra luz, diante de Deus.",
    acao:"pen"
  },
  D16:{
    t:"Quando eu tenho vergonha de dever e de pedir ajuda",
    nome:"Vergonha de estar devendo",
    frase:"Ninguém sabe o tamanho do buraco, e a vergonha pesa quase mais que a dívida.",
    sinais:[
      {i:"shh", t:"Ninguém sabe o tamanho do buraco"},
      {i:"alert", t:"A vergonha pesa mais que a dívida"},
      {i:"hands", t:"Pedir ajuda, nem pensar"}
    ],
    virada:"A vergonha manda a gente se esconder, como no jardim. Mas estar devendo não te faz menos filha.",
    tentou:["Resolver sozinha, em segredo"],
    chave:"O segredo é justamente o que dá força pra vergonha.",
    arma:"Receber a graça e sair do esconderijo",
    princ:"Deus foi atrás de Adão e Eva. Em Cristo não há condenação.",
    passo:[
      "Diga a Deus do que você tem vergonha, pelo nome.",
      'Mande pra alguém maduro na fé: "Estou num aperto e preciso de oração. Posso conversar com você?"'
    ],
    voz:"Em Cristo Jesus não há condenação pra mim.",
    acao:"bubble"
  },
  D11:{
    t:function(){ return "Quando sou eu que seguro a casa "+g("sozinha","sozinho"); },
    nome:"A casa inteira nas costas",
    frase:"Tudo passa por você, conta, compra, problema, e ninguém pergunta quem cuida de você.",
    sinais:[
      {i:"box", t:"Tudo passa por você"},
      {i:"cloud", t:"O cansaço não é só do corpo"},
      {i:"hands", t:"Quem cuida de todo mundo não tem quem cuide dela"}
    ],
    virada:'É carregar sozinha o que não foi feito pra uma pessoa só. Até Moisés ouviu: "assim você vai se esgotar".',
    tentou:["Aguentar mais um pouco","Dormir menos, não reclamar"],
    chave:"Força tem limite.",
    arma:"Entregar o peso a Deus e aceitar ajuda",
    princ:"Parar de carregar sozinha o que é de Deus carregar (Mateus 11:28).",
    passo:[
      function(){ return horaTxt()+", liste o que está nas suas costas."; },
      "Entregue a Deus, item por item, o que só Ele resolve.",
      "Peça ajuda hoje em uma tarefa. Uma só."
    ],
    voz:"Eu não preciso carregar tudo sozinha.",
    acao:"hands"
  }
};
function blocoOracao(){
  if(LUTOU()){
    var extra = {melhorou:"Por isso alivia uns dias e volta.", nada:"Deus ouve. A arma é que era outra.", cansando:"Não era pra carregar desse jeito.", piorou:"Por isso piorou em vez de melhorar."}[V("depois")] || "";
    return {ico:"hand", html:"<b>Não foi falta de fé.</b> Você lutou com a arma que te ensinaram. Essa situação pede outra."+(extra?" <i>"+extra+"</i>":"")};
  }
  if(ORA()==="SIM") return {ico:"key", html:"<b>E não é falta de oração.</b> É tentar abrir todas as portas da casa com uma chave só."};
  return {ico:"sprout", html:"<b>Oração difícil não quer dizer que a fé acabou.</b> Ninguém te mostrou o que fazer. Dá pra começar hoje."};
}
function cuidado(r){
  var l = V("lutas")||[];
  if(r.main==="C"){ if(r.sit==="C1" || l.indexOf("c_desprezo")!==-1) return "Se existe agressão, ameaça ou medo em casa, a sua segurança vem primeiro: <b>180</b> (24h, grátis) ou <b>190</b>. Orar e se proteger andam juntos."; }
  if(r.main==="F"){ if(l.indexOf("f_vicio")!==-1 || V("cenaFil")==="medo") return "Vício, depressão ou risco? Oração e ajuda profissional andam juntas: CAPS, médico, psicólogo. Em crise, <b>CVV 188</b>."; }
  if(r.main==="O"){ if(l.indexOf("o_longe")!==-1){ if(l.indexOf("o_vontade")!==-1) return "Tristeza que não passa ou crise de ansiedade? Procure também um médico ou psicólogo. Em crise, <b>CVV 188</b>."; } }
  if(r.main==="D") return "Perdendo o sono a ponto de pensar em desistir? <b>CVV 188</b>, hoje. E buscar orientação financeira é sabedoria.";
  return "";
}
