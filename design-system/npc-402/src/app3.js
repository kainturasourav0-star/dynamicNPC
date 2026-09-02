/* =====================================================================
   part 3 — engine: three.js scene, particle systems, camera, scenes 0-8
   ===================================================================== */
let renderer,scene,camera,glOK=true;
try{
 renderer=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Q.dpr);
 renderer.setSize(innerWidth,innerHeight);
 renderer.setClearColor(0x030509,1);
}catch(e){glOK=false}
if(glOK){
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,500);
}

/* ---------- shared shaders ---------- */
const CLOUD_VERT=`
attribute vec3 aPosB; attribute vec3 aRand; attribute float aRole;
uniform float uMorph,uTime,uSize,uDrift,uSwirl,uConverge,uBoost,uTintC,uTintG,uRoleShift,uFlow,uFlowZ,uFlowSpan,uFogD,uFocus,uFocusR,uOpacity,uTwinkle,uMouseF,uMouse2F;
uniform vec3 uMouse; uniform vec3 uMouse2; uniform vec3 uCenter;
varying vec3 vCol; varying float vA;
void main(){
 float mk=clamp((uMorph-aRand.x*0.38)/0.62,0.0,1.0); mk=mk*mk*(3.0-2.0*mk);
 vec3 p=mix(position,aPosB,mk);
 p-=uCenter;
 p+=vec3(sin(uTime*0.55+aRand.y*6.283),cos(uTime*0.42+aRand.z*6.283),sin(uTime*0.5+aRand.x*6.283))*uDrift*(0.5+0.5*aRand.y);
 float rr=length(p.xz);
 float ang=uSwirl*(1.0-clamp(rr/22.0,0.0,1.0));
 float ca=cos(ang),sa=sin(ang);
 p=vec3(p.x*ca-p.z*sa,p.y,p.x*sa+p.z*ca);
 p=mix(p,vec3(0.0),uConverge*(0.35+0.65*aRand.z));
 p+=uCenter;
 if(uFlow>0.0){ p.z=uFlowZ+mod(p.z-uFlowZ+uFlow*(0.4+0.6*aRand.y),uFlowSpan)-uFlowSpan*0.5; }
 vec3 d1=p-uMouse; float dl1=length(d1);
 float mf=uMouseF*exp(-dl1*dl1*0.18);
 p+=normalize(d1+vec3(1e-4))*mf;
 vec3 d2=p-uMouse2; float dl2=length(d2);
 float mf2=uMouse2F*exp(-dl2*dl2*0.06);
 p+=normalize(d2+vec3(1e-4))*mf2*0.5;
 vec4 mv=modelViewMatrix*vec4(p,1.0);
 float dep=max(-mv.z,0.1);
 float band=1.0-clamp(abs(dep-uFocus)/uFocusR,0.0,1.0);
 float tw=1.0;
 if(uTwinkle>0.0){ tw=0.82+0.22*sin(uTime*(2.0+2.0*aRole)+aRand.y*6.283); }
 vec3 cyan=vec3(0.25,0.88,1.0),gold=vec3(1.0,0.72,0.36),white=vec3(0.92,0.96,1.0);
 vec3 base=aRole<0.5?cyan:(aRole<1.5?gold:white);
 base=mix(base,cyan,uRoleShift*step(0.5,aRole)*step(aRole,1.5));
 base=mix(base,cyan,uTintC); base=mix(base,gold,uTintG);
 vCol=base*(0.5+0.5*band)*tw*(1.0+mf*3.0+mf2*4.0+uBoost);
 vA=(0.3+0.7*band)*exp(-pow(dep*uFogD,2.0));
 gl_PointSize=min(uSize*(0.55+0.9*aRand.y)*(1.0+mf*1.5)*(150.0/dep),44.0);
 gl_Position=projectionMatrix*mv;
}`;
const CLOUD_FRAG=`
precision mediump float;
varying vec3 vCol; varying float vA; uniform float uOpacity;
void main(){
 vec2 q=gl_PointCoord-vec2(0.5);
 float d=length(q);
 float a=smoothstep(0.5,0.08,d)+smoothstep(0.14,0.0,d)*0.7;
 gl_FragColor=vec4(vCol,a*vA*uOpacity);
}`;
const LINE_VERT=`
attribute vec3 aCol; varying vec3 vC; varying float vF;
uniform float uFogD;
void main(){
 vec4 mv=modelViewMatrix*vec4(position,1.0);
 vF=exp(-pow(max(-mv.z,0.1)*uFogD,2.0));
 vC=aCol;
 gl_Position=projectionMatrix*mv;
}`;
const LINE_FRAG=`
precision mediump float; varying vec3 vC; varying float vF; uniform float uOpacity;
void main(){ gl_FragColor=vec4(vC*vF*uOpacity,1.0); }`;

