/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* YAO LAB · self-contained WebGL 3D engine (no CDN or dependencies).
   64 vertices, 192 one-bit edges; graphical model is not a physical assertion. */
(() => {
'use strict';
const PI=Math.PI;
const M=(x,y,z)=>[x,y,z];
const basis=[[1.32,.07,-.24],[-.07,1.36,.15],[.08,-.20,1.25],[.73,.63,.4],[-.58,.72,-.56],[.63,-.68,.50]];
const clamp=(a,b,c)=>Math.max(b,Math.min(c,a));
const allBits=Array.from({length:64},(_,i)=>i.toString(2).padStart(6,'0'));
const sites=allBits.map(bits=>{
 let v=[0,0,0];for(let j=0;j<6;j++)for(let k=0;k<3;k++)v[k]+=(bits[j]==='1'?1:-1)*basis[j][k];
 return v.map(x=>x*.65);
});
const edges=[];for(let i=0;i<64;i++)for(let j=0;j<6;j++) {const other=i^(1<<(5-j));if(other>i)edges.push([i,other]);}
const combined=(x,y,z)=>{
 const cy=Math.cos(y),sy=Math.sin(y),cx=Math.cos(x),sx=Math.sin(x),cz=Math.cos(z),sz=Math.sin(z);
 return [cy*cz+sy*sx*sz,-cy*sz+sy*sx*cz,sy*cx, cx*sz,cx*cz,-sx,-sy*cz+cy*sx*sz,sy*sz+cy*sx*cz,cy*cx];
};
const mul=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
const gradientShader=`precision highp float; varying vec3 vNormal; varying vec3 vPos; uniform vec3 uColor;uniform float uOpacity;uniform float uMetal;
void main(){
 vec3 n=normalize(vNormal);vec3 eye=normalize(vec3(-vPos.x*.05,-vPos.y*.05,5.-vPos.z));
 vec3 l=normalize(vec3(-.50,.85,1.0));vec3 l2=normalize(vec3(.9,-.33,-.45));
 float diff=max(0.,dot(n,l))*.65+max(0.,dot(n,l2))*.25;
 float fres=pow(1.-max(0.,dot(eye,n)),2.6);
 float spec=pow(max(0.,dot(reflect(-l,n),eye)),30.);
 float spec2=pow(max(0.,dot(reflect(-l2,n),eye)),9.);
 vec3 col=uColor*(.26+diff*.66)+vec3(1.,.88,.66)*spec*.72+vec3(.65,.89,1.)*spec2*.19+uColor*fres*(.64+uMetal*.4);
 float alpha=uOpacity*(.64+fres*.35+spec*.12);
 gl_FragColor=vec4(col,alpha);
}`;
const vertexShader=`attribute vec3 position; attribute vec3 normal;uniform mat3 uRotation; uniform mat3 uLocalRotation;uniform vec3 uPivot; uniform float uScale;uniform float uAspect;varying vec3 vNormal;varying vec3 vPos;
void main(){vec3 p=uRotation*(uPivot+uLocalRotation*(position*uScale-uPivot));vPos=p;vNormal=normalize(uRotation*uLocalRotation*normal); float f=6.8/(7.2-p.z);gl_Position=vec4(p.x*f/uAspect/4.5,p.y*f/4.5,p.z*.025,1.);}`;
const pointVert=`attribute vec3 position;attribute float highlight;uniform mat3 uRotation;uniform float uAspect;uniform float uScale;uniform float uPointScale; varying float vHi;varying float vDepth;
void main(){vec3 p=uRotation*(position*uScale);float f=6.8/(7.2-p.z);gl_Position=vec4(p.x*f/uAspect/4.5,p.y*f/4.5,p.z*.025,1.);vHi=highlight;vDepth=f;gl_PointSize=(vHi>1.5?29.0:(vHi>.5?22.0:10.)) * f * uPointScale;}`;
const pointFrag=`precision mediump float;varying float vHi;varying float vDepth;void main(){vec2 p=gl_PointCoord-.5;float r=length(p)*2.;float glow=exp(-r*r*5.);float core=1.-smoothstep(.12,.24,r); vec3 col=vHi>1.5?vec3(1.0,.56,.29):(vHi>.5?vec3(.98,.88,.60):vec3(.45,.74,.82));float alpha=(glow*.33+core*.85)*(vHi>.5?1.0:.55);gl_FragColor=vec4(col*1.3,alpha);}`;
const lineVert=`attribute vec3 position;uniform mat3 uRotation;uniform mat3 uLocalRotation;uniform vec3 uPivot;uniform float uAspect;uniform float uScale;void main(){vec3 p=uRotation*(uPivot+uLocalRotation*(position*uScale-uPivot));float f=6.8/(7.2-p.z);gl_Position=vec4(p.x*f/uAspect/4.5,p.y*f/4.5,p.z*.025,1.);}`;
const lineFrag=`precision mediump float; uniform vec4 uColor;void main(){gl_FragColor=uColor;}`;
const makeSphere=(r,lat=40,lon=68)=>{const v=[],n=[],idx=[];for(let i=0;i<=lat;i++){let t=i/lat*PI;for(let j=0;j<=lon;j++){let p=j/lon*2*PI,x=Math.sin(t)*Math.cos(p),y=Math.cos(t),z=Math.sin(t)*Math.sin(p);v.push(x*r,y*r,z*r);n.push(x,y,z);}}for(let i=0;i<lat;i++)for(let j=0;j<lon;j++){let a=i*(lon+1)+j,b=a+lon+1;idx.push(a,b,a+1,b,b+1,a+1);}return {v:new Float32Array(v),n:new Float32Array(n),idx:new Uint16Array(idx)};};
const makeTorus=(R,r,segments=170,spokes=13,tilt=0)=>{const v=[],n=[],idx=[];for(let i=0;i<=segments;i++){const p=i/segments*2*PI;for(let j=0;j<=spokes;j++){const t=j/spokes*2*PI, nx=Math.cos(p)*Math.cos(t),ny=Math.sin(t),nz=Math.sin(p)*Math.cos(t);let x=(R+r*Math.cos(t))*Math.cos(p),y=r*Math.sin(t),z=(R+r*Math.cos(t))*Math.sin(p);const ct=Math.cos(tilt),st=Math.sin(tilt);v.push(x,y*ct-z*st,y*st+z*ct);n.push(nx,ny*ct-nz*st,ny*st+nz*ct);}}for(let i=0;i<segments;i++)for(let j=0;j<spokes;j++){let a=i*(spokes+1)+j,b=a+spokes+1;idx.push(a,b,a+1,b,b+1,a+1)}return {v:new Float32Array(v),n:new Float32Array(n),idx:new Uint16Array(idx)}};

/* Distinct mathematical views: wire globe and translucent faceted crystalline lattice.
   All are presentation metaphors for the exactly defined Q6 state graph. */
function makeBox(side, center=[0,0,0]){
 const h=side/2,v=[],n=[],idx=[];
 const faces=[[[1,0,0],[[h,-h,-h],[h,h,-h],[h,h,h],[h,-h,h]]],
 [[-1,0,0],[[-h,-h,h],[-h,h,h],[-h,h,-h],[-h,-h,-h]]],
 [[0,1,0],[[-h,h,-h],[-h,h,h],[h,h,h],[h,h,-h]]],
 [[0,-1,0],[[-h,-h,h],[-h,-h,-h],[h,-h,-h],[h,-h,h]]],
 [[0,0,1],[[-h,-h,h],[h,-h,h],[h,h,h],[-h,h,h]]],
 [[0,0,-1],[[h,-h,-h],[-h,-h,-h],[-h,h,-h],[h,h,-h]]]];
 for(const [normal,pts] of faces){const at=v.length/3;for(const pt of pts){v.push(pt[0]+center[0],pt[1]+center[1],pt[2]+center[2]);n.push(...normal)}idx.push(at,at+1,at+2,at,at+2,at+3)}
 return {v:new Float32Array(v),n:new Float32Array(n),idx:new Uint16Array(idx)};
}
function offsetMesh(data,offset){const v=new Float32Array(data.v);for(let j=0;j<v.length;j+=3){v[j]+=offset[0];v[j+1]+=offset[1];v[j+2]+=offset[2]};return {...data,v};}
function makeFieldLines(){
 const fields={globe:[],cube:[],dual:[],hyper:[]};
 const seg=(arr,a,b)=>arr.push(...a,...b);
 // Exact 3-D spherical meridians and parallels, rather than a wireframe icon.
 for(let i=1;i<15;i++){
   const t=Math.PI*i/15;
   for(let j=0;j<128;j++){
     const a=j*2*Math.PI/128,b=(j+1)*2*Math.PI/128;
     seg(fields.globe,[1.86*Math.sin(t)*Math.cos(a),1.86*Math.cos(t),1.86*Math.sin(t)*Math.sin(a)],
       [1.86*Math.sin(t)*Math.cos(b),1.86*Math.cos(t),1.86*Math.sin(t)*Math.sin(b)]);
   }
 }
 for(let j=0;j<18;j++){
   const a=j*2*Math.PI/18;
   for(let i=0;i<90;i++){
     const t=i*Math.PI/90,u=(i+1)*Math.PI/90;
     seg(fields.globe,[1.86*Math.sin(t)*Math.cos(a),1.86*Math.cos(t),1.86*Math.sin(t)*Math.sin(a)],
     [1.86*Math.sin(u)*Math.cos(a),1.86*Math.cos(u),1.86*Math.sin(u)*Math.sin(a)]);
   }
 }
 // Independent cubic grid, six subdivided faces and through-plane cross-sections.
 const side=1.81,step=side*2/8;
 for(let face=0;face<3;face++)for(const sign of [-1,1])for(let j=0;j<=8;j++){
   const d=-side+j*step;
   for(let q=0;q<2;q++){
     let a=[0,0,0],b=[0,0,0];a[face]=b[face]=sign*side;
     let ax=(face+1)%3,bx=(face+2)%3;
     if(q===0){a[ax]=b[ax]=d;a[bx]=-side;b[bx]=side}
     else{a[bx]=b[bx]=d;a[ax]=-side;b[ax]=side}
     seg(fields.cube,a,b);
   }
 }
 for(let plane=1;plane<5;plane++){
  const z=-side+plane*side*2/5;
  for(let k=0;k<=8;k++){const x=-side+k*step;seg(fields.cube,[x,-side,z],[x,side,z]);seg(fields.cube,[-side,x,z],[side,x,z]);}
 }
 const fix=(src,ox,sc)=>{const out=[];for(let i=0;i<src.length;i+=3)out.push(src[i]*sc+ox,src[i+1]*sc,src[i+2]*sc);return out};
 fields.dualSphere=fix(fields.globe,-1.85,.67);fields.dualCube=fix(fields.cube,1.7,.63);
 fields.dual=[...fields.dualSphere,...fields.dualCube];
 return Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,new Float32Array(v)]));
}

