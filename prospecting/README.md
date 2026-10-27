# AI prospecting pilot

Live workspace: https://demo.infinitydigitaldev.com/linkedin-intake.html

This extends the existing Supabase prospecting schema and AWS demo hosting. The marketing Next.js site is unchanged. The standalone assets also live under `public/prospecting/` for repository integration. It is a single-owner pilot, not a multi-tenant CRM.

## Use

1. Open the workspace on a computer or phone. Continue with Google using the existing campaign owner's account. The Supabase dashboard's GitHub login is a separate identity.
2. In **Sources & runs**, inspect collection results and errors. Three manually approved public employer Greenhouse board sources are enabled. The daily collector runs after 7 a.m. America/Denver; the scheduler checks every 15 minutes and retries failures with backoff. Pause daily collection here at any time.
3. In **Manual intake**, paste a LinkedIn profile, company or post URL and public business details you collected yourself. Confirm manual collection. No LinkedIn page is fetched or scraped.
4. Open a prospect. Check source links, publication dates, current/closed status and original lead history. Add manually verified evidence if needed. Explicit buying interest must be separately attested; hiring alone is never buying intent.
5. Choose **AI assess & prepare drafts**. Unchanged evidence reuses its assessment. Review fit, operational need, intent, limitations, citations and next action. Missing or expired evidence requires more research. Qualify only after human review.
6. Review the email, LinkedIn, future-follow-up and phone-point drafts. Approval records a decision only. This app has no send/call integration. Verify recipient, sender, accuracy and applicable channel rules before manually using any draft. Do not contact is enforced server-side.
7. **Targeting & costs** controls geography, industries, title keywords and scoring weights, initially fit 40 / need 35 / intent 25. Weights must total 100. Automatic AI is disabled.

## Actual verification, 27 October 2026

- Original lead table inspected: 14,767 rows. Matching uses unique normalized website domain or company name plus city. Existing notes, calls, follow-ups, duplicates and DNC flags are read, never overwritten. Ambiguous matches are not guessed.
- First collection: 109 postings across three employers, three relevant postings, two employer records. Repeated scheduled collection: 113 live postings, two currently relevant postings, no duplicate businesses/signals. CFM's original front-desk vacancy disappeared and was correctly marked closed.
- Specialty1 Partners: latest fit 78 / need 72 / intent 0; weighted score 56; confidence 90%. The postings concern local practices; verify the specific practice and buying authority rather than assuming the parent company is the correct buyer.
- CFM Company: historical fit 78 / need 67 / intent 0; weighted score 55. Its supporting posting is now closed. Qualification and draft approval are blocked until current evidence supports a new assessment.
- Fifty existing Colorado leads were screened for approved-source coverage. All lacked matching approved sources. These are coverage screenings, not 50 AI-qualified businesses. The goal of 50 substantive evaluations and 10–15 credible prospects has **not** been met. More verified employer sources or manually researched business evidence is needed; directory entries do not become invented buying signals.
- Four OpenAI test calls used the existing GPT-5.6 Luna credential. Token-derived cost: $0.0045708 at $0.20/M input and $1.20/M output. Billing totals may differ. Budget approved: $1; conservative reservations: $0.08. Each attempt reserves $0.02 and reservations are not refunded on failure, limiting this test to at most 50 attempts. No recurring AI calls or subscriptions were enabled. Existing AWS/Supabase usage may incur normal infrastructure charges; those are not included in the token estimate.
- Ten Node tests passed: source cleaning, relevance/geography, intent restrictions, unknown dates, invented quotes/dates, missing evidence, 429/404/503 retry behavior. SQL rollback tests passed owner/non-owner/anonymous access, worker restrictions, legacy matching, dedup, qualification gate, suppression, approval audit and closed-evidence/DNC rejection. No real draft was approved by the agent; approval tests rolled back.
- Real source HTTP 404 was logged with retry/backoff. The clearly labeled QA source is retained disabled as an audit fixture. Scheduled authenticated delivery returned HTTP 200; three real source runs succeeded. Job enabled, automatic AI off. Nothing sent.
- Supabase advisories for the prospecting schema were informational RLS-without-policies notices: intentional direct-table denial behind the owner-checked API. Other existing project advisories were not changed as part of this pilot.

