import assert from 'node:assert/strict';
import {parseCSV,csv,validate,fields,services,assemble,master} from './core.mjs';
import {safeUrl,publicIp,robotsPolicy} from './research-core.mjs';
const rows=[{email:'a@example.com',quote:'A, B "C"\nD'}];assert.deepEqual(parseCSV(csv(rows,['email','quote'])),rows);
for(const u of ['http://127.0.0.1/x','http://localhost/a','https://linkedin.com/company/a','https://user:secret@example.com'])assert.throws(()=>safeUrl(u));
for(const ip of ['127.0.0.1','169.254.169.254','10.0.0.1','192.168.1.1','::1'])assert.equal(publicIp(ip),false);
assert.equal(robotsPolicy('User-agent: *\nDisallow: /private','/private/page').allowed,false);
const page={url:'https://acme.example/services',text:'Acme Heating offers residential heat pump installation and air conditioning repair.'};
const variables=Object.fromEntries(fields.map(k=>[k,'A draft']));Object.assign(variables,{custom_subject:'Acme scheduling',custom_observation:'Acme Heating offers residential heat pump installation and air conditioning repair.',custom_problem_question:'How do you currently handle appointment requests when your technicians are out on a job?',custom_solution:'Infinity Digital Development can provide an AI phone receptionist to collect caller details and route appointment requests to your team.',custom_cta:'Happy to share a short example if useful.'});
const good={confidence:.9,service:services[0],observation:page.text,hypothesis:'Potential intake need',explanation:'Installation inquiries require intake',claims_supported:true,solution_fits:true,findings:[{source_url:page.url,excerpt:page.text,confidence:.9}],variables};
assert.equal(validate(good,[page],{name:'Acme Heating'}).status,'approved_for_review');
assert.equal((assemble(variables).match(/\?/g)||[]).length,1);
assert.equal(validate({...good,findings:[{...good.findings[0],excerpt:'A fabricated unsupported claim appears here.'}]},[page],{name:'Acme Heating'}).status,'needs_revision');
assert.equal(validate({...good,variables:{...variables,custom_cta:'Would this help?'}},[page],{name:'Acme Heating'}).status,'needs_revision');
assert.equal(validate({...good,variables:{...variables,custom_followup_1:'Following our conversation yesterday, you are missing calls.'}},[page],{name:'Acme Heating'}).status,'needs_revision');
assert.ok(master.includes('%unsubscribe-text%'));assert.ok(master.includes('2256 Park Centre Dr'));
console.log('PASS: CSV roundtrip, SSRF guards, robots, exact evidence, length, one question, fabricated followup and master footer');

assert.ok(csv([{x:'=HYPERLINK("bad")'}],['x']).includes("'=HYPERLINK"));

const timer=performance.now();assert.equal(robotsPolicy('User-agent: *\nAllow: *******************.js\nAllow: *******************.css\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php','/plumbing-services/sewer-drain-cleaning-services/').allowed,true);assert.ok(performance.now()-timer<100);assert.equal(robotsPolicy('User-agent: *\nDisallow: /*.pdf$','/a.pdf').allowed,false);assert.equal(robotsPolicy('User-agent: *\nDisallow: /*.pdf$','/a.pdf/page').allowed,true);

const {readFileSync}=await import('node:fs');const original=readFileSync(new URL('./backups/export-smartlead-5.ts',import.meta.url),'utf8').replaceAll('\r\n','\n');const extended=readFileSync(new URL('./export-smartlead.ts',import.meta.url),'utf8').replaceAll('\r\n','\n');const marker='  const { data: cfg }';assert.equal(extended.slice(extended.indexOf(marker)).trimEnd(),original.slice(original.indexOf(marker)).trimEnd());console.log('PASS: legacy exporter authentication, ranking and CSV tail preserved exactly');
