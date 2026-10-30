# Evidence-backed personalization pilot

Live UI: https://demo.infinitydigitaldev.com/linkedin-intake.html → **Personalized drafts**.

This extends the existing owner-authenticated standalone app, Supabase database and `export-smartlead`. No campaign enrollment or sending endpoint exists. Original lead/contact records, ranking and scheduled jobs remain unchanged. `contact-research` remains at its previous production version; its local source is unchanged.

## Components and boundaries

- `index.ts`: live Auth user/owner verification, exact-origin CORS, native RPC adapter, frozen shortlist bootstrap, finite worker and read-only Smartlead integration.
- `worker.ts`: robots-aware company-site research, bounded fetching, current evidence reuse, structured GPT-5.6 Luna generation and deterministic QA. Company pages are untrusted input. No LinkedIn scraping, review-text fabrication, paid enrichment or external search.
- `research-core.mjs`: reused contact-research safety primitives, isolated copy with a tested non-regex robots wildcard matcher. Repeated wildcards previously caused CPU exhaustion on a real pilot site. Original `contact-research` deployment was not replaced.
- `core.mjs`: seven fields, one-service schema, approved sender footer/master, CSV escaping, exact-quote/identity/format/length/one-question/familiarity/signature checks. Semantic model self-check plus agent source inspection do not replace owner approval.
- Private `prospecting.personalization_*` tables: settings, frozen shortlist, leased jobs, source cache, immutable draft revisions, suppressions, export runs and unique export items. All have RLS and no direct anonymous/authenticated table access. Public RPC is an invoker; private definer checks owner or service role, with worker-only actions restricted to service role and fixed search paths.
- `public/prospecting/personalization.js`: review pilot/top2000/full database, filters, facts/hypotheses, source links, latest email/followups, owner approval/rejection, finite queue recovery, review CSV and guarded approved CSV.

## Frozen ranking and pilot

The original v5 exporter’s authentication/ranking/CSV tail is preserved exactly. Its scores prioritize named-looking emails, review aggregates and site-need score; the heuristic first names are **not** reused as verified recipient identities. The latest saved original `smartlead/2026-10-27/smartlead-top2000-ALL.csv` is downloaded server-side from the private exports bucket and frozen with original ID/order/score. New research does not recalculate it.

Selection takes the first original-ranked eligible lead in each state/industry stratum, then the second, until 25. The pilot covers nine industries, CO 9 / AZ 9 / TX 7, and eight recommended opportunity types. Original top2000 excludes dental and med-spa as before. No additional businesses can be enqueued through this pilot-only release. `pilot_reviewed` remains false; full-database paid processing requires a separate approved change and budget.

25 draft businesses were researched. Latest source-reviewed versions: **19 approved_for_review, 6 needs_revision, 0 owner-approved**. Earlier raw drafts remain in version history. Source-review revisions reused generated content at zero additional model cost, added the approved sender footer/commercial identification and stronger QA, and retained the source-version ID. QA approval is not human approval.

## Costs, caching and recovery

Approved separate pilot cap: $1. Reported provider token usage prices to $0.03564105; committed ledger $0.07564105 includes $0.04 retained for two interrupted workers with unknown spend. This is application metering, not an invoice reconciliation. External search and paid enrichment: $0. Company HTTP research has no per-call API fee; existing hosting/network costs were not separately priced.

Illustrative model-only extrapolation at this pilot�s reported average: about $2.85 for 2,000 businesses or $21.05 for 14,767. The conservative $0.02-per-attempt reservation envelope is $40 or $295.34, before retries. Coverage, page access and revision needs vary; these are estimates, not authorization to spend. Full processing remains disabled.

One job per request, UI concurrency one, server concurrency ceiling two, four-minute leases, three attempts, 8-second source timeout with bounded transient retry, maximum four public pages, 1.2 MB download / 350 KB stripped-HTML parse caps, 6,500 retained text characters per page and a 65-second crawl window. Prompt input and 2,600-token output fit a $0.02 reservation per attempt. Expired-worker reservations are retained until reconciled. Current company evidence is reused for 30 days; the cache timestamp is not extended merely by reading it. Identity is only used for a matching approved professional email. No name was verified for the 25 recipients, so all use `there`.

All jobs completed and the paid worker is paused. No paid cron was created or enabled. Re-running generation with no queued jobs performs no paid call. Research failures stay visible; the user can queue a bounded retry within the existing cap/attempt limit.

## Export and Smartlead

Legacy exporter requests remain unchanged. Opt in with owner bearer auth:

```json
{"personalized":true,"scope":"pilot","production":false,"state":"CO","industry":"roofing","min_score":60}
```