## Components and permissions

## Real example to review

Specialty1 Partners' public practice posting lists: “Answering all incoming calls and redirecting them or keeping messages.” Source: https://job-boards.greenhouse.io/specialty1/jobs/4699429006 (published 23 July 2026; still present in the 27 October collection). A second Colorado Springs posting, published 14 October, supplies more recent operational evidence: https://job-boards.greenhouse.io/specialty1/jobs/4722116006.

The saved score is 56 overall: fit 78, need 72, intent 0. Phone and front-office workflows support a relevance hypothesis; the posting does not prove missed calls, dissatisfaction, budget or buying intent. Confirm practice ownership and the appropriate operations contact before qualifying.

Saved LinkedIn draft, awaiting human review: “Hi — I noticed Specialty1 Partners is in dental care, and practice postings reference incoming-call handling and front-office coordination. Is support with call handling or appointment automation relevant to your team?” No message was sent.

## Technical inventory

Existing `prospecting.campaigns`, `prospects`, `signals`, `assessments`, `outreach`, `activity` are reused. Added: `engine_settings`, `sources`, `collection_runs`, `source_documents`, `lead_screenings`, with RLS enabled and no direct browser table access.

Browser API: `public.prospecting_engine(text,jsonb)` is SECURITY INVOKER, delegates to the private owner-checked `prospecting.engine_api`. Worker actions require the service role. Helpers use fixed empty search paths and are revoked from public/anon/authenticated. `assessment_current` rejects missing, expired, closed or changed quoted evidence. Latest assessment is required to approve drafts. Suppression cancels pending approvals. Legacy DNC flags across matching duplicates also block actions.

Edge Function `prospect-engine` verifies the owner JWT through Supabase Auth. The scheduled path accepts only a Vault-managed secret and can only collect. `verify_jwt=false` is intentional because the function verifies owner tokens and scheduler authentication itself; unauthenticated requests return 401. Only public whitelisted business fields/evidence are sent to OpenAI with `store:false`; original private history is excluded.

Cron job: `prospecting-engine-daily`, `*/15 * * * *`, calls private `prospecting.dispatch_daily()`. One daily run after 7 a.m. Denver, source retries and transport delivery tracking. Vault secret `PROSPECTING_ENGINE_CRON` stays server-side. Daily collection never invokes AI. Monitoring is in Sources & runs; no email alerts are configured.

Only documented public Greenhouse GET endpoints are automated. No applicant access, LinkedIn automation, Gmail, GHL, SMS or dialer writes exist. Board tokens must be manually approved. Pilot limits: 10 boards/run, 300 postings/board, 8 MB response, 10-second source fetch timeout, bounded retries and per-source spacing. Large boards fail explicitly and require a narrower source. Source coverage is currently narrow, not a general web search engine. Boards can change or remove postings at any time.

## Deploy and maintain

The SQL extends the pre-existing prospecting schema; it is not a bootstrap for an empty project. Review owner/campaign IDs before reusing elsewhere. Apply `sql/engine.sql`, then `sql/scheduler.sql`. The scheduler script deliberately leaves its job disabled after installation. Test source/error/authentication paths before recording `collection_verified_at`, enabling `automation_enabled` and activating the job. Do not reapply scheduler.sql to an active installation without expecting it to pause.

Deploy `functions/index.ts` and `functions/engine.mjs` as the `prospect-engine` Supabase Edge Function, entrypoint `index.ts`, JWT gateway check disabled as explained above. Reuse existing server secrets `OpenAI_API` or `OPENAI_API_KEY`; never put them in browser assets. The public Supabase publishable key is intentionally client-visible and does not grant owner access.

Publish only the four files in `public/prospecting/` to the existing S3 demo bucket root and invalidate their CloudFront paths. Preserve the stable callback URL in Supabase Auth's allowlist. Do not overwrite unrelated demo assets or change the existing member-portal callback.

Run `node --test prospecting/tests/engine.test.mjs` and `node --check public/prospecting/linkedin-intake.js`. Execute `tests/database.sql` against the pilot and `tests/review.sql` after one current source-backed assessment exists; both roll back changes. The original Next.js app build is unrelated to these standalone assets and was not used as evidence of the engine's correctness.
