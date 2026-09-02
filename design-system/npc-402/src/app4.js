/* =====================================================================
   part 4 — scenes 9-18 · widgets · interactions · playground · main loop
   ===================================================================== */
const frameState={};
let curSceneIdx=0,curSceneU=0,hoverMem=null;
const GOLDL2=[1,.72,.34];

function updateSceneB(id,u,time){
 const H=heroMat.uniforms;
 const o={};
 switch(id){
  case 'settle':{
   H.uTintG.value=.55;H.uBoost.value=.12;H.uDrift.value=.08;
   H.uFlow.value=u*3.6;H.uFlowZ.value=-183;H.uFlowSpan.value=112;
   o.dustOp=.24;o.dustG=.5;o.dustC=0;
   setLines('tunnel',GOLDL2,.65);
   setSpr('glowA',0,2,camState.pos[2]-24,12,1,.75,.4,.20);
   setSpr('glowB',0,2,camState.pos[2]-48,12,.25,.85,1,.08);
   break;}
  case 'transmute':{
   const sh=ramp(u,.15,.75);
   H.uRoleShift.value=sh;
   H.uTintG.value=.55*(1-sh);H.uTintC.value=.35*sh;
   H.uFlow.value=(1-sh)*1.6;H.uFlowZ.value=-183;H.uFlowSpan.value=112;
   o.dustOp=.26;o.dustG=.5*(1-sh);o.dustC=.35*sh;
   setLines(u<.5?'tunnel':'core',u<.5?GOLDL2:CYAN,.6);
   setSpr('coreGlow',0,2,-262,lerp(10,26,ramp(u,.3,.9)),.25,.85,1,.5*ramp(u,.25,.6));
   break;}
  case 'core':{
   H.uTintC.value=.4;H.uBoost.value=.2+.4*u;H.uDrift.value=.12;
   H.uConverge.value=ramp(u,.45,.8)*.4;
   o.dustOp=.2;o.dustC=.4;
   setLines('core',CYAN,.5);
   setSpr('coreGlow',0,2,-262,lerp(26,34,u),.25,.85,1,.55+.2*Math.sin(time*2.2));
   break;}
  case 'answer':{
   H.uTintC.value=.15;H.uDrift.value=.08;H.uBoost.value=.22;
   o.heroOp=.95;o.lb=ramp(u,.08,.3)*(1-ramp(u,.8,.96));
   o.envOp=.42*ramp(u,.55,1);o.dustOp=.16;o.dustC=.15;
   setSpr('coreGlow',0,2,-262,34*(1-u),.25,.85,1,.5*(1-u));
   setSpr('lamp',1.35,2.85,-261.5,4.4,1,.7,.34,.55*ramp(u,.5,.8));
   setSpr('rim',-1.7,2.7,-263.6,4.2,.25,.85,1,.38*ramp(u,.55,.85));
   setSpr('aug',.15,2.68,-261.86,.65,.3,.9,1,(.5+.3*Math.sin(time*3))*ramp(u,.55,.85));
   break;}
  case 'others':{
   H.uTintC.value=.1;H.uDrift.value=.08;
   o.envOp=.42;o.dustOp=.2;o.dustC=.1;
   o.figOp=ramp(u,.2,.5);o.figLinkOp=.42*ramp(u,.35,.6);
   setSpr('lamp',1.35,2.85,-261.5,4.4,1,.7,.34,.5);
   setSpr('glowA',10.2,3.4,-275.4,3.6,.25,.85,1,.3);
   setSpr('glowB',-9.2,3.8,-283.4,4.2,1,.75,.4,.32);
   setSpr('horizon',0,1,-330,70,1,.62,.3,.3);
   break;}
  case 'universe':{
   H.uTintC.value=.1;H.uDrift.value=.08;
   o.envOp=.5;o.dustOp=.26;o.figOp=1;o.figLinkOp=.55;
   setSpr('lamp',1.35,2.85,-261.5,4.4,1,.7,.34,.5);
   setSpr('glowA',14.6,3.6,-295.4,3.4,.25,.85,1,.26);
   setSpr('glowB',-14.9,4.2,-307.4,3.8,1,.75,.4,.28);
   setSpr('horizon',0,1,-330,70,1,.62,.3,.32);
   break;}
  case 'api':{
   H.uTintC.value=.25;H.uDrift.value=.08;
   o.figOp=1-ramp(u,.1,.4);o.figLinkOp=.5*(1-ramp(u,.1,.4));
   o.envOp=.42*(1-ramp(u,.35,.75));o.dustOp=.2;o.dustC=.25;
   setLines('code',CYAN,.35*ramp(u,.4,.7));
   break;}
  case 'play':{
   H.uTintC.value=.15;H.uDrift.value=.05;
   o.heroOp=.5;o.dustOp=.14;o.dustC=.2;
   setLines('code',CYAN,.25);
   break;}
  case 'network':{
   H.uTintC.value=.3;H.uDrift.value=.1;H.uBoost.value=.1;
   o.dustOp=.3;o.dustC=.35;
   setLines('universe',CYAN,.5*ramp(u,.3,.6));
   setSpr('coreGlow',0,4,-368,18,.25,.85,1,.2*ramp(u,.2,.5));
   break;}
  case 'final':{
   H.uTintC.value=.2;H.uDrift.value=.06;
   o.heroOp=lerp(1,.85,u);o.dustOp=.12;o.dustC=.2;
   setSpr('back',0,3,-370.6,11,.25,.85,1,.42*ramp(u,.3,.7));
   break;}
 }
 return o;
}

