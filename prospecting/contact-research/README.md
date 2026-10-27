# Contact research agent

Live: https://demo.infinitydigitaldev.com/linkedin-intake.html → **Contact research**.

This adds a manually operated, finite contact-research workflow to the existing prospecting application. It reuses the owner Google sign-in, Supabase project, original lead table, prospect matching, AWS demo hosting and existing server-side OpenAI credential. It does not send messages, place calls, change the original lead records or modify unrelated production systems.

## Pilot outcome — 27 October 2026

100 distinct existing businesses selected; 106 bounded attempts including retries. Source pages were retrieved for 78 businesses. The final job outcomes were 26 completed with named candidates, 73 requiring manual research and one rejected because the stated role was not explicitly supported by its quoted passage.

There are 38 named candidates across 26 businesses: 26 candidates supported by company-controlled pages and 12 from external public sources requiring confirmation. Two professional email addresses were found: one published by the company, one from an external directory and unverified. Zero addresses were verified as deliverable. No contact was approved, no contact outreach draft persisted, and nothing was sent. Approval/draft tests rolled back their changes.

Known API token/tool usage, including cache writes, cached tokens, long-context pricing and search calls, is estimated at **$0.3345844**, against the separately approved $1 test cap. Existing AWS/Supabase usage is not included. Conservative held/committed budget is approximately $0.5023; it is not a charge. The 50-name / 25-email performance targets were not met. A name on a source page is not independent proof of current employment or buying authority.

## Use future batches

1. Sign in with the existing owner Google account. Open Contact research.
2. Review the saved pilot first: filter by business, city, original lead ID or job status; open Review research. Original generic email, phone/contact history and suppression remain separate.
3. Verify each source and current role. Candidates from company-controlled pages can be approved after human review. External/uncertain candidates require a manually opened corroborating professional source and an exact name/role passage through **Verify current identity with supporting evidence** before approval. Registered-agent records alone do not establish ownership.
4. Approve or reject the candidate. Prepare outreach draft becomes available for approved contacts. It creates a short factual template only; there is no send integration.
5. Request enrichment review saves a pending request only. Hunter or another provider is not called. Identity, published email and deliverability are separate checks.
6. Research is paused after this pilot. Before future research, review the remaining test budget and source limits, then Resume research queue. Choose a batch size and Queue controlled research batch. It deterministically selects previously unprocessed eligible businesses. Research queued batch starts a finite run; keep the page open. Stop after current jobs stops new requests while allowing in-flight work to finish. Individual Retry research uses the same limits and leases.

The research cron is disabled. Resume research queue only enables manually started work. It does not enable a recurring schedule. Search has a 25-attempt pilot cap that does not automatically reset. Expanding that cap or paid enrichment requires a new explicit spending decision; never silently raise the approved budget. At most 100 new businesses/day and 120 attempts/day are configured, with three attempts/business and at most six concurrent server leases (the UI runs four requests at a time).

## Selection and safety

Selection is reproducible from an unchanged dataset: target niches `hvac`, `plumbing`, `electrical`, `roofing`, `dental`, `medical`; usable HTTP(S) website; exclude duplicates, suppressed/DNC records across matching domains, previous research jobs/domains and existing source-supported named contacts. Keep the lowest eligible lead ID per normalized website domain, order by lead ID and take the requested count. Actual selected IDs are frozen in research_batches.selected_ids; the pilot selected 100. The original dataset can change, so this snapshot is the exact audit record.

Website research checks robots.txt per origin and per path before fetching pages, observes crawl delay, identifies itself, follows only permitted redirects, and limits pages, bytes, time and retries. Credentials, private-network addresses, non-web schemes, login/CAPTCHA/challenge bypass and automated LinkedIn/social access are prohibited in code. HTML is never executed. Person structured data, observed links and relevant text are parsed locally; full HTML/page bodies are not retained in the database. Only professional candidate evidence and source-attempt metadata are saved.

OpenAI licensed web search is a URL-discovery fallback within the same approved budget, not a separate subscription. It is limited to one tool call/request and 25 pilot attempts. Generated search answers are never identity evidence: only independently fetched, access-permitted pages can support a contact. External-source candidates are capped at medium confidence and require human confirmation. Some fallbacks can be skipped while another worker holds a conservative budget reservation; a later manual retry can proceed only within the remaining limits.

The extraction model receives whitelisted public company fields and bounded professional source excerpts, not original private notes, call history or customer/patient records. Structured output is schema checked, and continuous source passages must explicitly contain each name and role. Generic, guessed, personal/free and unassociated emails are not named professional addresses. A single explicit corporate email in the short person/role passage can also be extracted without another model call. Alternate corporate domains are accepted only with that explicit published association. No deliverability inference or test email is made.

## Database and execution

Additive migration: `supabase/migrations/20261027164849_contact_research_agent.sql`, generated with official Supabase CLI 2.122.0 and applied iteratively through the connected project tools. This extends the existing prospecting engine; it is not an empty-project bootstrap. The SQL file is version controlled. No local Docker database was used, and the remote migration history was not automatically backfilled by the iterative SQL calls.