function cloudUniforms(center){
 return {
  uMorph:{value:0},uTime:{value:0},uSize:{value:Q.size},uDrift:{value:.1},uSwirl:{value:0},
  uConverge:{value:0},uBoost:{value:0},uTintC:{value:0},uTintG:{value:0},uRoleShift:{value:0},
  uFlow:{value:0},uFlowZ:{value:0},uFlowSpan:{value:1},uFogD:{value:.02},uFocus:{value:14},
  uFocusR:{value:16},uOpacity:{value:1},uTwinkle:{value:REDUCED?0:1},
  uMouse:{value:new THREE.Vector3(0,0,0)},uMouseF:{value:TOUCH?0:.5},
  uMouse2:{value:new THREE.Vector3(999,999,999)},uMouse2F:{value:0},
  uCenter:{value:new THREE.Vector3(center[0],center[1],center[2])}
 };
}
function makeCloudMat(center){
 return new THREE.ShaderMaterial({
  uniforms:cloudUniforms(center),vertexShader:CLOUD_VERT,fragmentShader:CLOUD_FRAG,
  transparent:true,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending
 });
}
function cloudGeometry(N,shape){
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.BufferAttribute(shape.pos.slice(),3));
 g.setAttribute('aPosB',new THREE.BufferAttribute(shape.pos.slice(),3));
 const rand=new Float32Array(N*3),role=new Float32Array(N);
 const r=mulberry(42);
 for(let i=0;i<N;i++){rand[i*3]=r();rand[i*3+1]=r();rand[i*3+2]=r();
  const t=r(); role[i]=t<.13?0:(t<.21?1:2);} /* 13% cyan · 8% gold · rest white */
 g.setAttribute('aRand',new THREE.BufferAttribute(rand,3));
 g.setAttribute('aRole',new THREE.BufferAttribute(role,1));
 return g;
}

/* ---------- shapes (built once) ---------- */
const SHAPES={};
let heroGeo,heroMat,hero;
let envMat,envPts;
let dustMat,dustPts;
let lineGeo,lineMat,lines,curLineKey='',lineOpTarget=0,lineOp=0;
let envLineGeo,envLineMat,envLines,curEnvLineKey='',envLineOp=0;
let glowTex;
const SPR={};
let gates=[],pulsePts,pulseMat,figPts=[],figMats=[];
let figLinks,figLinkMat;
let pulseHeadZ=-999;

