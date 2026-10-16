/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* YAO LAB — Six real Hamming-distance-one neighbors, projected and animated in 3D.
 * This is a mathematical projection of a Q6 neighborhood; not an actual 6D physical object.
 * The exploration is independent of the locked six-coin cast.
 */
(()=>{
 'use strict';
 const host=document.getElementById('hexexp-compass');
 const lab=window.YaoHexLab, core=window.YaoLabCore;
 if(!host||!lab||!core)return;
 const cnv=document.createElement('canvas');cnv.className='hexorbit-canvas';cnv.setAttribute('aria-hidden','true');
 const overlay=document.createElement('div');overlay.className='hexorbit-overlay';
 const brand=document.createElement('div');brand.className='hexorbit-brand';brand.textContent='Q₆  /  6 NEIGHBORS';
 const controls=document.createElement('button');controls.type='button';controls.className='hexorbit-pause';controls.setAttribute('aria-label','Pause 3D rotation');controls.textContent='Ⅱ';
 const hint=document.createElement('div');hint.className='hexorbit-hint';
 const nodes=Array.from({length:6},(_,i)=>{
  const b=document.createElement('button');b.className='hexorbit-node';b.type='button';b.dataset.bit=String(i);b.textContent=String(i+1).padStart(2,'0');
  b.setAttribute('aria-label',`Flip line ${i+1}`);overlay.append(b);return b;
 });
 const center=document.createElement('div');center.className='hexorbit-center';center.setAttribute('aria-hidden','true');center.textContent='✦';
 overlay.append(center);
 host.replaceChildren(cnv,overlay,brand,controls,hint);
 const ctx=cnv.getContext('2d',{alpha:true});
 let bits=lab.snapshot().experiment,az=.4,el=.27,clock=0,last=0,paused=false;
 let mouseDown=false,lastX=0,lastY=0,hover=-1,visible=true,points=[];
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 let respectReduced=reduced.matches;paused=respectReduced;
 if('IntersectionObserver' in window){new IntersectionObserver(e=>{visible=!!e[0]?.isIntersecting},{threshold:.03}).observe(host);}
 const basis=[
  [ .96,.24,.42],[-.62,.86,.22],[.22,.83,-.68],[-.90,-.31,-.47],
  [ .63,-.86,.31],[-.31,-.52,.98]
 ];
 const ease=(x)=>Math.max(0,Math.min(1,x));
 const flip=(s,i)=>s.slice(0,i)+(s[i]==='1'?'0':'1')+s.slice(i+1);
 const EN=()=>window.YaoI18n?.english?.()===true;
 const hname=(s)=>{const h=core.byBits.get(s);return h?(EN()?window.YaoEnReading.hex(h.num):'第'+h.num+'卦 · '+h.name):s};
 const update=(s)=>{
  bits=s;
  nodes.forEach((btn,i)=>{
   const next=flip(bits,i);btn.title=`${next} · ${hname(next)}`;
   btn.setAttribute('aria-label',EN()?`Flip line ${i+1} to ${hname(next)}`:`翻转第 ${i+1} 爻，变为${hname(next)}`);
  });
  hint.textContent=EN()?'Drag to orbit · Select a node to flip one line':'拖动旋转 · 点按节点翻转一爻';
 };
 nodes.forEach((b,i)=>{
  b.addEventListener('click',()=>lab.flip(i));
  b.addEventListener('pointerenter',()=>hover=i);
  b.addEventListener('pointerleave',()=>hover=-1);
 });
 controls.addEventListener('click',()=>{
  paused=!paused;controls.textContent=paused?'▶':'Ⅱ';
  controls.setAttribute('aria-label',paused?'Resume 3D rotation':'Pause 3D rotation');
 });
 cnv.addEventListener('pointerdown',e=>{mouseDown=true;lastX=e.clientX;lastY=e.clientY;cnv.setPointerCapture?.(e.pointerId);});
 cnv.addEventListener('pointermove',e=>{if(!mouseDown)return;az+=(e.clientX-lastX)*.007;el+=(e.clientY-lastY)*.005;el=Math.max(-1.2,Math.min(1.2,el));lastX=e.clientX;lastY=e.clientY;});
 cnv.addEventListener('pointerup',()=>mouseDown=false);
 cnv.addEventListener('pointercancel',()=>mouseDown=false);
 cnv.addEventListener('lostpointercapture',()=>mouseDown=false);
 const rotate=(p,a,b)=>{
  let [x,y,z]=p;let c=Math.cos(a),s=Math.sin(a);[x,z]=[x*c-z*s,x*s+z*c];c=Math.cos(b);s=Math.sin(b);[y,z]=[y*c-z*s,y*s+z*c];return [x,y,z];
 };
 const proj=(p,W,H,scale,phase)=>{
  const [x,y,z]=rotate(p,az+phase,el+phase*.28);
  const fo=3.3/(3.3-z*.55);return {x:W*.50+x*scale*fo,y:H*.47+y*scale*fo,z,fo};
 };
 function strokeCurve(points,color,width=1){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
 function glowDot(x,y,r,rgb,a=1){
  const g=ctx.createRadialGradient(x-r*.17,y-r*.22,0,x,y,r*2.4);
  g.addColorStop(0,`rgba(${rgb},${(.83*a).toFixed(3)})`);
  g.addColorStop(.38,`rgba(${rgb},${(.28*a).toFixed(3)})`);
  g.addColorStop(1,`rgba(${rgb},0)`);
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2.4,0,Math.PI*2);ctx.fill();
 }
 function renderFrame(ts){
  requestAnimationFrame(renderFrame);
  if(!visible||!ctx)return;
  const delta=Math.min(45,Math.max(0,ts-(last||ts)));last=ts;
  if(!paused&&!respectReduced)clock+=delta*.001;
  const W=host.clientWidth,H=host.clientHeight;
  if(W<40||H<60)return;
  const dpr=Math.min(devicePixelRatio||1,2);
  const pw=Math.round(W*dpr),ph=Math.round(H*dpr);
  if(cnv.width!==pw||cnv.height!==ph){cnv.width=pw;cnv.height=ph;}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  const scale=Math.min(W*.24,H*.31,132),phase=clock*.22;
  const project=(v)=>proj(v,W,H,scale,phase);
  const point0=project([0,0,0]);
  // A very faint 64-vertex Q6 background. Every edge changes exactly one bit.
  const pts=Array.from({length:64},(_,j)=>{
   let c=[0,0,0];for(let i=0;i<6;i++){
    const own=bits[i]==='1'?1:0,other=(j>>i)&1;if(own===other)continue;
    const dir=(own===1?-1:1);for(let a=0;a<3;a++)c[a]+=basis[i][a]*dir;
   }
   return project(c.map(v=>v*.45));
  });
  ctx.lineWidth=.65;
  for(let j=0;j<64;j++)for(let i=0;i<6;i++){
   const k=j^(1<<i);if(k<=j)continue;
   const p=pts[j],q=pts[k];ctx.strokeStyle='rgba(132,190,167,.055)';strokeCurve([p,q],ctx.strokeStyle,.55);
  }
  pts.forEach((p,j)=>{if(j===0)return;ctx.fillStyle='rgba(164,225,191,.18)';ctx.beginPath();ctx.arc(p.x,p.y,1.05,0,Math.PI*2);ctx.fill();});
  // Independent floating latitude rings: this is deliberately decorative, not a prediction model.
  for(let r=0;r<3;r++){
   const ring=[];for(let j=0;j<=128;j++){
    const a=(j/128)*Math.PI*2+clock*(r===0?.11:r===1?-.14:.06);
    const rad=1.02+(r===2?.13:0);
    let pt=r===0?[Math.cos(a)*rad,Math.sin(a)*rad,0]:r===1?[Math.cos(a)*rad,0,Math.sin(a)*rad]:[0,Math.cos(a)*rad,Math.sin(a)*rad];
    ring.push(project(pt));
   }
   strokeCurve(ring,r===0?'rgba(177,223,204,.16)':r===1?'rgba(225,192,139,.14)':'rgba(154,195,205,.12)',.9);
  }
  const neighbors=basis.map((v,i)=>{
    const sign=bits[i]==='1'?-1:1;
    return { ...project(v.map(n=>n*sign*1.4)), i };
  });
  // Keep interactive nodes legible when perspective puts two 3D neighbors on top
  // of each other. Only label positions are adjusted in screen space.
  for(let pass=0;pass<7;pass++){
   for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){
    const a=neighbors[i],b=neighbors[j];let dx=a.x-b.x,dy=a.y-b.y;
    let d=Math.hypot(dx,dy);if(d>=43)continue;
    if(d<.001){dx=Math.cos(i*2.39+j);dy=Math.sin(i*2.39+j);d=1;}
    const shift=(43-d)*.52;
    a.x+=(dx/d)*shift;a.y+=(dy/d)*shift;b.x-=(dx/d)*shift;b.y-=(dy/d)*shift;
   }
   for(const n of neighbors){
    let dx=n.x-point0.x,dy=n.y-point0.y,d=Math.hypot(dx,dy);
    if(d<42){if(d<.01){dx=1;dy=.25;d=Math.hypot(dx,dy);}n.x+=dx/d*(42-d);n.y+=dy/d*(42-d);}
    n.x=Math.min(W-26,Math.max(26,n.x));n.y=Math.min(H-40,Math.max(36,n.y));
   }
  }
  const ordered=[...neighbors].sort((a,b)=>a.z-b.z);
  ordered.forEach(p=>{
   const focus=hover===p.i;ctx.save();
   const g=ctx.createLinearGradient(point0.x,point0.y,p.x,p.y);g.addColorStop(0,'rgba(215,194,151,.42)');g.addColorStop(1,focus?'rgba(240,219,171,.95)':'rgba(154,216,185,.6)');
   strokeCurve([point0,p],g,focus?2.4:1.35);
   for(let j=0;j<2;j++){
    const t=((clock*(.37+j*.13)+p.i*.147+j*.45)%1);const xx=point0.x+(p.x-point0.x)*t,yy=point0.y+(p.y-point0.y)*t;
    glowDot(xx,yy,focus?5.4:4.1,j===0?'242,202,146':'165,231,199',.7);
   }
   ctx.restore();
  });
  // Highlighted nucleus + isolated little luminous particles.
  glowDot(point0.x,point0.y,17,'236,190,130',.65);
  ctx.strokeStyle='rgba(225,188,130,.42)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(point0.x,point0.y,18+Math.sin(clock*1.4)*1.7,0,Math.PI*2);ctx.stroke();
  neighbors.forEach(p=>{
   const focus=hover===p.i;
   glowDot(p.x,p.y,focus?16:12,focus?'240,198,139':'165,231,200',focus?1:.63);
   nodes[p.i].style.left=p.x+'px';nodes[p.i].style.top=p.y+'px';
   nodes[p.i].style.transform=`translate(-50%,-50%) scale(${Math.max(.82,Math.min(1.18,p.fo))})`;
   nodes[p.i].style.zIndex=String(Math.round(10+p.z*2));
  });
  center.style.left=point0.x+'px';center.style.top=point0.y+'px';
 }
 window.YaoOrbit={update, pause:()=>{paused=true;controls.textContent='▶';},snapshot:()=>({bits,paused})};
 update(bits);
 requestAnimationFrame(renderFrame);
 window.addEventListener('yao-language-change',()=>update(bits));
 if(reduced.addEventListener)reduced.addEventListener('change',e=>{respectReduced=e.matches;if(e.matches){paused=true;controls.textContent='▶';}});
})();