New tables: `contact_settings`, `research_batches`, `research_jobs`, `research_attempts`, `contacts`, `contact_evidence`, `contact_drafts`, `enrichment_requests`. All are in `prospecting`, have RLS enabled, and deny direct browser reads/writes. Appropriate unique keys, foreign keys and indexes protect identity deduplication, evidence, attempt history, review status and queue/domain leases. Original lead rows remain read-only.

API: `public.prospecting_contacts(a,d)` is SECURITY INVOKER; it delegates to private `prospecting.contact_api`, which checks campaign ownership or worker role. Browser users cannot invoke worker actions. Private helpers `contact_blocked` and `contact_cost_total` have fixed search paths and revoked public execution. The public API is not executable by anon. Service credentials remain in Edge Function environment only.

Edge Function: `contact-research`, entrypoint `index.ts`, with `research.ts` and `core.mjs`. Gateway `verify_jwt=false` is intentional: the function validates owner bearer tokens against Supabase Auth or the internal scheduler secret before any work. The scheduler credential can run existing jobs only, never enqueue or approve contacts. CORS is limited to the demo origin.

One worker request claims one job atomically, rechecks DNC, obtains a unique domain lease, records an attempt and uses a four-minute lease. Stale workers cannot save. Expired leases are recovered with an interruption record; retry count is bounded. Model/provider failures preserve usage/errors and never promote unsupported output. Unknown provider outcomes retain their cost buffer. Completed provider usage settles known charges. Extraction reserves $0.02/request; search reserves $0.50 against the model's worst-case context and pricing ceiling, releasing the unused portion only after a known response. Total reservations cannot exceed the approved budget.

The private `dispatch_contacts` and `contact-research-queue` cron definition are supplied in scheduler.sql, installed inactive. **Do not activate a recurring paid worker without separate authorization.** Automatic approval review rejected activation during this build; the finite pilot was instead run manually in the dashboard.

## Verification

27 Node tests passed across the existing prospect engine and new core/orchestrator tests. They cover URL/private-IP restrictions, robots rules, source parsing, multiple owners, company mismatch, duplicate people, generic/personal/guessed emails, outdated roles, unsupported claims, missing websites, timeout, provider 429, exhausted budget, licensed URL discovery, LinkedIn exclusion and cost calculations.

SQL tests exercised owner/non-owner/anonymous permissions, worker restrictions, initial queue/budget/DNC/lease recovery, and rolled-back identity verification, approval, draft and rejection. Live checks confirm non-owner/anon/direct-table denial, existing DNC blocking and inactive research cron. Real source failures, permitted crawling, real extraction, licensed search, retries, retained evidence and pause controls were exercised. Phone-width authenticated list/detail checks had no horizontal overflow. Current security advisors show only informational no-policy notices for intentionally private API-only tables; performance checks found no uncovered foreign keys in the new research tables. The remaining unused-index notices are expected on newly created indexes. Unrelated project advisories were left unchanged.

Run tests with Node 24: `node --test prospecting/contact-research/core.test.mjs prospecting/contact-research/orchestrator.test.mjs prospecting/tests/engine.test.mjs`. The SQL test files use explicit rollback; no network or model calls occur from those scripts. Review fixtures before reusing them against another campaign.

The existing Next.js production build also passed, including type checking and all ten static pages. Its TypeScript configuration excludes the Deno-only worker folders; marketing page behavior and dependencies are unchanged. The repository still pins Next.js 15.3.2, which has a pre-existing vendor security advisory (https://nextjs.org/blog/CVE-2025-66478). The deployed contact agent uses static S3 assets and Supabase Edge Functions rather than a Next.js server. Review a framework patch before separately deploying the marketing app as a server. The existing metadataBase build warning was not changed by this work.

## Limits before scaling

Twenty-two businesses had no retrievable permitted page. Many others had no explicit qualifying full name/role within the bounded pages. Static HTML only, missing/deep/JavaScript-rendered biographies, domain changes, ambiguous parent-company relationships, source age, strict quote validation and the 25-search cap all reduce recall. One job remains failed for unsupported role evidence. Do not reinterpret these failures as evidence that an owner does not exist. More permitted source coverage and human checks are needed before scaling.

Hunter is optional and disabled. Its current public free plan lists 50 credits/month; API documentation separates finding and deliverability checks, with one search credit and 0.5 credit/verification for unified-credit accounts. Published annual Starter pricing is €34/month billed €408/year with 24,000 annual credits. At that plan's average credit rate, a successful find-plus-verify is about €0.0255 before failed lookups, yield, taxes or allocation effects. Actual per-usable-contact cost cannot be assumed. Account creation/terms, credentials, credit allocation, identity matching and spending approval must be resolved before use. Sources: https://hunter.io/pricing, https://hunter.io/api-documentation/v2, https://hunter.io/terms-of-service.

Model/tool rates: https://developers.openai.com/api/docs/models/gpt-5.6-luna and https://developers.openai.com/api/docs/pricing. Recheck rates before changing models or expanding budgets. API costs above are usage-derived estimates, not an invoice; existing infrastructure charges were not measured.