/* ================= transaction widgets (scene 10) ================= */
const TX_STAGES=['HTTP <span class="c">402</span> — PAYMENT REQUIRED',
 'PAYMENT REQUESTED — <span class="g">0.01 USDC</span>',
 'WALLET SIGNING — <span class="g">EIP-191</span>',
 'SIGNATURE <span class="c">VERIFIED</span>',
 'USDC SETTLEMENT — <span class="g">BASE SEPOLIA</span>',
 'BLOCKCHAIN <span class="c">CONFIRMED</span> — BLOCK #8,441,207',
 'AI RESPONSE <span class="g">UNLOCKED</span>'];
const txStage=$('#ch-tx'),txNow=$('#tx-now'),txFill=$('#tx-fill'),txDots=$('#tx-dots').children,
      demoTag=document.querySelector('.demo-tag'),hexBox=$('#hexstreams'),sigPanel=$('#sig-panel');
let txLast=-1,hexLast=0,sigCtx=null,sigHash='';
if(sigPanel)sigCtx=$('#sigcv').getContext('2d');
function updateWidgets(i,u,time){
 const on=SCENES[i].id==='settle';
 const vis=on?ramp(u,.03,.1)*(1-ramp(u,.95,1)):0;
 txStage.style.opacity=vis;
 demoTag.style.opacity=vis;
 hexBox.style.opacity=on?.75*ramp(u,.05,.3):0;
 if(on){
  const st=Math.min(6,Math.floor(clamp(u/.965,0,1)*7));
  if(st!==txLast){txLast=st;txNow.innerHTML=TX_STAGES[st];
    for(let d=0;d<7;d++)txDots[d].classList.toggle('on',d<=st);}
  txFill.style.width=(clamp(u/.965,0,1)*100)+'%';
  /* hex streams */
  if(time-hexLast>.09&&vis>.4){hexLast=time;
    const cols=hexBox.querySelectorAll('.col');
    const r=Math.random;
    cols.forEach((c,ci)=>{let h='';for(let L=0;L<26;L++)h+=hexs(38,r)+'\n';c.textContent=h;});
  }
  /* signature curve */
  const sigOn=st>=2&&st<=3;
  sigPanel.style.opacity=sigOn?.92:0;
  if(sigOn&&sigCtx){
    drawSig(time);
    if(time-hexLast>.14){sigHash='SIG 0x'+hexs(40,Math.random)+'…'+(st===3?' VERIFIED ✓':'');$('#sighash').textContent=sigHash;}
  }
 } else { sigPanel.style.opacity=0; txLast=-1; }
}
function drawSig(time){
 const c=sigCtx,W=440,H=280;
 c.clearRect(0,0,W,H);
 c.strokeStyle='rgba(233,180,92,.30)';c.lineWidth=1;
 c.beginPath();c.moveTo(20,H/2);c.lineTo(W-20,H/2);c.stroke();
 c.strokeStyle='rgba(63,224,255,.85)';c.lineWidth=1.6;
 for(const s of[1,-1]){
   c.beginPath();let first=true;
   for(let x=-21;x<=26;x+=.5){const rhs=x*x*x/160+7;
     if(rhs<0){first=true;continue;}
     const px=220+x*8,py=H/2-s*Math.sqrt(rhs)*9;
     if(first){c.moveTo(px,py);first=false;}else c.lineTo(px,py);}
   c.stroke();}
 const t=(time*.35)%1;const x=-16+t*40;const rhs=x*x*x/160+7;
 if(rhs>=0){const px=220+x*8,py=H/2-Math.sqrt(rhs)*9;
  const g=c.createRadialGradient(px,py,0,px,py,16);
  g.addColorStop(0,'rgba(233,180,92,.95)');g.addColorStop(1,'rgba(233,180,92,0)');
  c.fillStyle=g;c.beginPath();c.arc(px,py,16,0,7);c.fill();}
}

