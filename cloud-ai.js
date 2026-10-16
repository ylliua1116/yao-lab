/*
 * Copyright (c) 2026 Yuli Liu — YAO LAB / 爻间.
 * Original software: PolyForm Shield License 1.0.0; see LICENSE and NOTICE.
 * Classical text content and third-party materials have separate terms.
 */
/* YAO LAB — cloud-first, explicit click, session memo, Turnstile verification.
 * Public settings: worker URL + TURNSTILE_SITE_KEY (never the secret).
 * Do not place your server-side Turnstile secret or Groq key here.
 */
(() => {
'use strict';
const WORKER_URL = 'https://yao-lab-ai.ylliua1116.workers.dev';
const TURNSTILE_SITE_KEY = '0x4AAAAAAFYJqotK6ft1vC46';
const button=document.querySelector('#run-cloud-ai');
if(!button)return;
const out=document.querySelector('#insight-output'), status=document.querySelector('#ai-status');
const cache=new Map();
const CLOUD_CACHE_MS=5*60*1000; // local memory only; same payload within 5 minutes avoids repeated cloud calls
let approved=false,busy=false,widgetId=null,scriptPromise=null,turnstileWait=null;
const originalText=button.textContent;
const english=()=>window.YaoI18n?.english?.()===true;
const L=(zh,en)=>english()?en:zh;
function notify(s){if(status)status.textContent=s;}
function warning(s){const n=document.createElement('div');n.className='cloud-fallback-note';n.textContent=s;out.prepend(n);}
function show(text,provider){
 out.replaceChildren();
 const card=document.createElement('div');card.className='cloud-ai-result';
 const head=document.createElement('h3');head.textContent=L('针对性解卦 · ','AI Reading · ')+provider;
 const body=document.createElement('div');body.textContent=text;
 card.append(head,body);out.append(card);
 notify(L('AI 情境解读完成 · 解卦不构成未来预测','AI reading complete · For reflection, not prediction'));
}
async function fallback(s){
 if(window.YaoInsight?.isOnDeviceReady?.()){
   try {notify(L('云端暂不可用，正在使用已加载的本机 AI…','Cloud unavailable. Trying your on-device AI…'));if(await window.YaoInsight.generateAI()){warning(L('云端不可用：','Cloud unavailable: ')+s+L('。本次使用用户设备端语言模型解读。','. Using on-device AI.'));return;}}
   catch(err){console.warn('Local AI unavailable',String(err));}
 }
 window.YaoInsight?.localInsight?.();
 warning(L('云端深度解读不可用：','Cloud reading unavailable: ')+s+L('。下面是离线规则文化解读，并非真正的 AI 情境理解。您也可以手动启用本机 AI，或使用「复制到免费 AI」。','. Showing the offline cultural reading instead.'));
 notify(L('云端不可用 · 本地文化解释','Cloud unavailable · Offline reading shown'));
}
function loadTurnstile(){
 if(window.turnstile)return Promise.resolve(window.turnstile);
 if(scriptPromise)return scriptPromise;
 scriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
  script.onload=()=>window.turnstile?resolve(window.turnstile):reject(Error('Turnstile 无法初始化'));
  script.onerror=()=>reject(Error('无法加载 Turnstile 验证脚本'));
  document.head.append(script);
 }).catch(err=>{scriptPromise=null;throw err;});
 return scriptPromise;
}
async function humanToken(){
 if(TURNSTILE_SITE_KEY.includes('PASTE_'))throw Error('管理员尚未填写 Turnstile Site Key，云端 AI 暂时关闭');
 const t=await loadTurnstile();
 const container=document.querySelector('#turnstile-box');
 if(!container)throw Error('验证组件缺失');
 return await new Promise((resolve,reject)=>{
  let settled=false;
  const timer=setTimeout(()=>done(Error('验证超时，请重试')),150000);
  function done(err,token){if(settled)return;settled=true;clearTimeout(timer);turnstileWait=null;err?reject(err):resolve(token);}
  turnstileWait=done;
  const params={sitekey:TURNSTILE_SITE_KEY,action:'divine',appearance:'interaction-only',execution:'execute',theme:'light',
    callback:token=>done(null,token),
    'error-callback':()=>done(Error('Turnstile 验证失败')),
    'expired-callback':()=>done(Error('验证已过期，请重试')),
    'timeout-callback':()=>done(Error('人机验证超时'))
  };
  try {
   if(widgetId===null)widgetId=t.render(container,params);
   else t.reset(widgetId);
   t.execute(widgetId);
  } catch(e){done(e);}
 });
}
button.addEventListener('click',async()=>{
 if(busy)return;
 const cur=window.YaoLabCore?.getCurrent?.();
 const question=document.querySelector('#question')?.value.trim()||'';
 if(!cur||cur.preview||!question){notify(L('请先输入明确问题并完成起卦。','Please enter a question and cast six lines first.'));return;}
 const context=document.querySelector('#ai-context')?.value.trim()||'';
 const goal=document.querySelector('#ai-goal')?.value.trim()||'';
 const timeframe=document.querySelector('#ai-timeframe')?.value.trim()||'';
 const payload={locale:english()?'en':'zh',question,context,goal,timeframe,primary:cur.primary.name,changed:cur.transformed.name,changing:cur.moving,bits:cur.primary.bits,changedBits:cur.transformed.bits};
 const key=JSON.stringify(payload);
 const memo=cache.get(key);
 if(memo && Date.now()-memo.created<CLOUD_CACHE_MS){show(memo.answer,memo.provider+L(' · 5 分钟内复用',' · 5-min cache'));return;}
 if(memo)cache.delete(key);
 if(!approved){approved=window.confirm(L('你选择了云端 AI：会将本次问题、补充背景、目标、时间和卦象发给网站配置的云端服务。如果启用了第二家云端备用服务，主云端失败后也可能发送给备用服务。请勿提交敏感信息。是否同意？','This will send your question, context and hexagram to the cloud AI service (or its configured backup). Avoid sensitive information. Continue?'));
   if(!approved){notify(L('未授权上传；仍可使用离线模式。','Upload declined. Offline reading remains available.'));return;}}
 busy=true;button.disabled=true;button.textContent=L('验证并生成中…','Verifying & generating…');notify(L('等待人机验证（尚未调用 AI）…','Waiting for verification (AI not called yet)…'));
 try{
  const turnstileToken=await humanToken();
  notify(L('已完成验证，正在请求云端大模型…','Verified. Requesting cloud model…'));
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),60000);
  let response;
  try{response=await fetch(WORKER_URL.replace(/\/$/,'')+'/api/divine',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...payload,turnstileToken}),signal:controller.signal});}
  finally{clearTimeout(timer);}
  const data=await response.json().catch(()=>({}));
  if(!response.ok){const e=Error(data.error||`HTTP ${response.status}`);e.code=data.code||'';throw e;}
  if(typeof data.answer!=='string'||!data.answer.trim())throw Error('AI 未返回有效的解读文本');
  const provider=data.provider==='groq'?L('Groq 备用云端 AI','Groq Backup AI'):'Cloudflare Workers AI';
  cache.set(key,{answer:data.answer,provider,created:Date.now()});
  if(cache.size>80)cache.delete(cache.keys().next().value);
  show(data.answer,provider);
 }catch(err){
  const s=err?.name==='AbortError'?'调用超时':String(err?.message||err);
  if(String(err?.code||'').startsWith('BAD_')){notify(s);}
  else await fallback(s);
 }finally{busy=false;button.disabled=false;button.textContent=L('云端 AI 深度解读 ↗','Deep Reading with AI ↗');}
});
window.addEventListener('yao-language-change',()=>{if(!busy)button.textContent=english()?'Deep Reading with AI ↗':'云端 AI 深度解读 ↗';});
})();
