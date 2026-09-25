(function(){
"use strict";
/* ================= CONFIGURACAO (edite aqui) ================= */
var CFG = {
  posthogKey: "",                    // chave PostHog (phc_...). Vazio = desligado
  posthogHost: "https://us.i.posthog.com",
  metaPixelId: "",                   // Vazio = usa o pixel que a pagina/WordPress ja carrega (padrao Raizes/Escola)
  /* ÚNICO lugar pra trocar o destino dos leads. Hoje: Web App do Theo -> planilha "Leads Quiz Família Restaurada", aba "Leads"
     (integracao/README-leads-planilha.md). Antes era o Web App Raízes/Escola (aba "quiz-familia-restaurada"). Trocar a URL aqui e rebuildar. */
  leadWebhookUrl: "https://script.google.com/macros/s/AKfycbyXbW4-RthXdi7TDC4o8Vm3DDPbUeJQa0LCZ5TfufEhqzxmpYYC5laFq0rr2divG5Jq/exec",
  fonte: "quiz-familia-restaurada",
  checkout: { // UTMs da URL de entrada passam por cima dos padroes
    C: "https://chk.eduzz.com/2a5cwqts",
    F: "https://chk.eduzz.com/4n3tu4uo",
    O: "https://chk.eduzz.com/sskhzojc",
    D: "https://chk.eduzz.com/KW8ZZKDR01"
  },
  utmDefaults: { utm_source:"quiz", utm_medium:"funnel", utm_campaign:"familia-restaurada" },
  avista: "47", parcelas: "11x de R$ 5,22"
};
/* ============================================================= */

var STORE = "fr_state";
var S = { answers:{}, history:[], lead:{} };
try{ if(/[?&]reset=1/.test(location.search)){ localStorage.removeItem(STORE); } }catch(e){}
try{ var saved = localStorage.getItem(STORE); if(saved){ S = JSON.parse(saved); } }catch(e){}
function persist(){ try{ localStorage.setItem(STORE, JSON.stringify(S)); }catch(e){} }
var A = S.answers;
var root = document.getElementById("fr-quiz");

/* ---------- analytics (mesmo padrao Raizes/Escola) ---------- */
if(CFG.metaPixelId && typeof window.fbq !== "function"){
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', CFG.metaPixelId); window.fbq('track','PageView');
}
if(CFG.posthogKey){
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],o="capture identify alias register register_once unregister reset get_distinct_id opt_in_capturing opt_out_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  window.posthog.init(CFG.posthogKey,{api_host:CFG.posthogHost});
}
function track(ev, data){
  try{
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({event:"quiz_"+ev}, data||{}));
    if(typeof fbq === "function"){ fbq("trackCustom", "Quiz_"+ev, data||{}); }
    if(typeof gtag === "function"){ gtag("event", "quiz_"+ev, data||{}); }
    if(window.posthog && window.posthog.capture){ window.posthog.capture("quiz_"+ev, data||{}); }
  }catch(e){}
}
var UTM_KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid","src","sck"];
function pageUtms(){ var o={}; try{ var p=new URLSearchParams(location.search); UTM_KEYS.forEach(function(k){ var v=p.get(k); if(v) o[k]=v; }); }catch(e){} return o; }
/* UTMs/fbclid da URL de entrada ficam guardadas no localStorage na primeira tela (a pessoa pode recarregar/voltar sem elas).
   Primeiro toque: não sobrescreve as já guardadas; só completa chaves que faltam. */
(function(){ var u = pageUtms(); if(Object.keys(u).length){ S.utms = Object.assign({}, u, S.utms||{}); persist(); } })();
function leadUtms(){ return Object.assign({}, pageUtms(), S.utms||{}); }
function checkoutUrl(area){
  try{
    var base = new URL(CFG.checkout[area]);
    Object.keys(CFG.utmDefaults).forEach(function(k){ base.searchParams.set(k, CFG.utmDefaults[k]); });
    var u = leadUtms();
    Object.keys(u).forEach(function(k){ base.searchParams.set(k, u[k]); });
    return base.toString();
  }catch(e){ return CFG.checkout[area]; }
}

/* ---------- helpers ---------- */
function fem(){ return A.sexo !== "Homem"; }
function g(f,m){ return fem() ? f : m; }
function esc(s){ return String(s||"").replace(/[&<>"']/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
function lc(s){ return String(s).toLowerCase().replace(/deus/g,"Deus").replace(/pra\. ezenete/g,"Pra. Ezenete"); }
function joinE(arr){ if(arr.length<=1) return arr.join(""); return arr.slice(0,-1).join(", ")+" e "+arr[arr.length-1]; }
function ucf(s){ s=String(s||""); return s.charAt(0).toUpperCase()+s.slice(1); }
/* genero nas telas de Casamento (secao 10 do doc: marido vira esposa, ele vira ela) */
function ele(){ return g("ele","ela"); } function Ele(){ return g("Ele","Ela"); } function dele(){ return g("dele","dela"); }
function mulherDeDeus(){ return g("mulher de Deus","gente de Deus"); }

/* ---------- condicoes do doc (secao 4) ---------- */
function CAS(){ return ["casada","junto","ex"].indexOf(V("civil"))>-1; }
function EX(){ return V("civil")==="ex"; }
function CASADA(){ return ["casada","junto"].indexOf(V("civil"))>-1; }
function FIL(){ var f=V("filhos"); return !!f && f!=="nao"; }
function ORA(){ var o=V("oracao"); if(["hora","jeito","campanha"].indexOf(o)>-1) return "SIM"; if(o==="vezes") return "AS"; if(o==="quase"||o==="nunca") return "NAO"; return ""; }
function tentou(){ return V("tentou")||[]; }
function lutouVerbos(){ var t=tentou(), tudo=t.indexOf("tudo")>-1, r=[]; if(tudo||t.indexOf("campanha")>-1||V("oracao")==="campanha") r.push("fez campanha"); if(tudo||t.indexOf("jejum")>-1) r.push("jejuou"); if(tudo||t.indexOf("madrugada")>-1) r.push("passou madrugada de joelho"); return r; }
function LUTOU(){ var t=tentou(); return ["campanha","jejum","madrugada","tudo"].some(function(x){ return t.indexOf(x)>-1; }) || V("oracao")==="campanha"; }
function NADA(){ return tentou().indexOf("nada")>-1; }
