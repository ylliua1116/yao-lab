/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* Continuous mathematical miniatures; no image CDN, no fonts or shader libs. */
(()=>{
'use strict';const TAU=2*Math.PI;
const ids=['binary-canvas','cube-canvas','prob-canvas'];
const states=ids.map((id,i)=>{const canvas=document.getElementById(id);if(!canvas)return null;const ctx=canvas.getContext('2d');return {canvas,ctx,kind:i,visible:true}}).filter(Boolean);
const ro=new ResizeObserver(()=>states.forEach(r=>{const bounds=r.canvas.getBoundingClientRect(),dpr=Math.min(1.6,devicePixelRatio||1);const w=Math.floor(bounds.width*dpr),h=Math.floor(bounds.height*dpr);if(w&&h&&(w!==r.canvas.width||h!==r.canvas.height)){r.canvas.width=w;r.canvas.height=h;}}));states.forEach(o=>ro.observe(o.canvas));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{let v=states.find(x=>x.canvas===e.target);if(v)v.visible=e.isIntersecting;}),{rootMargin:'120px'});states.forEach(o=>io.observe(o.canvas));
function spin(p,t){let a=t*.55,b=.36+Math.sin(t*.2)*.15,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);let [x,y,z]=p,X=x*ca-z*sa,Z=x*sa+z*ca;return [X,y*cb-Z*sb,y*sb+Z*cb]}
function buildProject(w,h,time){const s=Math.min(w,h)*.345;return p=>{const v=spin(p,time);let f=3.8/(3.8-v[2]*.27);return [w*.50+v[0]*s*f,h*.50-v[1]*s*f,v[2]]};}
function path(ctx,pts){if(pts.length<2)return;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();}
function halo(ctx,w,h){let g=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.49);g.addColorStop(0,'rgba(77,176,167,.23)');g.addColorStop(.6,'rgba(29,84,89,.12)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
function sphere(o,t){const {ctx,canvas}=o,w=canvas.width,h=canvas.height,P=buildProject(w,h,t);halo(ctx,w,h);let rad=Math.min(w,h)*.26;let g=ctx.createRadialGradient(w*.45,h*.34,rad*.12,w*.5,h*.5,rad*1.35);g.addColorStop(0,'rgba(189,246,227,.20)');g.addColorStop(.55,'rgba(64,136,134,.09)');g.addColorStop(1,'rgba(13,32,41,.07)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(w/2,h/2,rad,0,TAU);ctx.fill();
 ctx.save();ctx.lineWidth=Math.max(.6,w/500);ctx.shadowColor='#81e6d6';ctx.shadowBlur=4;
 for(let i=1;i<11;i++){let th=Math.PI*i/11;ctx.strokeStyle=i%3===0?'rgba(218,184,117,.65)':'rgba(133,226,218,.4)';let pts=[];for(let j=0;j<=90;j++){let a=TAU*j/90;pts.push(P([Math.sin(th)*Math.cos(a),Math.cos(th),Math.sin(th)*Math.sin(a)]))}path(ctx,pts)}
 for(let i=0;i<14;i++){let a=TAU*i/14,pts=[];for(let j=0;j<=80;j++){let th=Math.PI*j/80;pts.push(P([Math.sin(th)*Math.cos(a),Math.cos(th),Math.sin(th)*Math.sin(a)]))}ctx.strokeStyle=i%4===0?'rgba(228,192,128,.68)':'rgba(133,226,218,.38)';path(ctx,pts)}ctx.restore();
 for(let j=0;j<16;j++){let a=TAU*(j/16+t*.085),y=Math.sin(a*2)*.74,x=Math.cos(a)*Math.sqrt(1-y*y),z=Math.sin(a)*Math.sqrt(1-y*y),v=P([x,y,z]);ctx.fillStyle=j%4?'#7bd8c9':'#f7d39b';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=7;ctx.beginPath();ctx.arc(v[0],v[1],j%4?1.4:2.6,0,TAU);ctx.fill()}ctx.shadowBlur=0;
}
function cube(o,t){const {ctx,canvas}=o,w=canvas.width,h=canvas.height,P=buildProject(w,h,t);halo(ctx,w,h);const levels=7,v=[];for(let i=0;i<levels;i++)for(let j=0;j<levels;j++){let a=-1+2*i/(levels-1),b=-1+2*j/(levels-1);for(let axis=0;axis<3;axis++){let x=axis===0?1:a,y=axis===1?1:(axis===0?a:b),z=axis===2?1:b;const from=axis===0?[ -1,a,b]:axis===1?[a,-1,b]:[a,b,-1],to=axis===0?[1,a,b]:axis===1?[a,1,b]:[a,b,1];v.push([P(from),P(to),axis,i,j])}}
 ctx.lineWidth=Math.max(.8,w/600);ctx.shadowColor='#88e3d6';ctx.shadowBlur=4;v.sort((a,b)=>((a[0][2]+a[1][2])-(b[0][2]+b[1][2])));
 v.forEach(([a,b,axis,i,j])=>{const mid=(a[2]+b[2])/2;ctx.strokeStyle=axis===0?`rgba(218,190,133,${.18+(mid+1)*.19})`:`rgba(142,233,223,${.18+(mid+1)*.19})`;path(ctx,[a,b])});ctx.shadowBlur=0;
 const r=.9,a=t*.88;for(let i=0;i<10;i++){const h=(i/9)*2-1,v=P([r*Math.cos(a+i),h,r*Math.sin(a+i)]);ctx.shadowColor='#f7d397';ctx.shadowBlur=8;ctx.fillStyle='#f7d397';ctx.beginPath();ctx.arc(v[0],v[1],1.8,0,TAU);ctx.fill()}ctx.shadowBlur=0;
}
function prob(o,t){const {ctx,canvas}=o,w=canvas.width,h=canvas.height;halo(ctx,w,h);const probs=[.125,.375,.375,.125];let bottom=h*.85,top=h*.18,gap=w*.19,offset=w*.15,scale=h*.93;
 for(let i=0;i<4;i++){let x=offset+i*gap,height=probs[i]*scale*1.5;
 const g=ctx.createLinearGradient(0,bottom-height,0,bottom);g.addColorStop(0,i%3===0?'#e3bc83':'#a6f2d8');g.addColorStop(1,'#247f7a');ctx.fillStyle=g;ctx.globalAlpha=.72;ctx.fillRect(x,bottom-height,w*.115,height);ctx.globalAlpha=1;
 ctx.font=`${Math.max(9,w*.028)}px ui-monospace,monospace`;ctx.textAlign='center';ctx.fillStyle='#d7e8dd';ctx.fillText(['6 · 12.5%','7 · 37.5%','8 · 37.5%','9 · 12.5%'][i],x+w*.057,bottom+Math.max(12,w*.037));
 for(let k=0;k<9;k++){let phase=t*.3+k*.37+i*.91,y=bottom-height-8-Math.abs(Math.sin(phase))*h*.17,xx=x+w*.057+Math.sin(phase*1.5)*w*.033;ctx.beginPath();ctx.arc(xx,y,(k%3===0?2.3:1.0),0,TAU);ctx.fillStyle=k%3===0?'rgba(245,197,129,.95)':'rgba(151,225,213,.6)';ctx.fill()}
 }
 ctx.strokeStyle='rgba(160,224,212,.17)';ctx.beginPath();ctx.moveTo(w*.1,bottom+1);ctx.lineTo(w*.93,bottom+1);ctx.stroke();
}
let frameNo=0;function frame(ts){requestAnimationFrame(frame);if(frameNo++%2)return;const t=ts*.001;for(const o of states){if((!o.visible&&frameNo>4)||!o.canvas.width)continue;const ctx=o.ctx;ctx.clearRect(0,0,o.canvas.width,o.canvas.height);(o.kind===0?sphere:o.kind===1?cube:prob)(o,t)}}requestAnimationFrame(frame);
})();
