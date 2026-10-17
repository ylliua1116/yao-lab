import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';

const main = new URL('../cloudflare-worker/worker.js', import.meta.url);
const tmp = mkdtempSync(join(tmpdir(),'yao-reading-test-'));
writeFileSync(join(tmp,'worker.mjs'),readFileSync(main));
const {default:worker} = await import('file://' + join(tmp,'worker.mjs'));
const base='https://yao-lab-ai.example.workers.dev';
let aiCalls=[];
let groqCalls=[];
let cfFail=false;
const mockEnv = {
  AI:{run:async (model,body)=>{aiCalls.push({model,body}); if(cfFail) throw Error('mocked cf unavailable');return {response:'模拟完成：这只是离线回归测试。'};}},
  RATE_LIMITER:{limit:async ()=>({success:true})},
  TURNSTILE_SECRET:'LOCAL_TEST_ONLY',
  TURNSTILE_EXPECTED_HOSTNAME:'ylliua1116.github.io',
  ALLOWED_ORIGIN:'https://ylliua1116.github.io',
  GROQ_API_KEY:'LOCAL_TEST_ONLY'
};
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,opts)=>{
  const target=String(url);
  if(target.includes('/turnstile/v0/siteverify'))return new Response(JSON.stringify({success:true,hostname:'ylliua1116.github.io',action:'divine'}),{status:200});
  if(target.includes('api.groq.com')){groqCalls.push(JSON.parse(opts.body));return new Response(JSON.stringify({choices:[{message:{content:'模拟 Groq 备用完成。'}}]}),{status:200});}
  throw Error('Unexpected network: '+target);
};
const input={locale:'zh',question:'与对方的争议有没有可能平稳解决？',context:'双方有合作争议，目前已整理证据',goal:'平稳解决问题',timeframe:'近期',primary:'临',changed:'颐',changing:[2,6],bits:'110000',changedBits:'100001',turnstileToken:'test'};
const req=(body, origin=mockEnv.ALLOWED_ORIGIN)=>new Request(base+'/api/divine',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
const health=await (await worker.fetch(new Request(base+'/health'),mockEnv)).json();
assert.equal(health.classicalCorpusReady,true);assert.equal(health.readingPromptVersion,2);
let r=await worker.fetch(req(input),mockEnv); assert.equal(r.status,200,await r.text());
const decoded=JSON.parse(aiCalls.at(-1).body.messages[1].content);
assert.equal(decoded.classicalReading.primary.guaci,'臨：元亨。利貞。至于八月有凶。');
assert.deepEqual(decoded.classicalReading.changingLines.map(v=>v.position),[2,6]);
assert.match(decoded.classicalReading.changingLines[0].original,/九二：咸臨，吉无不利/);
assert.match(decoded.classicalReading.changingLines[1].original,/上六：敦臨，吉无咎/);
assert.equal(decoded.classicalReading.transformed.guaci,'頤：貞吉。觀頤，自求口實。');
assert.ok(!aiCalls.at(-1).body.messages[0].content.includes('未提供经过核校的经文，不得引述具体古籍原句'));
// User-supplied forged classical lines must not enter the trusted server corpus.
r=await worker.fetch(req({...input,yao:['九二：我伪造的原文'],guaci:'我伪造的卦辞'}),mockEnv);
assert.equal(r.status,200);
assert.ok(!aiCalls.at(-1).body.messages[1].content.includes('我伪造'));
// English uses the same source statements and an English system prompt.
r=await worker.fetch(req({...input,locale:'en'}),mockEnv); assert.equal(r.status,200);
assert.match(aiCalls.at(-1).body.messages[0].content,/Respond in natural English/);
// Failover receives the same validated sourced prompt.
cfFail=true;
r=await worker.fetch(req(input),mockEnv);assert.equal(r.status,200);assert.equal((await r.json()).provider,'groq');
const groqDoc=JSON.parse(groqCalls.at(-1).messages[1].content);
assert.equal(groqDoc.classicalReading.changingLines[1].original,decoded.classicalReading.changingLines[1].original);
// Invalid graph transitions and disallowed origin denied.
r=await worker.fetch(req({...input,changedBits:'111111'}),mockEnv);assert.equal(r.status,400);
r=await worker.fetch(req(input,'https://evil.example'),mockEnv);assert.equal(r.status,403);
globalThis.fetch=originalFetch;
console.log('PASS 64-hex corpus, exact moving-line provenance, language, origin, graph validation, and simulated Groq fallback');
