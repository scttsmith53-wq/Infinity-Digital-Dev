// Commercial promises must come from this reviewed offer, never from a prospect website.
export const offerProfile=Object.freeze({
 id:'idd-ava-phone-demo-v1',reviewed_at:'2026-10-30T00:00:00Z',review_method:'Read-only inspection of the saved IDD Demo Receptionist prompt, actions, knowledge selection, post-call settings and deployment in the owner account. No call, SMS or delivery test was initiated.',
 service:'AI phone receptionists',
 approved_capabilities:[
  {id:'inbound_answering',claim:'Set up an AI receptionist to answer incoming business calls',evidence:'Agent assigned to three phone numbers; direct-answer routing; all-hours schedule.'},
  {id:'business_conversation',claim:'Use a business-appropriate greeting and ask relevant caller questions',evidence:'Saved prompt has industry-specific question guides and a business-name role-play.'},
  {id:'caller_questions',claim:'Ask for the caller name and reason for calling',evidence:'Saved role-play explicitly asks the caller name and relevant request details.'},
  {id:'demo_roleplay',claim:'Let an owner play a customer and hear a receptionist demo for their business',evidence:'Saved welcome message and role-play flow explicitly offer this demonstration.'}
 ],
 configured_but_not_campaign_promises:[
  'Native contact-note summaries and email summary notifications are enabled; delivery was not independently tested.',
  'A consent-based Send Demo Site SMS action is configured; sending and alternate-recipient behavior were not tested.'
 ],
 excluded_promises:['Real appointment booking or calendar availability','Live transfers or routing to staff','CRM integrations, structured field updates or synchronization','Automatic follow-up sequences or missed-call callbacks','Custom quote, fleet, inspection, property-management or back-office workflows','Accurate business FAQs without approved knowledge sources','Inventory lookup, insurance quotes or professional advice','Guaranteed revenue, savings, response time, uptime or call capture','A prospect-specific production system already built or connected'],
 campaign_objective:'Offer a short Ava receptionist demonstration; assess production configuration and integrations separately after interest. Personalize the caller scenario, not the product offer.'
});
export const capabilityIds=offerProfile.approved_capabilities.map(c=>c.id);
export function offerErrors(result){
 const errors=[],v=result.variables||{},offerCopy=[v.custom_solution,v.custom_problem_question,v.custom_cta,v.custom_followup_1,v.custom_followup_2].join(' ');
 if(result.service!==offerProfile.service||result.offer_profile_id!==offerProfile.id)errors.push('Offer must match the reviewed Ava phone-receptionist profile');
 if(!Array.isArray(result.capability_ids)||!result.capability_ids.length||result.capability_ids.some(id=>!capabilityIds.includes(id)))errors.push('Every promised capability must be in the reviewed offer allowlist');
 if(/\b(CRM|integrat\w*|sync\w*|workflow\w*|fleet (management|workflows?|records?)|inspection reports?|automated quotes?|inventory lookup|call transfer|transfer calls?|route (calls?|requests?)|follow.up (automation|sequences?)|missed.call (follow.up|callbacks?))\b/i.test(offerCopy))errors.push('Unsupported integration or custom automation offer');
 if(/\b(book|books|booking|schedule|schedules|confirm|confirms|reserve|reserves)\b.{0,45}\b(appointments?|calendar|visits?|slots?)\b|\bconnected calendar\b|\breal.time availability\b|\bsend.{0,30}\b(texts?|SMS|notifications?|summar\w*)\b|\b(record|save|update|populate)\b.{0,35}\b(CRM|fields?|contact records?)\b/i.test(offerCopy))errors.push('Configured or simulated action must not be promised as verified production delivery');
 if(!/\b(demo|demonstration)\b/i.test(v.custom_problem_question||'')||!/\b(Ava|AI (phone )?receptionist)\b/i.test(v.custom_solution||''))errors.push('Use one clear receptionist-demo offer and invitation');
 return errors;
}
