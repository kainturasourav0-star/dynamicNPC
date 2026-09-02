/* =====================================================================
   NPC-402 — CINEMATIC SCROLL ENGINE — part 1: config / timeline / DOM
   ===================================================================== */
(function(){
'use strict';

/* ---------------- utils ---------------- */
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const sm=t=>t*t*(3-2*t);
const ramp=(u,a,b)=>clamp((u-a)/(b-a),0,1);
function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hexs(n,r){let s='';for(let i=0;i<n;i++)s+='0123456789abcdef'[Math.floor(r()*16)];return s}
const V3=(x,y,z)=>[x,y,z];

/* ---------------- device / motion ---------------- */
const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const SMALL=Math.min(screen.width,screen.height)<760||TOUCH&&Math.min(screen.width,screen.height)<920;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(REDUCED)document.body.classList.add('reduce-motion');
const Q={ nHero:SMALL?5200:15000, nEnv:SMALL?1400:3600, nDust:SMALL?900:2200,
          nFig:SMALL?320:760, nPulse:SMALL?260:460, dpr:SMALL?Math.min(devicePixelRatio,1.6):Math.min(devicePixelRatio,2),
          size:SMALL?1.75:2.25 };

/* ---------------- scene timeline ---------------- */
const SCENES=[
 {id:'void',    name:'THE VOID',           len:3.2},
 {id:'world',   name:'THE WORLD',          len:3.0},
 {id:'npc',     name:'THE NPC',            len:2.4},
 {id:'mind',    name:'COGNITION',          len:2.6},
 {id:'memory',  name:'MEMORY',             len:3.4},
 {id:'recall',  name:'RECALL',             len:3.0},
 {id:'ask',     name:'THE QUESTION',       len:3.0},
 {id:'process', name:'PROCESSING',         len:3.0},
 {id:'price',   name:'THE PRICE',          len:3.0},
 {id:'settle',  name:'SETTLEMENT',         len:4.0},
 {id:'transmute',name:'TRANSMUTATION',     len:2.4},
 {id:'core',    name:'THE CORE',           len:2.6},
 {id:'answer',  name:'THE ANSWER',         len:3.0},
 {id:'others',  name:'THE WORLD RESPONDS', len:2.6},
 {id:'universe',name:'THE NPC UNIVERSE',   len:3.2},
 {id:'api',     name:'THE INTERFACE',      len:3.0},
 {id:'play',    name:'PLAYGROUND',         len:3.4},
 {id:'network', name:'THE NETWORK',        len:2.6},
 {id:'final',   name:'MAKE THEM ALIVE',    len:3.4},
];
const TOTAL_LEN=SCENES.reduce((s,x)=>s+x.len,0);
let acc=0; SCENES.forEach(s=>{s.start=acc/TOTAL_LEN; acc+=s.len; s.end=acc/TOTAL_LEN;});
const S=i=>SCENES[i].start;
function sceneAt(p){ p=clamp(p,0,1);
  for(let i=SCENES.length-1;i>=0;i--) if(p>=SCENES[i].start) return {i,u:(p-SCENES[i].start)/(SCENES[i].end-SCENES[i].start)};
  return {i:0,u:0};
}
/* local progress inside a scene window given global p */
function lu(p,i){const s=SCENES[i];return clamp((p-s.start)/(s.end-s.start),0,1)}

/* ---------------- copy / chapters ---------------- */
const CH=[];
function C(id,sc,from,to,cls,html,opts){CH.push(Object.assign({id,sc,from,to,cls,html},opts||{}))}

/* — scene 01 · the void — */
C('void-title',0,.04,.30,'','<div class="kicker"><span class="c">NPC-402</span>&nbsp;//&nbsp;DIALOGUE INFRASTRUCTURE</div><div class="display" data-type>NPC-402</div>');
C('void-q',0,.38,.68,'','<div class="mono-line c" data-type>WHAT IF NPCS COULD THINK?</div>');
C('void-go',0,.80,.985,'','<div class="mono-line">ENTERING THE NETWORK</div>');
/* — scene 02 · the world — */
C('w1',1,.20,.46,'','<div class="headline">MEET <span class="gd">GARRICK</span>.</div>');
C('w2',1,.56,.82,'','<div class="headline">HE <span class="cy">REMEMBERS</span>.</div>');
/* — scene 03 · npc reveal — */
C('np',2,.30,.96,'lower','<div class="nameplate"><div class="role">THE SUSPICIOUS BARTENDER</div><div class="display" style="font-size:clamp(3.2rem,10vw,8.2rem);letter-spacing:.02em">GARRICK</div><div class="meta"><span>NPC_ID <b>garrick_bartender</b></span><span>STATE <b>IDLE</b></span><span>TRUST <b>47%</b></span><span>MOOD <b>GUARDED</b></span></div></div>');
/* — scene 04 · thinking — */
C('m1',3,.08,.40,'','<div class="headline">EVERY CONVERSATION<br/><span class="cy">CHANGES HIM</span>.</div>');
C('m2',3,.50,.84,'','<div class="headline">EVERY INTERACTION BECOMES<br/><span class="cy">MEMORY</span>.</div>');
/* — scene 05 · memory — */
C('mem-line',4,.56,.92,'','<div class="mono-line c" data-type>HE IS MADE OF EVERYTHING YOU TOLD HIM</div>');
/* — scene 06 · memory detail — */
C('mA',5,.06,.40,'','<div class="mem-card"><div class="mk"><span>MEMORY <span class="id">#0413</span></span><span>TRUST LEDGER</span></div><h3>PLAYER HELPED GARRICK</h3><div class="delta up">TRUST&nbsp;&nbsp;+12</div><div class="meter"><i></i></div><div class="foot">WITNESS: LYRA — CONFIDENCE 0.97</div></div>');
C('mB',5,.55,.90,'','<div class="mem-card"><div class="mk"><span>MEMORY <span class="id">#0877</span></span><span>THREAT LEDGER</span></div><h3>PLAYER THREATENED GARRICK</h3><div class="delta up">SUSPICION&nbsp;&nbsp;+18</div><div class="meter"><i></i></div><div class="foot">NETWORK STATE UPDATED — BEHAVIOR DIFFERENTIAL +4.2% HOSTILITY</div></div>');
/* — scene 07 · player speaks — */
C('q',6,.08,.48,'','<div class="dlg"><div class="who player">PLAYER</div><div class="line" data-type>&ldquo;What happened here?&rdquo;</div></div>');
C('q2',6,.60,.92,'','<div class="mono-line c">THE QUESTION ENTERS THE NETWORK</div>');
/* — scene 08 · processing — */
C('p1',7,.05,.27,'','<div class="proc-state"><div class="step">STATE 01 / 04</div><h2>UNDERSTANDING CONTEXT</h2><div class="sub">INTENT — TONE — LANGUAGE</div></div>');
C('p2',7,.29,.51,'','<div class="proc-state"><div class="step">STATE 02 / 04</div><h2>RETRIEVING MEMORY</h2><div class="sub">1,208 MEMORIES — 4 RELEVANT</div></div>');
C('p3',7,.53,.75,'','<div class="proc-state"><div class="step">STATE 03 / 04</div><h2>CHECKING WORLD STATE</h2><div class="sub">TAVERN — NIGHT — TENSION 0.61</div></div>');
C('p4',7,.77,.985,'','<div class="proc-state"><div class="step">STATE 04 / 04</div><h2>GENERATING RESPONSE</h2><div class="sub">VOICE: GARRICK — 1 CANDIDATE SELECTED</div></div>');
C('pnote',7,.06,.985,'','<div class="proc-note">HIGH-LEVEL STATES ONLY — INTERNAL REASONING NOT EXPOSED</div>');
/* — scene 09 · x402 — */
C('x1',8,.03,.26,'','<div class="headline">THE CHARACTER NEEDS<br/>A <span class="gd">RESPONSE</span>.</div>');
C('x2',8,.28,.50,'','<div class="headline">PAY ONLY WHEN<br/>THEY <span class="cy">TALK</span>.</div>');
C('x402',8,.52,.985,'','<div class="pay-panel" data-cur="gold"><div class="code">HTTP&nbsp;402 <small>PAYMENT REQUIRED</small></div><div class="rows"><div class="amt"><span>AMOUNT</span><b>0.01 USDC</b></div><div><span>NETWORK</span><b>BASE SEPOLIA</b></div><div><span>SCHEME</span><b>EIP-191 SIGNED MESSAGE</b></div><div><span>RECIPIENT</span><b>npc-402://garrick</b></div></div><div class="status">AWAITING PAYMENT</div></div>');
/* — scene 10 · transaction — (widgets built separately) — */
/* — scene 11 · transmutation — */
C('t1',10,.26,.74,'','<div class="headline"><span class="gd">VALUE</span> BECOMES <span class="cy">INTELLIGENCE</span>.</div><div class="spacer"></div><div class="mono-line">USDC SETTLED&nbsp;&nbsp;—&nbsp;&nbsp;INFERENCE UNLOCKED</div>');
/* — scene 12 · the core — */
C('k1',11,.46,.88,'','<div class="mono-line c" data-type>ONE MIND — EVERY WORD IT HAS EVER HEARD</div>');
/* — scene 13 · npc response — */
C('dlg2',12,.16,.82,'lower','<div class="dlg"><div class="who npc">GARRICK</div><div class="line" data-type>&ldquo;You really want to know?&nbsp;&hellip;&nbsp;Then put the sword away first.&rdquo;</div></div>');
/* — scene 14 · the world responds — */
C('o1',13,.28,.72,'','<div class="headline">NO TWO CHARACTERS<br/>ARE THE <span class="cy">SAME</span>.</div>');
/* — scene 15 · npc universe — (diegetic cards) — */
/* — scene 16 · api — */
C('code',15,.08,.58,'','<div class="codepanel"><div class="cdot"><i></i><i></i><i></i></div><div><span class="k">POST</span> <span class="p">/api/generate-dialogue</span></div><div>&nbsp;</div><div>{</div><div>&nbsp;&nbsp;<span class="a">"npc_id"</span><span class="p">:</span> <span class="s">"garrick_bartender"</span><span class="p">,</span></div><div>&nbsp;&nbsp;<span class="a">"player_message"</span><span class="p">:</span> <span class="s">"What happened here?"</span><span class="p">,</span></div><div>&nbsp;&nbsp;<span class="a">"x402"</span><span class="p">:</span> <span class="s">"0.01 USDC — Base Sepolia"</span></div><div>}</div><div class="m">— the request travels forward —</div></div>');
C('cac',15,.64,.985,'','<div class="cac"><span class="n">CODE</span><span class="arr"></span><span class="n c">AI</span><span class="arr"></span><span class="n g">CHARACTER</span></div>');
/* — scene 17 · playground — (widget) — */
/* — scene 18 · data world — */
C('n1',17,.28,.66,'','<div class="headline">EVERYTHING IS <span class="cy">CONNECTED</span>.</div>');
/* — scene 19 · final — */
C('f1',18,.02,.19,'','<div class="headline">GIVE YOUR NPCS A <span class="cy">MEMORY</span>.</div>');
C('f2',18,.21,.37,'','<div class="headline">MAKE THEM <span class="cy">THINK</span>.</div>');
C('f3',18,.39,.55,'','<div class="headline">MAKE THEM <span class="cy">REMEMBER</span>.</div>');
C('f4',18,.57,.73,'','<div class="headline">MAKE THEM <span class="cy">ALIVE</span>.</div>');
C('cta',18,.79,1.01,'','<div class="cta-wrap"><div style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center"><button class="btn primary" data-goto="play" data-magnet data-hover>LAUNCH NPC-402</button><button class="btn ghost" data-goto="api" data-magnet data-hover>EXPLORE THE API</button></div><div class="footer-meta">NPC-402 — x402 DIALOGUE PROTOCOL FOR GAME WORLDS<br/>EVERY TRANSACTION ON THIS PAGE IS SIMULATED — DEMO BUILD 0.4.02</div></div>');

/* ---------------- diegetic 3D labels ---------------- */
const MEMC=[0,2,-70];
const MEM_NODES=[
 ['GARRICK',            [0,2,-70],        0],
 ['PLAYER MET',         [4.6,4.6,-63.5],  1],
 ['FAVOR',              [7.2,1.2,-67.5],  1],
 ['THREAT',             [5,0.1,-74.5],    1],
 ['QUEST',              [-4.6,4.3,-64.5], 1],
 ['LOCATION',           [-7.4,1.1,-69],   1],
 ['TRUST',              [-5.6,0.1,-75.5], 1],
 ['PREVIOUS DIALOGUE',  [-1.8,5.6,-73.5], 1],
 ['WORLD STATE',        [1.6,6.2,-76.5],  1],
];
const GATES=[
 ['PLAYER INPUT',-52],['MEMORY',-63.5],['PERSONALITY',-75],['WORLD STATE',-86.5],['AI ENGINE',-98]
];
const COREL=[['CONTEXT',[-9.5,7.5,-256]],['MEMORY',[10,6.5,-267]],['PERSONALITY',[-10,1,-268]],['WORLD STATE',[9,0.5,-255]]];
const FIGS=[
 {id:'garrick',  name:'GARRICK',   trait:'SUSPICIOUS',trust:47,mem:'1,208',  pos:[0,0,-262],  sc:.98,note:'THE SUSPICIOUS BARTENDER'},
 {id:'lyra',     name:'LYRA',      trait:'CURIOUS',   trust:64,mem:'892',    pos:[9,0,-276],  sc:.88,note:'STABLEHAND — REMEMBERS FACES'},
 {id:'vaelathor',name:'VAELATHOR', trait:'WARY',      trust:21,mem:'4,412',  pos:[-9,0,-284], sc:1.34,note:'ELDER LOREKEEPER — SPEAKS IN RIDDLES'},
 {id:'mira',     name:'MIRA',      trait:'ARCHIVIST', trust:88,mem:'12,004', pos:[14,0,-296], sc:.92,note:'KEEPER OF THE LEDGER'},
 {id:'kae',      name:'KAE',       trait:'GUARDED',   trust:33,mem:'2,210',  pos:[-15,0,-308],sc:1.05,note:'CROSSING GUARD — OWES A DEBT'},
 {id:'tanneth',  name:'OLD TANNETH',trait:'FORGETFUL',trust:61,mem:'96',     pos:[6,0,-322],  sc:1.1, note:'FISHERMAN — LOSES DAYS'},
];
const HUBS=[['NPCS',[-15,7.5,-352]],['AI',[0,12.5,-380]],['MEMORY',[15,5.5,-356]],['PAYMENTS',[10.5,10.5,-384]],['GAME ENGINE',[-12.5,-.5,-382]],['API',[0,-2.5,-367]]];

/* ---------------- build DOM ---------------- */
const chaptersBox=$('#chapters'), labelsBox=$('#labels');
const chapEls=[];
function splitChars(el){
  const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
  const texts=[]; let n; while((n=walk.nextNode()))texts.push(n);
  texts.forEach(t=>{
    const frag=document.createDocumentFragment();
    for(const ch of t.nodeValue){
      if(ch===' '){frag.appendChild(document.createTextNode(' '));continue;}
      const s=document.createElement('span'); s.className='char'; s.textContent=ch; frag.appendChild(s);
    }
    t.parentNode.replaceChild(frag,t);
  });
  return el.querySelectorAll('.char');
}
function buildChapters(){
  CH.forEach(c=>{
    const el=document.createElement('div');
    el.className='chapter '+(c.cls||'');
    el.innerHTML=c.html;
    el.id='ch-'+c.id;
    chaptersBox.appendChild(el);
    const chars=el.querySelector('[data-type]')?splitChars(el.querySelector('[data-type]')):null;
    chapEls.push({c,el,chars,meters:el.querySelectorAll('.meter i'),arr:el.querySelectorAll('.arr')});
  });
  /* transaction widgets */
  const tx=document.createElement('div'); tx.id='ch-tx';
  tx.style.cssText='position:absolute;inset:0;pointer-events:none';
  tx.innerHTML='<div class="tx-stage"><div class="now" id="tx-now"></div><div class="track"><i id="tx-fill"></i></div><div class="dots" id="tx-dots"></div></div><div class="demo-tag">DEMO TRANSACTION — SIMULATED</div>';
  chaptersBox.appendChild(tx);
  tx.querySelector('#tx-dots').innerHTML=['402','REQ','SIGN','VERIFY','SETTLE','CONFIRM','UNLOCK'].map(d=>'<span>'+d+'</span>').join('');
  const hx=document.createElement('div'); hx.id='hexstreams';
  hx.innerHTML='<div class="col"></div><div class="col c2"></div><div class="col"></div>';
  chaptersBox.appendChild(hx);
  const sig=document.createElement('div'); sig.className='sig-panel'; sig.id='sig-panel';
  sig.innerHTML='<div class="t">EIP-191 — WALLET SIGNING</div><canvas id="sigcv" width="440" height="280"></canvas><div class="h" id="sighash"></div>';
  chaptersBox.appendChild(sig);
}
const labelDefs=[];
function buildLabels(){
  MEM_NODES.forEach((n,ix)=>{
    const el=document.createElement('div'); el.className='lbl mem'+(ix===0?' gold':''); el.innerHTML='<span class="tick"></span>'+n[0];
    el.dataset.hover='1'; labelsBox.appendChild(el);
    labelDefs.push({el,pos:n[1],kind:'mem',ix});
    el.addEventListener('mouseenter',()=>window.__memHover&&window.__memHover(ix,true));
    el.addEventListener('mouseleave',()=>window.__memHover&&window.__memHover(ix,false));
  });
  GATES.forEach(g=>{
    const el=document.createElement('div'); el.className='lbl gate'; el.innerHTML=g[0];
    labelsBox.appendChild(el); labelDefs.push({el,pos:[0,2,g[1]],kind:'gate'});
  });
  COREL.forEach(c=>{
    const el=document.createElement('div'); el.className='lbl'; el.innerHTML='<span class="tick"></span>'+c[0];
    labelsBox.appendChild(el); labelDefs.push({el,pos:c[1],kind:'core'});
  });
  FIGS.forEach(f=>{
    const el=document.createElement('div'); el.className='npc-card'; el.dataset.hover='1';
    el.innerHTML='<h4>'+f.name+'</h4><div class="trait">'+f.trait+'</div>'+
      '<div class="rows"><div>TRUST <b>'+f.trust+'%</b></div><div>MEMORIES <b>'+f.mem+'</b></div></div>'+
      '<div class="bar"><i style="width:'+f.trust+'%"></i></div>';
    el.addEventListener('click',()=>{el.classList.toggle('open');});
    labelsBox.appendChild(el);
    labelDefs.push({el,pos:[f.pos[0],f.pos[1]+4.6*f.sc,f.pos[2]],kind:'fig',fig:f});
  });
  HUBS.forEach(h=>{
    const el=document.createElement('div'); el.className='lbl hub'; el.innerHTML='<span class="tick"></span>'+h[0];
    labelsBox.appendChild(el); labelDefs.push({el,pos:h[1],kind:'hub'});
  });
}
function buildHUD(){
  const nav=$('#topnav');
  nav.innerHTML='<a data-to="0">STORY</a><a data-to="8">PROTOCOL</a><a data-to="16">PLAYGROUND</a><a data-to="18" class="hot">LAUNCH</a>';
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>scrollToScene(+a.dataset.to)));
  $('.wordmark').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  const rail=$('#rail');
  SCENES.forEach((s,i)=>{
    const d=document.createElement('div'); d.className='dot'; d.innerHTML='<span class="tip">'+String(i+1).padStart(2,'0')+' — '+s.name+'</span>';
    d.addEventListener('click',()=>scrollToScene(i));
    rail.appendChild(d);
  });
}
function scrollToScene(i){
  const target=SCENES[clamp(i,0,SCENES.length-1)].start*maxScroll()+2;
  window.scrollTo({top:target,behavior:'smooth'});
}
function maxScroll(){return document.documentElement.scrollHeight-innerHeight}
buildChapters(); buildLabels(); buildHUD();