function createProgram(gl,vs,fs){let compile=(type,src)=>{let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};let p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p}
function GLBuffer(gl,arr,kind=gl.ARRAY_BUFFER){const b=gl.createBuffer();gl.bindBuffer(kind,b);gl.bufferData(kind,arr,gl.STATIC_DRAW);return b;}
class OracleViz {
 constructor(canvas,{kind='atlas',onSelect=()=>{},getState=()=>({})}={}){
  this.canvas=canvas;this.kind=kind;this.onSelect=onSelect;this.getState=getState;
  this.mode=(kind==='math'?'hyper':kind==='hero'?'dual':kind==='atlas'?'dual':kind==='mini-globe'?'globe':'cube');this.yaw=kind==='hero'?.42:.20;this.pitch=kind==='hero'?-.28:.16;this.last=0;this.clock=0;this.running=true;this.dragging=false;this.paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.scale=kind==='hero'?.86:kind.startsWith('mini-')?.78:.85;this.points=new Float32Array(64*4);this.screen=[];
  try{this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});if(!this.gl)throw Error('No WebGL');this.initGL()}catch(e){this.gl=null;this.ctx=canvas.getContext('2d');canvas.dataset.fallback='true';}
  this.resize();if(this.gl)this.drawGL();else this.drawFallback();window.addEventListener('resize',()=>this.resize());
  if(kind==='atlas')this.bind();
  this.observer=new IntersectionObserver(entries=>this.visible=entries[0].isIntersecting,{rootMargin:'200px'});this.observer.observe(canvas);this.visible=true;
  requestAnimationFrame(t=>this.frame(t));
 }
 initGL(){const gl=this.gl;this.programs={mesh:createProgram(gl,vertexShader,gradientShader),line:createProgram(gl,lineVert,lineFrag),point:createProgram(gl,pointVert,pointFrag)};
  const sceneMesh=(data,color,alpha,group='all',metal=.8)=>({data,color,alpha,metal,scale:1,group});
  this.meshes=[
   sceneMesh(makeSphere(1.84,58,92),[.19,.45,.46],.19,'globe',.35),
   sceneMesh(makeSphere(1.84,50,88),[.27,.63,.54],.045,'globe',.14),
   sceneMesh(makeTorus(2.15,.085,180,12,1.11),[.94,.75,.44],.89,'globe',.9),
   sceneMesh(makeTorus(2.23,.048,165,11,-1.14),[.39,.79,.77],.88,'globe',.6),
   sceneMesh(makeBox(3.62),[.18,.44,.50],.16,'cube',.5),
   sceneMesh(makeBox(3.0),[.18,.45,.42],.08,'cube',.4),
   sceneMesh(offsetMesh(makeSphere(1.53,42,68),[-1.85,0,0]),[.30,.65,.58],.16,'dual',.4),
   sceneMesh(offsetMesh(makeSphere(1.56,42,68),[-1.85,0,0]),[.15,.55,.60],.04,'dual',.25),
   sceneMesh(offsetMesh(makeBox(2.3),[1.7,0,0]),[.33,.73,.69],.19,'dual',.45),
   sceneMesh(offsetMesh(makeBox(2.0),[1.7,0,0]),[.20,.48,.49],.11,'dual',.4),
   sceneMesh(offsetMesh(makeTorus(1.62,.066,160,10,1.1),[-1.85,0,0]),[.93,.72,.42],.95,'dual',.9),
   sceneMesh(offsetMesh(makeTorus(1.77,.042,160,10,-1.08),[-1.85,0,0]),[.45,.82,.84],.74,'dual',.65),
   sceneMesh(makeSphere(1.12,40,60),[.22,.48,.53],.13,'hyper',.45),
   sceneMesh(makeTorus(2.65,.060,180,10,1.04),[.81,.71,.45],.8,'hyper',.7)];
  for(const mesh of this.meshes){mesh.pos=GLBuffer(gl,mesh.data.v);mesh.norm=GLBuffer(gl,mesh.data.n);mesh.ind=GLBuffer(gl,mesh.data.idx,gl.ELEMENT_ARRAY_BUFFER)}
  this.fields=makeFieldLines();this.fieldBuf={};for(const key of Object.keys(this.fields)){this.fieldBuf[key]=GLBuffer(gl,this.fields[key])}
  this.edgesArr=new Float32Array(edges.length*6);edges.forEach(([a,b],i)=>this.edgesArr.set([...sites[a],...sites[b]],i*6));this.edgeBuf=GLBuffer(gl,this.edgesArr);
  const dust=[];let seed=7;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<280;i++){const a=rand()*PI*2,r=2.6+rand()*1.5;dust.push(Math.cos(a)*r,(rand()-.5)*4.4,Math.sin(a)*r)}this.dust=GLBuffer(gl,new Float32Array(dust));this.dustN=dust.length/3;
  this.pointBuf=gl.createBuffer();this.highlightBuf=gl.createBuffer();this.pathBuf=gl.createBuffer();gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.disable(gl.DEPTH_TEST);
 }
 setMode(mode){if(!['dual','globe','cube','hyper'].includes(mode))return;this.mode=mode;this.scale=mode==='dual'?.84:mode==='hyper'?.92:.95;}
 setSelection(bits,changed){this.selectedBits=bits;this.changedBits=changed;}
 resize(){let r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;const dpr=Math.min(1.5,window.devicePixelRatio||1),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}if(this.gl)this.gl.viewport(0,0,w,h);}
 bind(){let point=null,dragged=false;this.canvas.addEventListener('pointerdown',e=>{point=[e.clientX,e.clientY];dragged=false;this.dragging=true;this.canvas.setPointerCapture(e.pointerId)});
  this.canvas.addEventListener('pointermove',e=>{if(this.dragging&&point){let dx=e.clientX-point[0],dy=e.clientY-point[1];if(Math.abs(dx)+Math.abs(dy)>2){dragged=true;this.yaw+=dx*.0075;this.pitch=clamp(this.pitch+dy*.006,-1.22,1.22)}point=[e.clientX,e.clientY]}else{this.hover=this.hit(e);this.canvas.style.cursor=this.hover!==null?'pointer':'grab'}});
  this.canvas.addEventListener('pointerup',e=>{this.dragging=false;if(!dragged){const id=this.hit(e);if(id!==null)this.onSelect(allBits[id])}point=null});
  this.canvas.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();this.paused=!this.paused}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();this.yaw+=e.key==='ArrowLeft'?.24:-.24}});
 }
 hit(e){const rect=this.canvas.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;let d=999,id=null;for(let i=0;i<this.screen.length;i++){const p=this.screen[i],di=Math.hypot(x-p[0],y-p[1]);if(di<d){d=di;id=i}}return d<.036?id:null}
 project(){const m=combined(this.pitch,this.yaw,this.yaw*.09);const a=this.canvas.width/this.canvas.height;this.screen=sites.map(p=>{let v=mul(m,p.map(x=>x*this.scale)),f=6.8/(7.2-v[2]);return [(.5+v[0]*f/a/9),(.5-v[1]*f/9),v[2]]});return m}
 uni(gl,p,name,kind,value){const loc=gl.getUniformLocation(p,name);if(loc===null)return;if(kind==='m3')gl.uniformMatrix3fv(loc,false,value);else if(kind==='f')gl.uniform1f(loc,value);else if(kind==='v3')gl.uniform3fv(loc,value);else if(kind==='v4')gl.uniform4fv(loc,value)}
 attrib(gl,p,name,buf,size){const loc=gl.getAttribLocation(p,name);if(loc<0)return;gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0)}
 spin(index){const t=this.clock;
   if(this.mode==='dual'){
      if(index===6||index===7)return combined(t*.13,t*.21,t*.07);
      if(index===8||index===9)return combined(-t*.17,t*.12,t*.09);
      if(index===10)return combined(t*.44,-t*.27,t*.14);
      if(index===11)return combined(-t*.29,t*.37,-t*.08);
   }
   if(index===2||index===10)return combined(t*.44,t*.20,t*.15);
   if(index===3||index===11)return combined(-t*.24,t*.35,t*.11);
   if(index===4||index===5)return combined(t*.22,-t*.14,t*.10);
   return combined(t*.14,t*.20,t*.09);
 }
 pivot(index){if(this.mode==='dual')return index===6||index===7||index===10||index===11?[-1.85,0,0]:[1.7,0,0];return [0,0,0]}
 setLocal(gl,program,index,scale){
    const m=index===null?combined(0,0,0):this.spin(index);
    const p=index===null?[0,0,0]:this.pivot(index).map(v=>v*scale);
    this.uni(gl,program,'uLocalRotation','m3',new Float32Array(m));
    this.uni(gl,program,'uPivot','v3',p);
 }
 drawGL(){const gl=this.gl,m=this.project(),aspect=this.canvas.width/this.canvas.height,hi=this.getState(),b=hi.primary||this.selectedBits||'111000',t=hi.transformed||b;
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  for(const [mi,mesh] of this.meshes.entries()){if(mesh.group!==this.mode)continue;const p=this.programs.mesh;gl.useProgram(p);this.attrib(gl,p,'position',mesh.pos,3);this.attrib(gl,p,'normal',mesh.norm,3);this.uni(gl,p,'uRotation','m3',new Float32Array(m));this.uni(gl,p,'uScale','f',this.scale*mesh.scale);this.setLocal(gl,p,mi,this.scale*mesh.scale);this.uni(gl,p,'uAspect','f',aspect);this.uni(gl,p,'uColor','v3',mesh.color);this.uni(gl,p,'uOpacity','f',mesh.alpha);this.uni(gl,p,'uMetal','f',mesh.metal);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,mesh.ind);gl.drawElements(gl.TRIANGLES,mesh.data.idx.length,gl.UNSIGNED_SHORT,0)}
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE);const lp=this.programs.line;gl.useProgram(lp);this.attrib(gl,lp,'position',this.edgeBuf,3);this.uni(gl,lp,'uRotation','m3',new Float32Array(m));this.uni(gl,lp,'uScale','f',this.scale);this.uni(gl,lp,'uAspect','f',aspect);this.setLocal(gl,lp,null,this.scale);this.uni(gl,lp,'uColor','v4',[.30,.73,.78,this.mode==='hyper'?.25:this.mode==='dual'?.055:.045]);if(this.mode==='hyper'||this.mode==='dual')gl.drawArrays(gl.LINES,0,edges.length*2);
  if(this.mode!=='hyper'){
    this.uni(gl,lp,'uColor','v4',this.mode==='cube'?[.49,.95,.83,.48]:[.50,.87,.89,.46]);
    if(this.mode==='dual'){
      for(const [name,index] of [['dualSphere',6],['dualCube',8]]){
        this.attrib(gl,lp,'position',this.fieldBuf[name],3);
        this.setLocal(gl,lp,index,this.scale);
        gl.drawArrays(gl.LINES,0,this.fields[name].length/3);
      }
    }else{
      this.attrib(gl,lp,'position',this.fieldBuf[this.mode],3);
      this.setLocal(gl,lp,this.mode==='cube'?4:0,this.scale);
      gl.drawArrays(gl.LINES,0,this.fields[this.mode].length/3);
    }
    this.setLocal(gl,lp,null,this.scale);
  }
  if(b!==t){const ai=allBits.indexOf(b),bi=allBits.indexOf(t);if(ai>=0&&bi>=0){const s=[...sites[ai],...sites[bi]];gl.bindBuffer(gl.ARRAY_BUFFER,this.pathBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(s),gl.DYNAMIC_DRAW);this.attrib(gl,lp,'position',this.pathBuf,3);this.uni(gl,lp,'uColor','v4',[1.,.55,.3,.93]);gl.drawArrays(gl.LINES,0,2)}}
  const pp=this.programs.point;gl.useProgram(pp);let pts=new Float32Array(sites.flat());gl.bindBuffer(gl.ARRAY_BUFFER,this.pointBuf);gl.bufferData(gl.ARRAY_BUFFER,pts,gl.DYNAMIC_DRAW);const hb=new Float32Array(allBits.map(bits=>bits===b?2:bits===t?1:0));gl.bindBuffer(gl.ARRAY_BUFFER,this.highlightBuf);gl.bufferData(gl.ARRAY_BUFFER,hb,gl.DYNAMIC_DRAW);
  this.attrib(gl,pp,'position',this.pointBuf,3);this.attrib(gl,pp,'highlight',this.highlightBuf,1);this.uni(gl,pp,'uRotation','m3',new Float32Array(m));this.uni(gl,pp,'uScale','f',this.scale);this.uni(gl,pp,'uAspect','f',aspect);this.uni(gl,pp,'uPointScale','f',Math.min(1.4,this.canvas.width/700));if(this.mode==='hyper'||this.mode==='dual')gl.drawArrays(gl.POINTS,0,64);
  // 36 independent luminous tracers circulate along verified one-bit links.
  const tracePositions=[],traceHighlights=[],time=this.clock*.005;
  for(let i=0;i<36;i++){
    const [a,b]=edges[(i*13+7)%edges.length],u=(time*(.65+i%7*.13)+i*.131)%1;
    const p=sites[a].map((v,j)=>v*(1-u)+sites[b][j]*u);
    const phase=this.clock*.13+i*.9;
    let next=p;
    if(this.mode==='globe'){const a=phase,t=1.08+(i%12)*.11;next=[1.91*Math.sin(t)*Math.cos(a),1.91*Math.cos(t),1.91*Math.sin(t)*Math.sin(a)]}
    if(this.mode==='cube'){const aa=phase*.65,axis=i%3;next=[Math.cos(aa)*1.83,Math.sin(aa)*1.83,1.83*Math.sin(aa*.71)];next[axis]=(i%2?1:-1)*1.83}
    if(this.mode==='dual'){if(i%2){const a=phase;next=[-1.85+1.58*Math.cos(a),.22*Math.sin(a*.7),1.58*Math.sin(a)]}else{next=[1.7+1.18*Math.sin(phase),1.16*Math.cos(phase),1.16*Math.sin(phase*.81)]}}
    tracePositions.push(...next);traceHighlights.push(i%5===0?1:0);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER,this.pointBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(tracePositions),gl.DYNAMIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,this.highlightBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(traceHighlights),gl.DYNAMIC_DRAW);
  this.attrib(gl,pp,'position',this.pointBuf,3);this.attrib(gl,pp,'highlight',this.highlightBuf,1);this.uni(gl,pp,'uPointScale','f',Math.min(1,this.canvas.width/900));gl.drawArrays(gl.POINTS,0,36);
 }
 drawFallback(){
  const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height,m=this.project(),scale=Math.min(w,h)/9.6;
  ctx.clearRect(0,0,w,h);const xy=p=>{const r=mul(m,p.map(x=>x*this.scale)),f=6.8/(7.2-r[2]);return [w/2+r[0]*scale*f,h/2-r[1]*scale*f,r[2]]};
  const shine=ctx.createRadialGradient(w/2,h/2,4,w/2,h/2,h*.49);shine.addColorStop(0,'#59ada522');shine.addColorStop(1,'#00151c00');ctx.fillStyle=shine;ctx.fillRect(0,0,w,h);
  if(this.mode!=='hyper'){
    // A translucent optical body under the true geometric lattice adds a physical depth cue.
    const globeOffset=this.mode==='dual'?[-1.85,0,0]:[0,0,0];
    if(this.mode==='dual'||this.mode==='globe'){
      const c=xy(globeOffset),edge=xy([globeOffset[0]+(this.mode==='dual'?1.0:1.6),0,0]);
      const r=Math.hypot(edge[0]-c[0],edge[1]-c[1]);
      const halo=ctx.createRadialGradient(c[0]-r*.4,c[1]-r*.45,r*.05,c[0],c[1],r*1.18);
      halo.addColorStop(0,'rgba(186,255,235,.24)');halo.addColorStop(.45,'rgba(44,119,119,.10)');halo.addColorStop(.84,'rgba(48,117,117,.14)');halo.addColorStop(1,'rgba(137,235,219,.01)');
      ctx.fillStyle=halo;ctx.beginPath();ctx.ellipse(c[0],c[1],r,r,0,0,2*Math.PI);ctx.fill();
      ctx.strokeStyle=this.kind==='hero'?'rgba(47,141,138,.5)':'rgba(175,243,219,.38)';ctx.lineWidth=1.6;ctx.shadowColor='rgba(128,220,207,.55)';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0;
      ctx.beginPath();ctx.ellipse(c[0]-r*.18,c[1]-r*.3,r*.42,r*.2,-.25,Math.PI*1.04,Math.PI*1.83);ctx.strokeStyle='rgba(246,218,160,.24)';ctx.stroke();
      // Two self-spinning inclined hoops: not tied to the globe or overall stage orientation.
      const center=globeOffset,ringRadius=this.mode==='dual'?1.60:2.16;
      for(let ring=0;ring<2;ring++){
        const local=this.spin(ring===0?(this.mode==='dual'?10:2):(this.mode==='dual'?11:3));
        const color=this.kind==='hero'?(ring===0?'rgba(166,105,34,.87)':'rgba(25,120,127,.81)'):(ring===0?'rgba(255,210,128,.82)':'rgba(125,236,228,.73)');
        ctx.beginPath();
        for(let j=0;j<=160;j++){
          const a=j*Math.PI*2/160;
          const raw=[Math.cos(a)*ringRadius,Math.sin(a)*ringRadius*.52,Math.sin(a)*ringRadius*.71];
          const q=mul(local,raw).map((v,k)=>v+center[k]),pp=xy(q);
          if(j===0)ctx.moveTo(pp[0],pp[1]);else ctx.lineTo(pp[0],pp[1]);
        }
        ctx.lineWidth=ring===0?2.7:2.2;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=11;ctx.stroke();ctx.shadowBlur=0;
      }
    }
    if(this.mode==='cube'||this.mode==='dual'){
       const size=this.mode==='dual'?1.14:1.82,base=this.mode==='dual'?1.7:0;
       const faces=[[[1,1,1],[1,1,-1],[-1,1,-1],[-1,1,1]],[[1,1,1],[1,-1,1],[-1,-1,1],[-1,1,1]],[[-1,1,1],[-1,1,-1],[-1,-1,-1],[-1,-1,1]],[[1,1,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1]]];
       for(let i=0;i<faces.length;i++){const v=faces[i].map(a=>xy([base+a[0]*size,a[1]*size,a[2]*size]));const g=ctx.createLinearGradient(v[0][0],v[0][1],v[2][0],v[2][1]);g.addColorStop(0,i%2===0?'rgba(170,233,211,.055)':'rgba(92,199,187,.028)');g.addColorStop(1,'rgba(91,215,193,.015)');ctx.beginPath();ctx.moveTo(v[0][0],v[0][1]);v.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(186,238,211,.16)';ctx.lineWidth=1;ctx.stroke();}
    }
    ctx.lineWidth=this.mode==='dual'?.9:1.1;ctx.strokeStyle=this.kind==='hero'?'rgba(45,134,133,.63)':'rgba(142,227,215,.58)';ctx.beginPath();
    const segments=this.mode==='dual'?[['dualSphere',6],['dualCube',8]]:[[this.mode,this.mode==='cube'?4:0]];
    for(const [key,idx] of segments){const field=this.fields?.[key]||makeFieldLines()[key];const local=this.spin(idx),pivot=this.pivot(idx);
      const rotated=p=>{const transformed=mul(local,p.map((a,j)=>a-pivot[j]));return transformed.map((a,j)=>a+pivot[j])};
      for(let i=0;i<field.length;i+=6){let a=xy(rotated([field[i],field[i+1],field[i+2]])),b=xy(rotated([field[i+3],field[i+4],field[i+5]]));ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])}
    }ctx.stroke();
  }
  const screen=sites.map(xy);this.screen=screen.map(v=>[v[0]/w,v[1]/h,v[2]]);
  if(this.mode==='hyper'||this.mode==='dual'){ctx.beginPath();ctx.strokeStyle='rgba(149,227,223,.19)';ctx.lineWidth=.9;for(const [a,b] of edges){ctx.moveTo(screen[a][0],screen[a][1]);ctx.lineTo(screen[b][0],screen[b][1])}ctx.stroke();for(let i=0;i<screen.length;i++){const v=screen[i];ctx.beginPath();ctx.arc(v[0],v[1],i%8===0?3.5:2,0,Math.PI*2);ctx.fillStyle=i%8===0?'#f5d2a2':'#a5e3da';ctx.fill()}}
  for(let i=0;i<48;i++){const a=this.clock*.25+i*.31,p=[Math.cos(a)*(2.1+i%5*.17),Math.sin(a*.7)*1.9,Math.sin(a)*1.7],v=xy(p);ctx.beginPath();ctx.arc(v[0],v[1],i%8===0?2.2:1,0,Math.PI*2);ctx.fillStyle=i%5?'#a5ddd8bb':'#ffe3b9dd';ctx.fill()}
 }
 frame(now){requestAnimationFrame(t=>this.frame(t));if(!this.visible)return;if(now-this.last<30)return;this.last=now;if(!this.paused){this.clock+=.033;if(!this.dragging)this.yaw+=.0081;}
  if(this.gl){this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.drawGL()}else this.drawFallback();}
}
window.YaoViz={OracleViz,allBits,sites,edges,dist:(a,b)=>[...a].filter((c,i)=>c!==b[i]).length};
})();