if(glOK){
 /* glow sprite texture */
 (function(){const c=document.createElement('canvas');c.width=c.height=128;
  const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.5)');
  g.addColorStop(.6,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);
  glowTex=new THREE.CanvasTexture(c);})();

 SHAPES.singleton=shapeSingleton(Q.nHero);
 SHAPES.neural=shapeNeural(Q.nHero);
 SHAPES.world=shapeWorld(Q.nHero);
 SHAPES.garrick=shapeGarrick(Q.nHero);
 SHAPES.memory=shapeMemory(Q.nHero);
 SHAPES.chamber=shapeChamber(Q.nHero);
 SHAPES.tunnel=shapeTunnel(Q.nHero);
 SHAPES.core=shapeCore(Q.nHero);
 SHAPES.code=shapeCode(Q.nHero);
 SHAPES.universe=shapeUniverse(Q.nHero);
 SHAPES.silhouette=shapeSilhouette(Q.nHero);
 SHAPES.garrick2=(function(){const l=garrickCloud(Q.nHero,7);
   for(let i=0;i<Q.nHero;i++){l[i*3+2]-=262;}
   return {pos:l,edges:null,center:[0,1.6,-262]};})();

 heroGeo=cloudGeometry(Q.nHero,SHAPES.singleton);
 heroMat=makeCloudMat([0,0,0]);
 hero=new THREE.Points(heroGeo,heroMat);hero.frustumCulled=false;scene.add(hero);

 /* ambient environment cloud (dim second layer of the world) */
 const envShape=shapeWorld(Q.nEnv);
 envMat=makeCloudMat([0,0,-35]);
 envPts=new THREE.Points(cloudGeometry(Q.nEnv,envShape),envMat);
 envPts.frustumCulled=false;scene.add(envPts);

 /* ever-present dust field */
 const r=mulberry(777),N=Q.nDust,dpos=new Float32Array(N*3);
 for(let i=0;i<N;i++){dpos[i*3]=(r()-.5)*74;dpos[i*3+1]=(r()-.5)*26;dpos[i*3+2]=30-r()*440;}
 dustMat=makeCloudMat([0,0,-190]);dustMat.uniforms.uSize.value=Q.size*.55;
 dustPts=new THREE.Points(cloudGeometry(N,{pos:dpos}),dustMat);
 dustPts.frustumCulled=false;scene.add(dustPts);

 /* connection lines — main system */
 lineMat=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:0},uFogD:{value:.015}},
   vertexShader:LINE_VERT,fragmentShader:LINE_FRAG,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 lineGeo=new THREE.BufferGeometry();
 lineGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(3),3));
 lineGeo.setAttribute('aCol',new THREE.BufferAttribute(new Float32Array(3),3));
 lines=new THREE.LineSegments(lineGeo,lineMat);lines.frustumCulled=false;scene.add(lines);

 envLineMat=new THREE.ShaderMaterial({uniforms:{uOpacity:{value:0},uFogD:{value:.014}},
   vertexShader:LINE_VERT,fragmentShader:LINE_FRAG,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 envLineGeo=new THREE.BufferGeometry();
 envLineGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(3),3));
 envLineGeo.setAttribute('aCol',new THREE.BufferAttribute(new Float32Array(3),3));
 envLines=new THREE.LineSegments(envLineGeo,envLineMat);envLines.frustumCulled=false;scene.add(envLines);

 /* glow sprites */
 ['lamp','rim','horizon','coreGlow','aug','back','glowA','glowB'].forEach(k=>{
   const m=new THREE.SpriteMaterial({map:glowTex,color:0xffffff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
   const s=new THREE.Sprite(m);s.scale.set(1,1,1);scene.add(s);SPR[k]=s;
 });

 /* pipeline gates (scene 07) */
 for(let g=0;g<5;g++){
   const pts=[];for(let v=0;v<=48;v++){const a=v/48*6.2832;pts.push(new THREE.Vector3(Math.cos(a)*3.6,Math.sin(a)*3.2,0));}
   const geo=new THREE.BufferGeometry().setFromPoints(pts);
   const m=new THREE.LineBasicMaterial({color:0x3fe0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
   const l=new THREE.LineLoop(geo,m);l.position.set(0,2,GATES[g][1]);scene.add(l);
   gates.push(l);
 }
 /* data pulse comet (scene 07) */
 (function(){
  const N=Q.nPulse;const pos=new Float32Array(N*3);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  pulseMat=new THREE.PointsMaterial({map:glowTex,color:0xbff4ff,size:.5,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true});
  pulsePts=new THREE.Points(geo,pulseMat);pulsePts.frustumCulled=false;scene.add(pulsePts);
 })();
 /* NPC figures (scenes 14-15) */
 FIGS.forEach((f,i)=>{
  const local=garrickCloud(Q.nFig,100+i*13);
  for(let k=0;k<Q.nFig;k++){local[k*3]*=f.sc;local[k*3+1]*=f.sc;local[k*3+2]*=f.sc;}
  const mat=makeCloudMat([f.pos[0],f.pos[1]+1.6*f.sc,f.pos[2]]);
  mat.uniforms.uSize.value=Q.size*.8;
  const pts=new THREE.Points(cloudGeometry(Q.nFig,{pos:local}),mat);
  pts.position.set(f.pos[0],f.pos[1],f.pos[2]);pts.frustumCulled=false;pts.visible=false;
  scene.add(pts);figPts.push(pts);figMats.push(mat);
 });
 /* figure links */
 (function(){
  const segs=[];const H=FIGS.map(f=>[f.pos[0],f.pos[1]+2.2*f.sc,f.pos[2]]);
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++){if(Math.random()<.6)segs.push(...H[i],...H[j]);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(segs),3));
  figLinkMat=new THREE.LineBasicMaterial({color:0x3fe0ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
  figLinks=new THREE.LineSegments(geo,figLinkMat);figLinks.frustumCulled=false;scene.add(figLinks);
 })();
}

/* ---------- hero morph control ---------- */
let curPair='';
function setHeroPair(a,b){
 const key=a+'|'+b;if(key===curPair||!glOK)return;curPair=key;
 heroGeo.attributes.position.array.set(SHAPES[a].pos);heroGeo.attributes.position.needsUpdate=true;
 heroGeo.attributes.aPosB.array.set(SHAPES[b].pos);heroGeo.attributes.aPosB.needsUpdate=true;
}
function setLines(name,color,op){
 if(!glOK)return;
 const key=name;if(key===curLineKey){lineOpTarget=op;return;}
 curLineKey=key;lineOpTarget=op;
 const e=SHAPES[name].edges;if(!e){lineGeo.attributes.position=new THREE.BufferAttribute(new Float32Array(3),3);return;}
 lineGeo.attributes.position=new THREE.BufferAttribute(e.slice(),3);
 const n=e.length/3,col=new Float32Array(n*3);
 for(let i=0;i<n;i++){col[i*3]=color[0];col[i*3+1]=color[1];col[i*3+2]=color[2];}
 lineGeo.attributes.aCol=new THREE.BufferAttribute(col,3);
}
function setEnvLines(name,color,op){
 if(!glOK)return;
 const key=name;if(key===curEnvLineKey){return;}
 curEnvLineKey=name;
 const e=SHAPES[name].edges;if(!e)return;
 envLineGeo.attributes.position=new THREE.BufferAttribute(e.slice(),3);
 const n=e.length/3,col=new Float32Array(n*3);
 for(let i=0;i<n;i++){col[i*3]=color[0];col[i*3+1]=color[1];col[i*3+2]=color[2];}
 envLineGeo.attributes.aCol=new THREE.BufferAttribute(col,3);
 envLineOp=op;
}
function setSpr(k,x,y,z,s,r,g,b,op){
 if(!glOK)return;const s2=SPR[k];
 s2.position.set(x,y,z);s2.scale.set(s,s,1);s2.material.color.setRGB(r,g,b);s2.material.opacity=op;
}

/* ---------- camera choreography ---------- */
const CAM={
 void:[[0,0,0,26,0,0,0,55],[.3,0,0,18,0,0,0,55],[.55,0,0,10,0,1,-6,62],[.8,0,.5,0,0,2,-14,66],[1,0,1,-12,0,2,-22,66]],
 world:[[0,0,1,-12,0,2,-22,66],[.35,1.5,1.5,-30,0,2,-55,62],[.65,-1,2,-44,0,2.4,-66,58],[1,.5,1.8,-56,0,2.2,-70,50]],
 npc:[[0,.5,1.8,-56,0,2.2,-70,50],[.5,.2,2,-62.5,0,2.3,-70,46],[1,0,2.05,-66.5,0,2.45,-70,42]],
 mind:[[0,0,2.05,-66.5,0,2.2,-70,44],[.5,4.7,2.4,-68.3,0,2.2,-70,46],[1,3.54,2.6,-74.2,0,2.2,-70,46]],
 memory:[[0,3.54,2.6,-74.2,0,2.2,-70,46],[.4,0,5,-56,0,2,-70,55],[.75,2.5,3.5,-63,0,2.5,-70,58],[1,1.5,2.5,-59,-1,2.5,-66,60]],
 recall:[[0,1.5,2.5,-59,-1,2.5,-66,60],[.3,-2.5,2,-66,-4.5,1.5,-73,52],[.5,-3.8,1.8,-69.5,-5.5,1.2,-75,44],[.62,-3.8,1.8,-69.5,-5.5,1.2,-75,44],[.8,-1,2.2,-64,-2,2,-72,54],[.9,0,2.2,-60,0,2,-70,58],[1,0,2.2,-60,1,2.2,-72,58]],
 ask:[[0,0,2.2,-60,1,2.2,-72,58],[.3,0,2,-56,0,2,-70,55],[.75,0,2.2,-58,0,2.4,-84,60],[1,0,2.4,-60,0,2.4,-98,64]],
 process:[[0,0,2.4,-60,0,2.4,-98,64],[.25,0,2.2,-72,0,2,-110,62],[.5,0,2,-88,0,2,-125,62],[.75,0,2,-104,0,2,-140,62],[1,0,2,-118,0,2,-152,62]],
 price:[[0,0,2,-118,0,2,-152,62],[.4,0,2,-140,0,2,-175,66],[.75,0,2,-168,0,2,-200,68],[1,0,2,-186,0,2,-214,68]],
 settle:[[0,0,2,-186,0,2,-214,68],[.5,0,2,-204,0,2,-228,66],[1,0,2,-222,0,2,-244,62]],
 transmute:[[0,0,2,-222,0,2,-244,62],[.5,0,2,-238,0,2,-258,58],[1,0,2.2,-246,0,2,-262,54]],
 core:[[0,0,2.2,-246,0,2,-262,54],[.5,8,5,-252,0,2,-262,50],[1,9.5,6,-268,0,2,-262,48]],
 answer:[[0,9.5,6,-268,0,2,-262,48],[.35,4,3.4,-252,0,2.4,-262,46],[.7,0,2.6,-246,0,2.5,-262,44],[1,0,2.5,-247.5,0,2.5,-262,42]],
 others:[[0,0,2.5,-247.5,0,2.5,-262,42],[.4,4,3,-252,4,2.8,-276,48],[1,8,3.2,-256,6,2.8,-290,52]],
 universe:[[0,8,3.2,-256,6,2.8,-290,52],[.25,-2,2.6,-272,9,3,-276,50],[.5,-12,3.4,-282,-9,3.4,-284,48],[.75,-6,3.8,-300,14,3.6,-296,52],[1,6,4.4,-318,0,4,-345,56]],
 api:[[0,6,4.4,-318,0,4,-345,56],[.4,2,5,-334,0,4,-362,56],[.75,0,4.6,-346,0,4,-368,52],[1,0,4.4,-352,0,4,-372,48]],
 play:[[0,0,4.4,-352,0,4,-372,48],[.5,.6,4.5,-353.5,0,4,-372,48],[1,0,4.4,-355,0,4,-372,47]],
 network:[[0,0,4.4,-355,0,4,-372,47],[.45,0,8,-322,0,4,-368,58],[.8,0,12,-306,0,4,-368,68],[1,0,14,-300,0,4,-368,74]],
 final:[[0,0,14,-300,0,4,-368,74],[.3,0,9,-320,0,3,-368,66],[.6,0,4.4,-344,0,2.6,-368,54],[.8,0,3.4,-352,0,2.6,-368,48],[1,0,3.2,-354,0,2.6,-368,46]],
};
const camState={pos:[0,0,26],look:[0,0,0],fov:55};
function camAt(id,u){
 const k=CAM[id];if(!k)return;
 let a=k[0],b=k[k.length-1];
 for(let i=0;i<k.length-1;i++)if(u>=k[i][0]&&u<=k[i+1][0]){a=k[i];b=k[i+1];break;}
 const t=(b[0]===a[0])?0:sm(clamp((u-a[0])/(b[0]-a[0]),0,1));
 for(let c=0;c<3;c++){camState.pos[c]=lerp(a[c+1],b[c+1],t);camState.look[c]=lerp(a[c+4],b[c+4],t);}
 camState.fov=lerp(a[7],b[7],t);
}

/* ---------- hero pair per scene ---------- */
const CYAN=[.25,.85,1],GOLD=[1,.72,.34],DIMW=[.6,.7,.8],GOLDL=[.9,.7,.4];
function pairFor(i,u){
 switch(SCENES[i].id){
  case 'void':    return u<.22?['singleton','singleton',0]:u<.62?['singleton','neural',ramp(u,.22,.62)]:['neural','neural',0];
  case 'world':   return ['neural','world',ramp(u,.06,.72)];
  case 'npc':     return ['world','garrick',ramp(u,.02,.5)];
  case 'mind':    return ['garrick','garrick',0];
  case 'memory':  return ['garrick','memory',ramp(u,.08,.7)];
  case 'recall':  return ['memory','memory',0];
  case 'ask':     return ['memory','memory',0];
  case 'process': return ['memory','chamber',ramp(u,.04,.6)];
  case 'price':   return ['chamber','tunnel',ramp(u,.02,.5)];
  case 'settle':  return ['tunnel','tunnel',0];
  case 'transmute':return['tunnel','core',ramp(u,.05,.75)];
  case 'core':    return ['core','core',0];
  case 'answer':  return ['core','garrick2',ramp(u,.12,.62)];
  case 'others':  return ['garrick2','garrick2',0];
  case 'universe':return ['garrick2','garrick2',0];
  case 'api':     return ['garrick2','code',ramp(u,.1,.7)];
  case 'play':    return ['code','code',0];
  case 'network': return ['code','universe',ramp(u,.05,.6)];
  case 'final':   return u<.12?['universe','universe',0]:['universe','silhouette',ramp(u,.12,.6)];
 }
}

/* ---------- scene updates (0-8) ---------- */
const FOGD={void:.021,world:.015,npc:.011,mind:.015,memory:.008,recall:.007,ask:.013,process:.012,price:.010,settle:.010,transmute:.009,core:.006,answer:.012,others:.014,universe:.011,api:.008,play:.012,network:.004,final:.011};
let lbTarget=0,envAct='A';
function updateScene(i,u,time){
 const id=SCENES[i].id;
 const H=heroMat.uniforms;
 const [a,b,k]=pairFor(i,u);
 setHeroPair(a,b);
 H.uMorph.value=k;
 const cA=SHAPES[a].center,cB=SHAPES[b].center;
 H.uCenter.value.set(lerp(cA[0],cB[0],k),lerp(cA[1],cB[1],k),lerp(cA[2],cB[2],k));
 H.uFogD.value=FOGD[id];
 lineMat.uniforms.uFogD.value=FOGD[id];
 envLineMat.uniforms.uFogD.value=Math.max(FOGD[id],.012);
 dustMat.uniforms.uFogD.value=FOGD[id];
 /* defaults */
 H.uFlow.value=0;H.uSwirl.value=0;H.uConverge.value=0;H.uRoleShift.value=0;
 H.uTintC.value=0;H.uTintG.value=0;H.uBoost.value=0;H.uOpacity.value=1;H.uDrift.value=.1;
 let envOp=0,dustOp=.16,dustC=0,dustG=0,lb=0;
 lineOpTarget=0;
 for(const k2 in SPR)SPR[k2].material.opacity=0;
 gates.forEach(g=>g.material.opacity=0);
 let pulseOp=0;pulseHeadZ=-999;
 let figOp=0,figLinkOp=0,ext=null;

 switch(id){
  case 'void':{
   H.uSize.value=lerp(Q.size*1.7,Q.size,ramp(u,.25,.65));
   H.uBoost.value=lerp(1.2,0,ramp(u,.1,.5));
   H.uTintC.value=.35;H.uDrift.value=.05;
   dustOp=.10;
   setLines('neural',CYAN,.45*ramp(u,.42,.7));
   break;}
  case 'world':{
   H.uTintC.value=.10;
   envOp=.34*ramp(u,.3,.75);dustOp=.15;
   setEnvLines('world',DIMW,1);envLineMat.uniforms.uOpacity.value=.28*envOp;
   setLines('world',CYAN,.3*ramp(u,.5,.85));
   setSpr('horizon',0,1,-97,64,1,.62,.3,.30*ramp(u,.4,.85));
   setSpr('lamp',1.6,3.1,-69.4,5,1,.72,.36,.45*ramp(u,.55,.95));
   break;}
  case 'npc':{
   H.uTintC.value=.12;
   envOp=.20*(1-ramp(u,.3,.9));dustOp=.13;
   setEnvLines('world',DIMW,1);envLineMat.uniforms.uOpacity.value=.2*envOp;
   setSpr('lamp',1.35,2.85,-69.5,4.4,1,.7,.34,.55);
   setSpr('rim',-1.7,2.7,-71.6,4.2,.25,.85,1,.38);
   setSpr('aug',.15,2.68,-69.86,.6,.3,.9,1,.5+.3*Math.sin(time*3));
   lb=ramp(u,.2,.45);
   break;}
  case 'mind':{
   H.uTintC.value=lerp(.1,.4,u);H.uDrift.value=lerp(.08,.24,u);H.uBoost.value=.28*u;
   envOp=.18*(1-ramp(u,.1,.55));dustOp=lerp(.13,.4,u);dustC=.4*u;
   setEnvLines('world',DIMW,1);envLineMat.uniforms.uOpacity.value=.15*envOp;
   setSpr('lamp',1.35,2.85,-69.5,4.4,1,.7,.34,.5*(1-u));
   setSpr('rim',-1.7,2.7,-71.6,4.2,.25,.85,1,.3+.3*u);
   setSpr('aug',.15,2.68,-69.86,.7,.3,.9,1,.55+.35*Math.sin(time*3.2));
   break;}
  case 'memory':{
   H.uTintC.value=.3;H.uBoost.value=lerp(.3,.05,u);H.uDrift.value=.14;
   envOp=0;dustOp=.3;dustC=.3;
   setLines('memory',CYAN,.5*ramp(u,.45,.85));
   setSpr('rim',0,2,-70,9,.25,.85,1,.16*ramp(u,.2,.6));
   break;}
  case 'recall':{
   H.uTintC.value=.25;H.uDrift.value=.10;
   dustOp=.22;dustC=.25;
   setLines('memory',CYAN,.55);
   /* highlight the ledger node being read */
   const hz=ramp(u,.12,.3)*(1-ramp(u,.42,.5));
   H.uMouse2.value.set(-5.6,.1,-75.5);H.uMouse2F.value=hz*2.4;
   const hz2=ramp(u,.6,.75)*(1-ramp(u,.88,.96));
   if(hz2>0){H.uMouse2.value.set(5,.1,-74.5);H.uMouse2F.value=hz2*2.4;}
   break;}
  case 'ask':{
   H.uTintC.value=.3;H.uDrift.value=.05;H.uOpacity.value=.35;
   dustOp=.12;dustC=.35;
   setLines('memory',CYAN,.2);
   /* pulse travelling PLAYER→MEMORY→PERSONALITY→WORLD STATE→AI ENGINE */
   const pt=ramp(u,.5,.95);
   if(pt>0&&pt<1){
     pulseOp=1;pulseHeadZ=lerp(-54,-98,pt);
     gates.forEach((g,gi)=>{
       const gz=GATES[gi][1];
       g.material.opacity=clamp(1-Math.abs(pulseHeadZ-gz)*.16,0,1)*.85;
     });
     setSpr('glowA',0,2,pulseHeadZ,3,.7,.95,1,.5);
   }
   break;}
  case 'process':{
   H.uTintC.value=.32;H.uDrift.value=.12;H.uBoost.value=.12;
   dustOp=.2;dustC=.4;
   setLines('chamber',CYAN,.5*ramp(u,.3,.6));
   setSpr('glowA',0,2,camState.pos[2]-16,10,.25,.85,1,.10);
   setSpr('glowB',0,2,camState.pos[2]-34,10,.25,.85,1,.07);
   break;}
  case 'price':{
   H.uTintC.value=lerp(.3,.04,ramp(u,.3,.7));
   H.uTintG.value=ramp(u,.3,.7)*.55;
   dustOp=.22;dustG=.45;dustC=.1;
   setLines('tunnel',GOLDL,.6*ramp(u,.3,.6));
   setSpr('glowA',-4,2,-176,10,1,.75,.4,.22);
   setSpr('glowB',4,2,-212,10,1,.75,.4,.22);
   break;}
  default: ext=updateSceneB(id,u,time)||null;
 }
 if(SCENES[i].id!=='recall'&&SCENES[i].id!=='ask'){H.uMouse2F.value*=.9;}
 if(ext){
   if('envOp' in ext)envOp=ext.envOp; if('dustOp' in ext)dustOp=ext.dustOp;
   if('dustC' in ext)dustC=ext.dustC; if('dustG' in ext)dustG=ext.dustG;
   if('lb' in ext)lb=ext.lb; if('figOp' in ext)figOp=ext.figOp; if('figLinkOp' in ext)figLinkOp=ext.figLinkOp;
   if('heroOp' in ext)H.uOpacity.value=ext.heroOp;
 }

 /* env cloud act management (move while invisible) */
 const wantAct=(SCENES[i].id==='answer'||['others','universe','api'].includes(SCENES[i].id))?'B':'A';
 if(wantAct!==envAct&&envOp<.02){envAct=wantAct;envPts.position.z=wantAct==='B'?-230:0;envLines.position.z=envPts.position.z;}
 envMat.uniforms.uOpacity.value=envOp;
 envMat.uniforms.uTintC.value=dustC;envMat.uniforms.uTintG.value=dustG*.6;
 envMat.uniforms.uFogD.value=Math.max(FOGD[id],.012);
 dustMat.uniforms.uOpacity.value=dustOp;
 dustMat.uniforms.uTintC.value=dustC;dustMat.uniforms.uTintG.value=dustG;
 lineOp+=(lineOpTarget-lineOp)*.08;
 lineMat.uniforms.uOpacity.value=lineOp*(REDUCED?.9:1)*.9;

 /* letterbox */
 lbTarget+= (lb-lbTarget)*.1;

 /* figures + links */
 figPts.forEach((f,fi)=>{
   f.visible=figOp>0.01;
   const m=figMats[fi].uniforms;
   m.uOpacity.value=figOp*(figMats[fi].__hover?1:.82);
   m.uTintC.value=.1;m.uDrift.value=.06;
   m.uFogD.value=FOGD[id];
 });
 figLinkMat.opacity=figLinkOp;

 /* pulse geometry */
 pulseMat.opacity=pulseOp*(.85+.15*Math.sin(time*20));
 if(pulseOp>0){
   const pos=pulsePts.geometry.attributes.position.array;
   const r=mulberry(9);
   for(let j=0;j<Q.nPulse;j++){
     const t=Math.pow(r(),1.4);
     const z=pulseHeadZ-t*10;
     const a=r()*6.2832+z*.3;
     const rr=(.12+r()*1.15)*(1-t*.5);
     pos[j*3]=Math.cos(a)*rr;pos[j*3+1]=2+Math.sin(a)*rr*.75;pos[j*3+2]=z;
   }
   pulsePts.geometry.attributes.position.needsUpdate=true;
 }
 /* store for part-4 widgets */
 frameState.fog=FOGD[id];frameState.envOp=envOp;
}