/* ================= chapters ================= */
const chapState=new Map();
function updateChapters(i,u){
 chapEls.forEach(ce=>{
  const c=ce.c;
  let alpha=0;
  if(c.sc===i){
   const a=ramp(u,c.from,c.from+Math.max(.06,(c.to-c.from)*.24));
   const b=1-ramp(u,c.to-Math.max(.06,(c.to-c.from)*.24),c.to);
   alpha=a*b;
  }
  const st=chapState.get(c.id)||{a:-1,n:-1};
  if(Math.abs(alpha-st.a)>.004||alpha!==st.a&&(alpha===0||alpha===1)){
   ce.el.style.opacity=alpha.toFixed(3);
   const ty=(1-alpha)*26;
   ce.el.style.transform='translateY('+ty.toFixed(1)+'px)';
   ce.el.style.visibility=alpha<=0?'hidden':'visible';
   if(c.id==='cta'||c.id==='pg')ce.el.classList.toggle('live',alpha>.4);
  }
  chapState.set(c.id,{a:alpha,n:st.n});
  if(alpha<=0)return;
  /* typing */
  if(ce.chars&&ce.chars.length){
   const dur=(c.to-c.from);
   const t2=clamp((u-c.from)/(dur*.72),0,1);
   const n=Math.floor(t2*ce.chars.length);
   if(n!==st.n){for(let k=0;k<ce.chars.length;k++)ce.chars[k].style.opacity=k<n?1:0;chapState.set(c.id,{a:alpha,n});}
  }
  /* special keyframes */
  if(c.id==='x402'){
   const sc=.85+.35*ramp(u,.52,.8)*(1+3.2*ramp(u,.9,.985));
   ce.el.firstElementChild.style.transform='perspective(700px) translate(-50%,-50%) scale('+sc.toFixed(3)+') rotateY('+(-6+10*u).toFixed(1)+'deg)';
  }
  if(c.id==='code'){
   const sc=lerp(1,.8,u);
   ce.el.firstElementChild.style.transform='perspective(900px) rotateY('+(-12-14*u).toFixed(1)+'deg) scale('+sc.toFixed(3)+') translateX('+(-10*u).toFixed(1)+'vw)';
  }
  if(c.id==='cac'){ce.arr.forEach(a2=>a2.classList.toggle('on',alpha>.5));}
  if(ce.meters.length){
   const w=c.id==='mA'?62:82;
   ce.meters[0].style.width=(alpha*w).toFixed(1)+'%';
  }
  if(c.id==='mA'||c.id==='mB'){
   const sc=.94+.08*Math.sin(alpha*Math.PI);
   ce.el.firstElementChild.style.transform='perspective(700px) translate(-50%,-50%) scale('+sc.toFixed(3)+')';
  }
 });
 /* playground */
 const pgOn=SCENES[i].id==='play';
 pg.style.opacity=pgOn?ramp(u,.06,.28)*(1-ramp(u,.96,1)):0;
 pg.style.pointerEvents=(pgOn&&ramp(u,.06,.28)>.35)?'auto':'none';
}

