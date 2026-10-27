import test from 'node:test';import assert from 'node:assert/strict';
import {plain,classifyJob,validateAssessment,withRetries} from '../functions/engine.mjs';
const cfg={industries:['hvac'],locations:['Denver','CO'],keywords:['front desk','dispatch']},src={industry:'hvac'};
test('HTML is decoded without executing source content',()=>assert.equal(plain('&lt;p&gt;Calls &amp;amp; booking&lt;/p&gt;<script>bad()</script>'),'Calls & booking'));
test('operational hiring is selected; technicians and unrelated geography are excluded',()=>{
 assert.equal(classifyJob({title:'Front Desk Coordinator',location:{name:'Denver, CO'},content:''},src,cfg).relevant,true);
 assert.equal(classifyJob({title:'HVAC Technician',location:{name:'Denver, CO'},content:'helps front desk'},src,cfg).relevant,false);
 assert.equal(classifyJob({title:'Front Desk Coordinator',location:{name:'San Francisco, CA'},content:''},src,cfg).relevant,false);
});
const signals=[{id:'one',signal_type:'hiring_operational',source_excerpt:'Answers incoming calls and schedules appointments.',source_url:'https://example.org/job',posted_at:new Date().toISOString(),observed_at:new Date().toISOString()}];
const draft=()=>({fit:80,need:60,intent:80,confidence:.9,reasoning:'A supported operational hiring signal; buying intent is unknown.',next_action:'Verify with a person',evidence:[{signal_id:'one',quote:'Answers incoming calls'}],drafts:['intro_email','linkedin','followup_email','phone_points'].map(kind=>({kind,subject:'',body:'May I ask about your phone workflow?'}))});
test('hiring never becomes buying intent',()=>assert.equal(validateAssessment(draft(),signals).intent,0));
test('unknown publication dates reduce confidence',()=>assert.equal(validateAssessment(draft(),[{...signals[0],posted_at:null}]).confidence,.5));
test('invented quotes are rejected',()=>{const d=draft();d.evidence[0].quote='Losing $10,000 per month';assert.throws(()=>validateAssessment(d,signals),/unsupported/);});
test('invented future-date claims are rejected',()=>{const d=draft();d.reasoning='These dates are future-dated and need manual verification.';assert.throws(()=>validateAssessment(d,signals),/unsupported source-date/);});
test('missing evidence zeroes need and intent',()=>{const d=draft();d.evidence=[];const result=validateAssessment(d,signals);assert.equal(result.need,0);assert.equal(result.intent,0);});
test('source 429 retries with bounded backoff',async()=>{let n=0;const delays=[];const r=await withRetries(async()=>({status:++n<3?429:200}),{sleep:async ms=>delays.push(ms)});assert.equal(r.attempts,3);assert.deepEqual(delays,[1000,2000]);});
test('source 404 is not retried',async()=>{let n=0;const r=await withRetries(async()=>({status:404}),{sleep:async()=>n++});assert.equal(r.response.status,404);assert.equal(n,0);});
test('persistent source failures stop after three attempts',async()=>{let n=0;await assert.rejects(()=>withRetries(async()=>{n++;return {status:503};},{sleep:async()=>{}}));assert.equal(n,3);});