Scopes: `pilot`, `top`, `full`; production is opt-in. CSV maps `email`, `first_name`, `company_name`, `website` and the exact seven custom fields. Review CSV deliberately uses `review_recipient` instead of `email` and marks `export_ready=false`. It must not be imported as a campaign lead file.

Production export requires the latest version, QA pass, owner source-check confirmation and exact-version approval, current recipient match, research age under 30 days, no legacy/business/email/domain suppression, a complete suppression snapshot less than 24 hours old, resolved-unsubscribe handling confirmation, and no prior version/email export item. Export runs record version IDs, filters, actor and timestamp; output is deduplicated by normalized recipient. A failed browser download after a production export requires operator reconciliation rather than silently exporting the same recipient again.

The master uses `{{custom_subject}}`, `{{first_name}}` and the seven exact `custom_*` fields; followups contain body text only and use the same sender/commercial/postal footer plus `%unsubscribe-text%`. Map case-sensitive custom columns and preview all resolved fields and unsubscribe behavior in Smartlead. Unverified names use `Hi there,`.

Optional server-only `SMARTLEAD_API_KEY` and `SMARTLEAD_CAMPAIGN_ID` enable a GET-only campaign suppression CSV reader. A campaign-only import **never** attests global coverage. Global block/unsubscribe/bounce coverage must be checked and imported separately through the complete-snapshot form. No credential was created and no live campaign settings or warmed mailboxes were changed. The current deployment has no configured Smartlead API connection; this optional reader was not live-provider tested.

## Checks and limits

`node --test prospecting/personalization/core.test.mjs` passes: CSV roundtrip/formula escaping, private-address/domain guards, robots allow/disallow/terminal-dollar/pathological wildcard regression, exact evidence, formatting/length, one question, fabricated familiarity and byte-preserved legacy exporter tail. Existing contact-research tests also pass; no contact-research source change remains. The worker module graph loads and repository type checking/build pass. Run `integration.test.sql` via the authorized SQL connection: owner/worker boundaries, private grants, export readiness, temporary approval, suppression normalization, duplicate-export prevention, cache miss, paused worker and lease recovery all pass; fixtures roll back.

Browser tests: owner login, 25-row pilot view, six-row revision filter, source/detail preview, top/full scope controls, 25-row review-only CSV through the extended exporter and blocked import-ready export. No Smartlead import or send was tested or performed. Static artifacts are deployed to the existing S3/CloudFront site; the Next.js server was not deployed.

Source limitations: old audits store feature hints, not proof of operational failure. Google Places stores ratings/counts, not individual review text. The engine does not infer complaints, missed calls or buying intent from them. Some public-source re-fetches failed; validation notes identify where the successful captured company-source snapshot was reviewed instead. Six drafts need revision (including joined/non-continuous quotes, a misread signup form and generated followup signatures). This release has approve/reject controls, not an unrestricted manual copy editor or full-database research launcher. Request revised research/generation before approving those drafts; the three-attempt ceiling is deliberately not bypassed.

Security advisors show intentional private RLS-with-no-direct-policy notices and pre-existing unrelated project findings. New function search paths are fixed and new tables are private. The new export-history foreign key was indexed. Existing unrelated views, auth settings and applications were not changed.

## Rollback

1. Pause the new worker through its owner settings action (already paused).
2. Redeploy `backups/export-smartlead-5.ts` as the original `export-smartlead` entrypoint; retain its previous JWT verification setting. It still performs its own legacy-token authentication.
3. Restore `public/prospecting/linkedin-intake.html` from base commit `84fd003eb574d765003706a0e5fc96a02367bfa7`, publish that single file to the existing bucket and invalidate `/linkedin-intake.html`. Remove the new script reference by restoring that HTML. Do not deploy the entire Next application.
4. Disable/remove the new Edge endpoint after restoring the UI, and revoke the new public RPC if retiring it. Retain private tables, evidence and exports for audit/recovery; destructive table cleanup is not part of rollback.

The original site-audit, lead-finder, prospect-engine and contact-research deployments and the saved shortlist/legacy exports do not need restoration because they were not replaced.

## Primary references verified during implementation

- [Smartlead custom variables](https://helpcenter.smartlead.ai/en/articles/159-what-are-variables-and-how-to-use-them-effectively-to-personalize-emails-on-smartlead)
- [Smartlead CSV mapping](https://helpcenter.smartlead.ai/en/articles/409-how-to-map-csv-columns-in-smartlead-campaigns)
- [Smartlead unsubscribe handling](https://helpcenter.smartlead.ai/en/articles/1-how-does-unsubscribing-work)
- [Smartlead API](https://helpcenter.smartlead.ai/en/articles/125-full-api-documentation)
- [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna)
- [FTC commercial-email guide](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api)
