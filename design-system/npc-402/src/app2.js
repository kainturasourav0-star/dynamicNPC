/* =====================================================================
   part 2 — procedural shape library (particle morph targets)
   all coordinates are WORLD-absolute (camera travels -z the whole way)
   ===================================================================== */

function fillPts(N,fn){const a=new Float32Array(N*3);for(let i=0;i<N;i++){const p=fn(i);a[i*3]=p[0];a[i*3+1]=p[1];a[i*3+2]=p[2];}return a}
function seg(edges,x1,y1,z1,x2,y2,z2){edges.push(x1,y1,z1,x2,y2,z2)}
function randDir(r){const u=r()*2-1,ph=r()*6.2832,s=Math.sqrt(1-u*u);return [s*Math.cos(ph),u,s*Math.sin(ph)]}

/* ---- 00 · singleton — the first particle ---- */
function shapeSingleton(N){
 return {pos:fillPts(N,()=>[(Math.random()-.5)*.05,(Math.random()-.5)*.05,(Math.random()-.5)*.05]),edges:null,center:[0,0,0]};
}

/* ---- 01 · neural network — corridor z +3..-35 ---- */
function shapeNeural(N){
 const r=mulberry(101),nodes=[];
 for(let i=0;i<86;i++)nodes.push([(r()-.5)*19,2+(r()-.5)*10,-16+(r()-.5)*40]);
 const pairs=[],has={};
 nodes.forEach((a,i)=>{
   const d=nodes.map((b,j)=>({j,d:(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2})).sort((x,y)=>x.d-y.d);
   for(let k=1;k<3;k++){const j=d[k].j,key=i<j?i+'_'+j:j+'_'+i;if(!has[key]&&r()<.85){has[key]=1;pairs.push([i,j])}}
 });
 const edges=[];pairs.forEach(p=>seg(edges,...nodes[p[0]],...nodes[p[1]]));
 const pos=fillPts(N,i=>{
   const t=r();
   if(t<.45){const e=pairs[(r()*pairs.length)|0],k=r(),j=.35;
     return [lerp(nodes[e[0]][0],nodes[e[1]][0],k)+(r()-.5)*j,lerp(nodes[e[0]][1],nodes[e[1]][1],k)+(r()-.5)*j,lerp(nodes[e[0]][2],nodes[e[1]][2],k)+(r()-.5)*j];}
   if(t<.70){const n=nodes[(r()*nodes.length)|0];
     return [n[0]+(r()-.5)*.9,n[1]+(r()-.5)*.9,n[2]+(r()-.5)*.9];}
   return [(r()-.5)*17,2+(r()-.5)*9,-16+(r()-.5)*38];
 });
 return {pos,edges:new Float32Array(edges),center:[0,2,-16]};
}

/* ---- 02 · the world — street / architecture / floating lights ---- */
function shapeWorld(N){
 const r=mulberry(202),bld=[];
 for(let z=-92;z<24;z+=8.5+r()*3){for(const side of[-1,1]){
   if(r()<.18)continue;
   bld.push({x:side*(11.5+r()*17),z:z+(r()-.5)*3,w:3.5+r()*5.5,h:5+r()*15});
 }}
 const orbs=[];for(let i=0;i<52;i++)orbs.push([(r()-.5)*34,2.5+r()*9,-90+r()*112]);
 const ground=r2=>{let x=(r2()-.5)*72;if(r2()<.55)x*=.42;return [x,-3.5+(r2()-.5)*.25,-95+r2()*120]};
 const bpt=r2=>{const b=bld[(r2()*bld.length)|0];const f=r2();
   if(f<.62)return [b.x+(r2()-.5)*b.w,-3.5+r2()*b.h,b.z+(r2()>.5?1:-1)*(.12+r2()*.1)]; /* front/back */
   if(f<.81)return [b.x+(r2()>.5?1:-1)*(.12+r2()*.1),-3.5+r2()*b.h,b.z+(r2()-.5)*1.2]; /* side */
   return [b.x+(r2()-.5)*b.w,-3.5+b.h*(0.92+r2()*.1),b.z+(r2()-.5)*1.2]}; /* roof */
 const pos=fillPts(N,()=>{
   const t=r();
   if(t<.34)return ground(r);
   if(t<.70)return bpt(r);
   if(t<.80){const o=orbs[(r()*orbs.length)|0];return [o[0]+(r()-.5)*.7,o[1]+(r()-.5)*.7,o[2]+(r()-.5)*.7]}
   if(t<.85){const s=r()<.5?-1:1;/* arch pillars */
     return [s*(8+(r()-.5)*.9),-3.5+r()*9.5,-40+(r()-.5)*.8];}
   /* fog bank */
   const d=randDir(r);const rr=6+r()*8;
   return [d[0]*rr*(2.6+r()),Math.max(-2.4,1.8+d[1]*rr*.35),-52+d[2]*rr*3.4];
 });
 const edges=[];
 for(let x=-30;x<=30;x+=10)seg(edges,x,-3.5,24,x,-3.5,-95);
 for(let z=-90;z<=20;z+=14){seg(edges,-34,-3.5,z,34,-3.5,z);}
 bld.forEach((b,i)=>{if(i%2)return;seg(edges,b.x-b.w/2,-3.5+b.h,b.z,b.x-b.w/2,-3.5,b.z);seg(edges,b.x+b.w/2,-3.5,b.z,b.x+b.w/2,-3.5+b.h,b.z)});
 seg(edges,-8,-3.5,-40,-8,6,-40);seg(edges,8,-3.5,-40,8,6,-40);
 for(let i=0;i<8;i++){const t=i/7;seg(edges,lerp(-8,8,t),6+Math.sin(t*Math.PI)*2.4,-40,lerp(-8,8,(i+1)/7),6+Math.sin((i+1)/7*Math.PI)*2.4,-40);}
 return {pos,edges:new Float32Array(edges),center:[0,0,-35]};
}

/* ---- garrick generator — local space, feet at y=0, faces +z ---- */
function garrickCloud(count,seed){
 const r=mulberry(seed);
 const pick=(()=>{const defs=[
   [ .30,()=>{const u=r(),v=r(),th=u*6.2832,ph=Math.acos(2*v-1);
      let x=Math.sin(ph)*Math.cos(th)*.235,y=Math.cos(ph)*.235,z=Math.sin(ph)*Math.sin(th)*.235;
      if(z<0)z*=.5; return [x,2.62+y,z+.03+(z>0?.03:0)];}],
   [ .26,()=>{const a=r()*6.2832,y=1.02+r()*1.28,rad=lerp(.32,.46,(y-1.02)/1.28);
      return [Math.cos(a)*rad*(.92+.16*r()),y,Math.sin(a)*rad*.72+.05+(Math.sin(a)>0?.05:0)];}],
   [ .07,()=>{const s=r()<.5?-1:1,u=r(),v=r(),th=u*6.2832,ph=Math.acos(2*v-1);
      return [s*.55+Math.sin(ph)*Math.cos(th)*.27,2.16+Math.cos(ph)*.24,Math.sin(ph)*Math.sin(th)*.24];}],
   [ .12,()=>{const s=r()<.5?-1:1,t=r();
      const A=[s*.63,2.03,.06],B=[s*.72,1.5,.16],C=[s*.5,1.02,.3];
      const P=t<.5?lerp3(A,B,t*2):lerp3(B,C,(t-.5)*2);
      return [P[0]+(r()-.5)*.16,P[1]+(r()-.5)*.16,P[2]+(r()-.5)*.16];}],
   [ .04,()=>{const s=r()<.5?-1:1;return [s*.47+(r()-.5)*.14,.98+(r()-.5)*.14,.34+(r()-.5)*.14];}],
   [ .15,()=>{const s=r()<.5?-1:1,t=r();
      return [s*lerp(.2,.25,t)+(r()-.5)*.22,lerp(1.0,.12,t),.04+(r()-.5)*.22];}],
   [ .06,()=>{const a=r()*6.2832,y=r();return [Math.cos(a)*lerp(.5,.3,y),lerp(1.0,2.2,y),Math.sin(a)*lerp(.28,.1,y)+.12];}]
  ];let tot=0;defs.forEach(d=>tot+=d[0]);let acc2=0;const cum=defs.map(d=>acc2+=d[0]/tot);
  return function(){const t=r();for(let i=0;i<cum.length;i++)if(t<=cum[i])return defs[i][1]();return defs[defs.length-1][1]()};})();
 function lerp3(A,B,t){return [lerp(A[0],B[0],t),lerp(A[1],B[1],t),lerp(A[2],B[2],t)]}
 return fillPts(count,()=>{
   let p=pick();
   /* lean forward above the waist, cloth noise */
   if(p[1]>1.35)p[2]-=(p[1]-1.35)*.15;
   p[0]+=(r()-.5)*.045;p[1]+=(r()-.5)*.045;p[2]+=(r()-.5)*.045;
   return p;
 });
}
function shapeGarrick(N){
 const local=garrickCloud(N,7);
 for(let i=0;i<N;i++){local[i*3]-=0;local[i*3+1]-=0;local[i*3+2]-=70;}
 return {pos:local,edges:null,center:[0,1.6,-70]};
}

/* ---- 05 · memory graph (world-absolute around MEMC) ---- */
function shapeMemory(N){
 const r=mulberry(505),C=MEMC;
 const mains=MEM_NODES.slice(1).map(n=>n[1]);
 const minors=[];for(let i=0;i<26;i++){const d=randDir(r);const rr=8+r()*3.5;
   minors.push([C[0]+d[0]*rr,C[1]+d[1]*rr*.7,C[2]+d[2]*rr]);}
 const pairs=[];
 mains.forEach((m,i)=>{pairs.push([C,m]);if(i<mains.length-1&&r()<.7)pairs.push([m,mains[i+1]]);});
 pairs.push([mains[1],mains[2]]);pairs.push([mains[5],mains[6]]);
 minors.forEach((m,i)=>{pairs.push([mains[i%mains.length],m]);if(i%3===0)pairs.push([C,m]);});
 const edges=[];pairs.forEach(p=>seg(edges,...p[0],...p[1]));
 const lerp3=(A,B,t)=>[lerp(A[0],B[0],t),lerp(A[1],B[1],t),lerp(A[2],B[2],t)];
 const pos=fillPts(N,()=>{
   const t=r();
   if(t<.42){const e=pairs[(r()*pairs.length)|0];const P=lerp3(e[0],e[1],r());
     return [P[0]+(r()-.5)*.4,P[1]+(r()-.5)*.4,P[2]+(r()-.5)*.4];}
   if(t<.66){const n=r()<.3?C:mains[(r()*mains.length)|0];
     return [n[0]+(r()-.5)*.85,n[1]+(r()-.5)*.85,n[2]+(r()-.5)*.85];}
   const d=randDir(r),rr=Math.pow(r(),.6)*13.5;
   return [C[0]+d[0]*rr,C[1]+d[1]*rr*.8,C[2]+d[2]*rr];
 });
 return {pos,edges:new Float32Array(edges),center:C};
}

/* ---- 08 · processing chamber z -52..-142 ---- */
function shapeChamber(N){
 const r=mulberry(808),edges=[];
 const gates=[];for(let k=0;k<13;k++){const z=-52-k*7.5,verts=[];for(let v=0;v<6;v++){const a=v/6*6.2832+(k%2)*.52;verts.push([Math.cos(a)*5.3,2+Math.sin(a)*5.3,z]);}gates.push(verts);}
 gates.forEach(g=>{for(let v=0;v<6;v++)seg(edges,...g[v],...g[(v+1)%6]);});
 for(let k=0;k<12;k++)for(let v=0;v<6;v+=1)if((k+v)%2===0)seg(edges,...gates[k][v],...gates[k+1][v]);
 const planes=[];for(let p=0;p<7;p++)planes.push({z:-56-p*12,tilt:(p%2?-1:1)*(.35+.15*p*.1)});
 const pos=fillPts(N,()=>{
   const t=r();
   if(t<.50){const g=gates[(r()*gates.length)|0],v=(r()*6)|0;
     const A=g[v],B=g[(v+1)%6],k=r();return [lerp(A[0],B[0],k)+(r()-.5)*.3,lerp(A[1],B[1],k)+(r()-.5)*.3,A[2]+(r()-.5)*.3];}
   if(t<.68){const k=(r()*12)|0,v=(r()*6)|0,A=gates[k][v],B=gates[k+1][v],q=r();
     return [lerp(A[0],B[0],q)+(r()-.5)*.2,lerp(A[1],B[1],q)+(r()-.5)*.2,lerp(A[2],B[2],q)];}
   if(t<.86){const p=planes[(r()*planes.length)|0];const x=(r()-.5)*13,y=(r()-.5)*7;
     const cy=y*Math.cos(p.tilt)-x*Math.sin(p.tilt)*.2;
     return [x*1.1,2+cy,p.z+(r()-.5)*.5];}
   const d=randDir(r);return [d[0]*11,2+d[1]*7,-97+d[2]*46];
 });
 return {pos,edges:new Float32Array(edges),center:[0,2,-97]};
}

/* ---- 09/10 · x402 transaction tunnel z -128..-238 ---- */
function shapeTunnel(N){
 const r=mulberry(909),edges=[];
 const z0=-128,z1=-238,R=5.4,PITCH=16.5;
 const strand=(z,ph)=>[Math.cos(z*6.2832/PITCH+ph)*R+(r()-.5)*.35,2+Math.sin(z*6.2832/PITCH+ph)*R*.92+(r()-.5)*.35,z];
 for(let z=z0;z>z1;z-=12)for(let v=0;v<26;v++){const a=v/26*6.2832;seg(edges,Math.cos(a)*6.6,2+Math.sin(a)*6.4,z,Math.cos(a)*6.6,2+Math.sin(a)*6.4,z-.05);}
 for(let z=z0;z>z1;z-=2.6){const a0=z*6.2832/PITCH,a1=a0+Math.PI;
   for(let s=0;s<3;s++){const t0=a0+s/3*.5,t1=a0+(s+.9)/3*.5;
     seg(edges,Math.cos(t0)*R,2+Math.sin(t0)*R*.92,z,Math.cos(t1)*R,2+Math.sin(t1)*R*.92,z);}}
 const pos=fillPts(N,()=>{
   const t=r();
   if(t<.58){const ph=r()<.5?0:Math.PI;const z=z0-r()*(z0-z1);const p=strand(z,ph);return p;}
   if(t<.74){const z=Math.floor((z0-r()*(z0-z1))/2.6)*2.6;const a=(z*6.2832/PITCH)+r()*.55;
     return [Math.cos(a)*lerp(R*.35,R,r()),2+Math.sin(a)*lerp(R*.35,R,r())*.92,z+(r()-.5)*.3];}
   if(t<.90){const z=z0-r()*(z0-z1),a=r()*6.2832,rr=r()<.85?6.6:6.6+r()*2;
     return [Math.cos(a)*rr,2+Math.sin(a)*rr*.95,z];}
   const d=randDir(r);return [d[0]*9,2+d[1]*7,z0-(z0-z1)*r()];
 });
 return {pos,edges:new Float32Array(edges),center:[0,2,-183]};
}

/* ---- 12 · AI core — particle sphere at (0,2,-262) ---- */
function shapeCore(N){
 const r=mulberry(1212),C=[0,2,-262],edges=[];
 for(let k=0;k<3;k++)for(let i=0;i<48;i++){const a=i/48*6.2832,b=(i+1)/48*6.2832;
   const tilt=k*.9;
   const p1=[Math.cos(a)*7*Math.cos(tilt),Math.sin(a)*7*Math.cos(tilt)+0,Math.sin(a)*7*Math.sin(tilt)];
   const p2=[Math.cos(b)*7*Math.cos(tilt),Math.sin(b)*7*Math.cos(tilt),Math.sin(b)*7*Math.sin(tilt)];
   seg(edges,C[0]+p1[0],C[1]+p1[1],C[2]+p1[2],C[0]+p2[0],C[1]+p2[1],C[2]+p2[2]);}
 const pos=fillPts(N,i=>{
   const t=r();
   if(t<.55){const y=1-2*((i%9973)/9973);const rr=Math.sqrt(Math.max(0,1-y*y));const th=(i%6131)*.7+r()*.05;
     return [C[0]+Math.cos(th)*rr*7,C[1]+y*7,C[2]+Math.sin(th)*rr*7];}
   if(t<.73){const d=randDir(r),rr=Math.pow(r(),1.6)*5.6;
     return [C[0]+d[0]*rr+Math.sin(d[2]*9)*.5,C[1]+d[1]*rr+Math.cos(d[0]*9)*.5,C[2]+d[2]*rr];}
   if(t<.88){const a=r()*6.2832,y2=(r()-.5)*.7,rr=lerp(3.2,7,r());
     return [C[0]+Math.cos(a)*rr,C[1]+y2*rr,C[2]+Math.sin(a)*rr];}
   const d=randDir(r),rr=8+r()*4.5;return [C[0]+d[0]*rr,C[1]+d[1]*rr,C[2]+d[2]*rr];
 });
 return {pos,edges:new Float32Array(edges),center:C};
}

/* ---- 16 · code lattice z -344..-392 ---- */
function shapeCode(N){
 const r=mulberry(1616),edges=[],Z0=-344,Z1=-392;
 for(let rw=0;rw<34;rw+=3){const y=4+(rw-16.5)*.8,z=Z0-((Z1-Z0)*rw/33);
   seg(edges,-8.5,y,z,8.5,y,z);}
 seg(edges,-9.6,-3,((Z0+Z1)/2),-9.6,11,((Z0+Z1)/2));
 seg(edges,9.6,-3,((Z0+Z1)/2),9.6,11,((Z0+Z1)/2));
 const pos=fillPts(N,()=>{
   const t=r();
   if(t<.64){const rw=(r()*34)|0;const y=4+(rw-16.5)*.8+(r()-.5)*.16;
     const xs=(r()-.5)*17,len=.22+r()*1.15;const x=xs+r()*len;
     return [x,y+(x<0?-x:x)*.018,Z0-((Z1-Z0)*rw/33)+(rw%5)*.9+(r()-.5)*.5];}
   if(t<.72){const s=r()<.5?-9.6:9.6;return [s+(r()-.5)*.3,4+(r()-.5)*14,Z0-r()*(Z0-Z1)];}
   if(t<.80){return [(r()-.5)*1.7,4+(r()-.5)*1.7,-351+(r()-.5)*1.7];}
   const d=randDir(r);return [d[0]*21,4+d[1]*9,(Z0+Z1)/2+d[2]*25];
 });
 return {pos,edges:new Float32Array(edges),center:[0,4,-368]};
}

/* ---- 18 · NPC universe constellation ---- */
function shapeUniverse(N){
 const r=mulberry(1818),C=[0,4,-368];
 const hubs=HUBS.map(h=>h[1]);hubs.push(C);
 const minors=[];for(let i=0;i<40;i++){const d=randDir(r),rr=20+r()*15;
   minors.push([C[0]+d[0]*rr,C[1]+d[1]*rr*.7,C[2]+d[2]*rr]);}
 const pairs=[];
 hubs.forEach((h,i)=>{if(i<hubs.length-1)pairs.push([h,hubs[i+1]]);pairs.push([h,C]);});
 minors.forEach((m,i)=>{pairs.push([hubs[i%hubs.length],m]);if(i%2===0)pairs.push([minors[(i+7)%minors.length],m]);});
 const edges=[];pairs.forEach(p=>seg(edges,...p[0],...p[1]));
 const lerp3=(A,B,t)=>[lerp(A[0],B[0],t),lerp(A[1],B[1],t),lerp(A[2],B[2],t)];
 const pos=fillPts(N,()=>{
   const t=r();
   if(t<.30){const n=r()<.25?C:hubs[(r()*hubs.length)|0];
     return [n[0]+(r()-.5)*2.6,n[1]+(r()-.5)*2.6,n[2]+(r()-.5)*2.6];}
   if(t<.62){const e=pairs[(r()*pairs.length)|0];const P=lerp3(e[0],e[1],r());
     return [P[0]+(r()-.5)*.35,P[1]+(r()-.5)*.35,P[2]+(r()-.5)*.35];}
   if(t<.82){const m=minors[(r()*minors.length)|0];
     return [m[0]+(r()-.5)*1.2,m[1]+(r()-.5)*1.2,m[2]+(r()-.5)*1.2];}
   const d=randDir(r),rr=14+r()*30;return [C[0]+d[0]*rr,C[1]+d[1]*rr*.75,C[2]+d[2]*rr];
 });
 return {pos,edges:new Float32Array(edges),center:C};
}

/* ---- 19 · final silhouette ---- */
function shapeSilhouette(N){
 const local=garrickCloud(N,77);
 for(let i=0;i<N;i++){local[i*3]*=.62;local[i*3+1]=local[i*3+1]*.62;local[i*3+2]=local[i*3+2]*.62-368;}
 return {pos:local,edges:null,center:[0,1.2,-368]};
}