/* ================= diegetic labels ================= */
const _v=new (glOK?THREE.Vector3:Object)();
function labelWindow(l,i,u){
 if(l.kind==='mem'){
  if(SCENES[i].id==='memory')return ramp(u,.5,.78)*(l.ix===0?.9:.8);
  if(SCENES[i].id==='recall')return .75;
  if(SCENES[i].id==='ask')return .75*(1-ramp(u,.05,.3));
  return 0;
 }
 if(l.kind==='gate'){
  if(SCENES[i].id!=='ask')return 0;
  const passed=pulseHeadZ<=l.pos[2];
  l.el.classList.toggle('on',passed&&pulseHeadZ>-90);
  return (passed?.95:.35)*ramp(u,.45,.6);
 }
 if(l.kind==='core'){
  if(SCENES[i].id==='core')return ramp(u,.12,.35);
  if(SCENES[i].id==='answer')return 1-ramp(u,.05,.3);
  return 0;
 }
 if(l.kind==='fig'){
  let o=0;
  if(SCENES[i].id==='others')o=ramp(u,.22,.45);
  else if(SCENES[i].id==='universe')o=1;
  else if(SCENES[i].id==='api')o=1-ramp(u,.06,.3);
  return o;
 }
 if(l.kind==='hub'){
  if(SCENES[i].id==='network')return ramp(u,.35,.6);
  if(SCENES[i].id==='final')return .9*(1-ramp(u,.1,.3));
  return 0;
 }
 return 0;
}
function updateLabels(i,u){
 if(!glOK)return;
 const cx=innerWidth/2,cy=innerHeight/2;
 labelDefs.forEach(l=>{
  let o=labelWindow(l,i,u);
  if(o<=0){l.el.style.opacity=0;return;}
  _v.set(l.pos[0],l.pos[1],l.pos[2]).project(camera);
  if(_v.z>1||_v.x<-1.4||_v.x>1.4||_v.y<-1.4||_v.y>1.4){l.el.style.opacity=0;return;}
  const x=(_v.x*.5+.5)*innerWidth,y=(-_v.y*.5+.5)*innerHeight;
  const dist=Math.hypot(camera.position.x-l.pos[0],camera.position.y-l.pos[1],camera.position.z-l.pos[2]);
  if(l.kind==='fig')o*=clamp(1.9-dist*.032,.15,1);
  if(l.kind==='hub')o*=clamp(2.2-dist*.018,.2,1);
  if(l.kind==='mem')o*=clamp(2.0-dist*.045,.15,1);
  l.el.style.opacity=o.toFixed(3);
  l.el.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) translate(-50%,-50%)';
 });
}

/* ================= HUD ================= */
const sceneTag=$('#scene-tag'),progFill=document.querySelector('#progline i'),hint=$('#hint'),demoFlag=$('#demo-flag'),railDots=document.querySelectorAll('#rail .dot');
let lastHud=-1;
function updateHUD(i,u,p){
 if(i!==lastHud){
  sceneTag.innerHTML='<span class="idx">'+String(i+1).padStart(2,'0')+'</span> / <b>'+SCENES[i].name+'</b>';
  railDots.forEach((d,di)=>d.classList.toggle('on',di===i));
  lastHud=i;
 }
 progFill.style.width=(p*100).toFixed(2)+'%';
 hint.style.opacity=p>.005?0:1;
 const dOn=(i===8&&u>.45)||i===9||(i===10&&u<.7);
 demoFlag.style.opacity=dOn?1:0;
}

/* ================= interaction layer ================= */
let mx=0,my=0,mxS=0,myS=0,curX=0,curY=0,ringX=0,ringY=0,pmx=0,pmy=0;
const curDot=$('#cur-dot'),curRing=$('#cur-ring');
addEventListener('mousemove',e=>{
 pmx=e.clientX;pmy=e.clientY;
 mx=(e.clientX/innerWidth)*2-1;my=-((e.clientY/innerHeight)*2-1);
},{passive:true});
document.addEventListener('mouseover',e=>{
 if(e.target.closest('[data-hover],a,button,.npc-card,.lbl.mem,#pg-runbtn,textarea'))document.body.classList.add('cur-hover');
 if(e.target.closest('[data-cur="gold"],.npc-card'))document.body.classList.add('cur-gold');
});
document.addEventListener('mouseout',e=>{
 if(e.target.closest('[data-hover],a,button,.npc-card,.lbl.mem,#pg-runbtn,textarea'))document.body.classList.remove('cur-hover');
 if(e.target.closest('[data-cur="gold"],.npc-card'))document.body.classList.remove('cur-gold');
});
/* magnetic buttons */
document.querySelectorAll('[data-magnet]').forEach(b=>{
 b.addEventListener('mousemove',e=>{
  const r=b.getBoundingClientRect();
  const dx=(e.clientX-r.left-r.width/2)/r.width,dy=(e.clientY-r.top-r.height/2)/r.height;
  b.style.transform='translate('+(dx*10).toFixed(1)+'px,'+(dy*8).toFixed(1)+'px)';
  b.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
  b.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
 });
 b.addEventListener('mouseleave',()=>{b.style.transform='';});
});
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>{
 scrollToScene(b.dataset.goto==='play'?16:15);
}));
/* memory node hover → illuminate connected memories */
window.__memHover=(ix,on)=>{
 const pos=MEM_NODES[ix][1];
 labelDefs.forEach((l,li)=>{
  if(l.kind!=='mem')return;
  const d=Math.hypot(l.pos[0]-pos[0],l.pos[1]-pos[1],l.pos[2]-pos[2]);
  if(on&&d<7.5&&d>.1)l.el.classList.add('lit');
  else l.el.classList.remove('lit');
 });
 if(on&&glOK){heroMat.uniforms.uMouse2.value.set(pos[0],pos[1],pos[2]);hoverMem=true;}
 else{hoverMem=null;if(curSceneIdx===4&&glOK)heroMat.uniforms.uMouse2F.value=0;}
};
/* NPC figure hover → glance toward cursor */
labelDefs.forEach((l,li)=>{
 if(l.kind!=='fig')return;
 const fi=FIGS.indexOf(l.fig);
 l.el.addEventListener('mouseenter',()=>{if(figMats[fi])figMats[fi].__hover=true;});
 l.el.addEventListener('mouseleave',()=>{if(figMats[fi])figMats[fi].__hover=false;});
});
/* playground tilt */
const pgi=$('#pg-inner');
if(pgi&&!TOUCH){
 pg.addEventListener('mousemove',e=>{
  const r=pgi.getBoundingClientRect();
  const dx=(e.clientX-r.left-r.width/2)/r.width,dy=(e.clientY-r.top-r.height/2)/r.height;
  pgi.style.transform='rotateY('+(dx*4).toFixed(2)+'deg) rotateX('+(-dy*3).toFixed(2)+'deg)';
 });
 pg.addEventListener('mouseleave',()=>{pgi.style.transform='';});
}