/* playground DOM (scene 17) */
const pg=document.createElement('div'); pg.className='pg'; pg.id='pg';
pg.innerHTML=
 '<div class="pg-inner" id="pg-inner">'+
  '<div class="pg-head"><div class="t"><b>API PLAYGROUND</b> — generate-dialogue v1</div><div class="env">x402 · BASE SEPOLIA · DEMO</div></div>'+
  '<div class="pg-body">'+
   '<div class="pg-col"><div class="pg-lab"><span>REQUEST</span><span class="c">application/json</span></div>'+
    '<div class="pg-method"><span class="mth">POST</span><span class="pth">/api/generate-dialogue</span></div>'+
    '<textarea id="pg-code" spellcheck="false">{\n  "npc_id": "garrick_bartender",\n  "player_message": "What happened here?",\n  "memory_window": 12,\n  "temperature": 0.8\n}</textarea>'+
    '<div class="pg-run"><button id="pg-runbtn" data-hover data-magnet>RUN REQUEST ▸</button><span class="cost">COST 0.01 USDC · PAY-PER-RESPONSE</span></div>'+
   '</div>'+
   '<div class="pg-col"><div class="pg-lab"><span>NPC RESPONSE</span><span>LATENCY —</span></div>'+
    '<div id="pg-resp"><span class="idle">// response stream — run the request</span></div>'+
   '</div>'+
  '</div>'+
  '<div class="pg-foot">'+
   '<div class="pg-stat gold" id="st-pay"><span class="led"></span>PAYMENT VERIFIED</div>'+
   '<div class="pg-stat" id="st-ai"><span class="led"></span>AI RESPONSE READY</div>'+
   '<div class="pg-stat" id="st-lat"><span class="led"></span>LATENCY —</div>'+
  '</div>'+
 '</div>';
chaptersBox.appendChild(pg);