/* ================= playground logic ================= */
function npcRespond(msg){
 const m=(msg||'').toLowerCase();
 if(/threat|sword|kill|fight|blade/.test(m))return 'Put the sword away first.\nThen we talk — like civilized people.';
 if(/remember|met|before|again/.test(m))return 'You\'re the one who fixed my cellar door.\nI don\'t forget debts.';
 if(/what happened|here|this place|tavern/.test(m))return 'You really want to know?\n…Then put the sword away first.';
 if(/hello|hi |hey|greetings/.test(m))return 'You\'re new. I can smell it.\nWhat are you drinking?';
 if(/gold|money|pay|usdc|price/.test(m))return 'Everything costs something.\nEven answers. Especially answers.';
 return 'Talk\'s cheap, friend.\nAsk me something that matters.';
}
const runBtn=$('#pg-runbtn'),pgCode=$('#pg-code'),pgResp=$('#pg-resp'),
      stPay=$('#st-pay'),stAI=$('#st-ai'),stLat=$('#st-lat');
let pgBusy=false;
async function runPlayground(){
 if(pgBusy)return;pgBusy=true;
 runBtn.disabled=true;runBtn.textContent='PROCESSING ▸';
 pgResp.innerHTML='<span class="idle">// awaiting settlement…</span>';
 stPay.classList.remove('ok');stAI.classList.remove('ok');stLat.classList.remove('ok');
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const t0=performance.now();
 pgResp.innerHTML='<span class="idle">HTTP 402 — payment required · 0.01 USDC (demo)</span>';
 await sleep(700);
 pgResp.innerHTML='<span class="idle">EIP-191 signature request → wallet…</span>';
 await sleep(800);
 stPay.classList.add('ok');
 pgResp.innerHTML='<span class="idle">payment verified — generating…</span>';
 await sleep(650);
 let msg='What happened here?';
 try{const j=JSON.parse(pgCode.value);msg=j.player_message||msg;}catch(e){}
 const out=npcRespond(msg);
 const lat=(performance.now()-t0+620+Math.random()*400)|0;
 pgResp.innerHTML='<span class="who">GARRICK — SUSPICIOUS BARTENDER · TRUST 47%</span><span id="pg-stream"></span><span class="caret"></span>';
 const stream=$('#pg-stream');
 for(let i=0;i<out.length;i++){
  stream.textContent=out.slice(0,i+1);
  if(i%3===0)await sleep(16);
 }
 document.querySelector('#pg-resp .caret').remove();
 stAI.classList.add('ok');stLat.classList.add('ok');
 stLat.innerHTML='<span class="led"></span>LATENCY '+lat+' MS · −0.01 USDC (DEMO)';
 runBtn.disabled=false;runBtn.textContent='RUN REQUEST ▸';pgBusy=false;
}
runBtn.addEventListener('click',runPlayground);

/* ================= boot / loop ================= */
if('scrollRestoration' in history)history.scrollRestoration='manual';
addEventListener('scroll',()=>{targetP=clamp(scrollY/maxScroll(),0,1);},{passive:true});
let targetP=0,p=0;
if(!glOK){
 document.body.classList.add('no3d');
 document.body.style.height='auto';
 $('#loader').style.opacity=0;setTimeout(()=>{const l=$('#loader');l&&l.remove();},900);
 chapEls.forEach(ce=>{ce.el.style.opacity=1;ce.el.style.visibility='visible';ce.el.style.transform='none';});
 pg.style.opacity=1;pg.style.pointerEvents='auto';pg.style.position='relative';pg.style.minHeight='100vh';
 txStage.style.opacity=1;demoTag.style.opacity=1;sigPanel.style.opacity=1;
}else{
 document.body.style.height=(TOTAL_LEN*100)+'vh';
 targetP=p=clamp(scrollY/maxScroll(),0,1);
}
addEventListener('resize',()=>{
 if(!glOK)return;
 renderer.setSize(innerWidth,innerHeight);
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
},{passive:true});

const camDir=glOK?new THREE.Vector3():null;
const mTmp=glOK?new THREE.Vector3():null;
let lastT=performance.now()/1000,loadT=0;
function frame(){
 requestAnimationFrame(frame);
 if(!glOK)return;
 const now=performance.now()/1000,dt=Math.min(now-lastT,.05);lastT=now;
 loadT+=dt;
 p+=(targetP-p)*(REDUCED?1:1-Math.exp(-dt*3.4));
 const sc=sceneAt(p);curSceneIdx=sc.i;curSceneU=sc.u;
 const id=SCENES[sc.i].id;
 /* camera */
 camAt(id,sc.u);
 mxS+=(mx-mxS)*.06;myS+=(my-myS)*.06;
 const par=REDUCED||TOUCH?0:1;
 camera.position.set(camState.pos[0]+mxS*.5*par,camState.pos[1]+myS*.35*par,camState.pos[2]);
 camera.fov=camState.fov;camera.updateProjectionMatrix();
 camera.lookAt(camState.look[0]+mxS*.9*par,camState.look[1]+myS*.6*par,camState.look[2]);
 /* time uniforms */
 heroMat.uniforms.uTime.value=now;
 envMat.uniforms.uTime.value=now*.8;
 dustMat.uniforms.uTime.value=now*.6;
 figMats.forEach(m=>m.uniforms.uTime.value=now);
 /* focus = distance to subject */
 const fx=camState.look[0]-camera.position.x,fy=camState.look[1]-camera.position.y,fz=camState.look[2]-camera.position.z;
 const fd=Math.hypot(fx,fy,fz);
 [heroMat,envMat,dustMat].forEach(m=>{m.uniforms.uFocus.value=fd;m.uniforms.uFocusR.value=Math.max(14,fd*.95);});
 /* cursor-reactive world point */
 camera.getWorldDirection(camDir);
 mTmp.copy(camera.position).addScaledVector(camDir,fd);
 heroMat.uniforms.uMouse.value.lerp(mTmp,.2);
 if(hoverMem&&id==='memory')heroMat.uniforms.uMouse2F.value=2.1;
 /* figures glance */
 figPts.forEach((f,fi)=>{
  const target=(figMats[fi].__hover?mxS*.45:0);
  f.rotation.y+=(target-f.rotation.y)*.08;
 });
 updateScene(sc.i,sc.u,now);
 updateChapters(sc.i,sc.u);
 updateLabels(sc.i,sc.u);
 updateWidgets(sc.i,sc.u,now);
 updateHUD(sc.i,sc.u,p);
 /* letterbox */
 $('#lb-top').style.height=$('#lb-bot').style.height=(lbTarget*7).toFixed(2)+'vh';
 /* cursor */
 if(!TOUCH){
  curX+=(pmx-curX)*.55;curY+=(pmy-curY)*.55;
  ringX+=(pmx-ringX)*.16;ringY+=(pmy-ringY)*.16;
  curDot.style.transform='translate('+curX+'px,'+curY+'px) translate(-50%,-50%)';
  curRing.style.transform='translate('+ringX+'px,'+ringY+'px) translate(-50%,-50%)';
 }
 renderer.render(scene,camera);
 if(loadT>1.2){const l=$('#loader');if(l&&l.style.opacity!=='0'){l.style.opacity=0;setTimeout(()=>{const x=$('#loader');x&&x.remove();},1000);}}
}
if(glOK)requestAnimationFrame(frame);
else{ /* static fallback still wires interactivity */ runBtn.addEventListener('click',runPlayground); }
})();
