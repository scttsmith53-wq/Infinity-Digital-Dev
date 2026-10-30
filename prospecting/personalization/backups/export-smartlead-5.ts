// Builds Smartlead import CSVs from lead_finder_leads, cleans scraped emails, fills the cold-email merge fields,
// uploads to the private 'exports' bucket and returns signed links.
// POST {}                      -> every usable lead, one file per market
// POST { mode:"top", n:2000 }  -> best N, split evenly by market: named emails first, strong reviews, sites that need help
// Header x-lead-token required.
import { createClient } from "jsr:@supabase/supabase-js@2";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const NICHE: Record<string, [string, string, string]> = {
  "roofing": ["roofers", "roofer", "After a hail storm, homeowners call three or four roofers, and the first one to answer usually gets the inspection."],
  "hvac": ["HVAC companies", "HVAC company", "When the heat goes out at 9 p.m., people call down the list until someone picks up."],
  "plumbing": ["plumbers", "plumber", "With a leak, people don't leave voicemails. They call the next plumber."],
  "electrical": ["electricians", "electrician", "Most people call two or three electricians and go with whoever calls back first."],
  "landscaping": ["landscapers", "landscaper", "In spring, quote requests pile up fast, and the ones that sit a day usually go to someone else."],
  "med-spa": ["med spas", "med spa", "A lot of new clients go to book at night, and if they can't book right then, many don't come back."],
  "dental": ["dental offices", "dental office", "New patients often call over lunch or after hours, and a missed call usually means they try the next office."],
  "auto-repair": ["auto shops", "auto shop", "When someone's car breaks down, they call shops until one answers."],
  "auto-detailing": ["detailers", "detailer", "Most detailing inquiries come in by text or after hours, and the quick reply wins the job."],
  "insurance": ["insurance agencies", "insurance agency", "Quote shoppers usually call a few agencies, and the first one to respond tends to write the policy."],
  "property-management": ["property managers", "property manager", "Owners and tenants call at all hours, and one missed call from a prospective owner can be a lost door."],
};
const LOCAL: Record<string, Record<string, string>> = {
  AZ: {
    "roofing": "After a monsoon storm, homeowners call three or four roofers, and the first one to answer usually gets the job.",
    "hvac": "When the AC quits on a 110-degree day, people call down the list until someone picks up.",
    "landscaping": "When the weather cools off, quote requests pile up fast, and the ones that sit a day usually go to someone else.",
  },
  TX: {
    "roofing": "After a big storm rolls through, homeowners call three or four roofers, and the first one to answer usually gets the inspection.",
    "hvac": "When the AC quits in the middle of a Houston summer, people call down the list until someone picks up.",
  },
};
const TEST = new Set(["roofing", "hvac", "plumbing", "auto-repair"]);
const TOP_SKIP = new Set(["dental", "med-spa"]); // HIPAA question on the AI phone line; leave out of the first test
const BAD_LOCAL = /^(example|test|name|email|your|youremail|user|username|noreply|no-reply|donotreply|privacy|abuse|webmaster|postmaster|jobs|careers|hr|resume)$/i;
const BAD_DOMAIN = /(example\.|sentry|wixpress|domain\.com|yourdomain|email\.com$|godaddy|squarespace|wordpress|cloudflare|schema\.org|w3\.org|googleapis)/i;
const GENERIC = new Set("info office contact contacts admin administrator service services sales hello hi support team booking bookings book appointments appointment appt frontdesk front customerservice customer billing accounts accounting ar ap marketing mail inquiries inquiry enquiries estimates estimate schedule scheduling dispatch help quotes quote orders order web general reception care jobs careers ask owner owners manager management leasing rentals rent repairs repair parts shop store mainoffice main hq team1 office1 contactus getintouch connect hey welcome claims policy policies agency insurance roofing plumbing hvac electric electrical landscape landscaping detail detailing auto autorepair spa medspa dental smile smiles pm property properties homes home leads lead new newpatients patients patient".split(" "));
const GENERIC_PREFIX = /^(general|mailbox|mail|office|info|admin|contact|service|sales|support|reception|billing|account|team|hello|booking|estimate|quote|dispatch|customer|front|schedul|appoint|inquir|enquir|help|marketing|order|claims|leasing|rental|repair|parts|store|shop|web)/;
const NAMES = new Set("aaron adam adrian alan albert alex alexander alexis alfredo alice alicia allison alma alyssa amanda amber amy ana andrea andres andrew andy angel angela angie anita ann anna anne annie anthony antonio april arthur ashley audrey austin barbara barry ben benjamin bernard beth betty beverly bill billy bob bobby bonnie brad bradley brandi brandon brandy brenda brent brett brian briana brianna bridget brittany brooke bruce bryan caleb cameron carl carla carlos carmen carol carolyn carrie casey cassandra catherine cathy chad charles charlie charlotte chase chelsea cheryl chris christian christina christine christopher cindy claire clara clayton cody colin connie corey courtney craig crystal curtis cynthia dale dan dana daniel danielle danny darlene darren dave david dawn dean debbie deborah debra denise dennis derek diana diane dianne dominic don donald donna doris dorothy doug douglas dustin dylan earl ed eddie edgar eduardo edward elaine elena elizabeth ellen emily emma eric erica erik erin ernest esther ethan eugene eva evan evelyn felicia fernando frances francisco frank fred gabriel gail gary gene george gerald gina glen glenn gloria gordon grace greg gregory hannah harold heather hector heidi helen henry holly howard hunter ian isaac jack jackie jacob jacqueline jaime jake james jamie jan jane janet janice jared jasmine jason javier jay jean jeff jeffrey jen jenna jennifer jenny jeremy jerry jesse jessica jesus jill jim jimmy jo joan joann joanne joe joel john johnny jon jonathan jordan jorge jose joseph josh joshua joy joyce juan judith judy julia julie justin karen kari karl kate katherine kathleen kathryn kathy katie kayla keith kelly ken kendra kenneth kevin kim kimberly kristen kristin kristina kurt kyle lance larry laura lauren laurie leah lee leo leon leslie lillian linda lindsay lisa logan lori lorraine louis luis luke lynn madison maria marie marilyn mario mark marsha martha martin marvin mary matt matthew maureen megan melanie melissa michael michele michelle miguel mike missy misty mitchell molly monica morgan nancy natalie nathan neil nicholas nick nicole noah norma olivia oscar pam pamela pat patricia patrick paul paula peggy peter phil philip phillip rachel ralph ramon randall randy ray raymond rebecca regina renee rhonda ricardo richard rick ricky rita rob robert roberto robin rodney roger ron ronald rosa rose ross roy ruben russell ruth ryan sabrina sally sam samantha samuel sandra sandy sara sarah scott sean sergio seth shane shannon sharon shawn sheila shelby shelly sherry shirley stacey stacy stephanie stephen steve steven sue susan suzanne sylvia tammy tanya tara ted teresa terri terry theresa thomas tim timothy tina todd tom tommy tony tracey tracy travis trevor troy tyler valerie vanessa vicki vickie victor victoria vincent virginia wade walter wanda wayne wendy wesley william willie yolanda zach zachary".split(" "));

function decode(s: string) {
  return s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"');
}
function cleanEmail(raw: string): string | null {
  let e = decode(raw || "").trim().toLowerCase().replace(/^mailto:/, "").replace(/^https?:\/\//, "").replace(/[\\\s"'<>;,)\]]+$/g, "").replace(/^[\s"'<(\[]+/, "");
  if (!/^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(e)) return null;
  const [local, dom] = e.split("@");
  if (BAD_LOCAL.test(local) || BAD_DOMAIN.test(dom) || /\.(png|jpe?g|gif|webp|svg|css|js)$/.test(e)) return null;
  return e;
}
function person(email: string): { first: string; named: boolean } {
  const local = email.split("@")[0].replace(/\d+/g, "");
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (!parts.length || GENERIC.has(local) || GENERIC.has(parts[0]) || GENERIC_PREFIX.test(parts[0])) return { first: "", named: false };
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  if (NAMES.has(parts[0])) return { first: cap(parts[0]), named: true };
  for (const n of [parts[0].slice(0, 8), parts[0].slice(0, 7), parts[0].slice(0, 6), parts[0].slice(0, 5), parts[0].slice(0, 4)]) {
    if (n.length >= 4 && NAMES.has(n) && parts[0].length - n.length >= 3 && !/(roof|plumb|electric|hvac|air|auto|detail|spa|dental|insur|lawn|land|home|prop)/.test(parts[0].slice(n.length))) return { first: cap(n), named: true };
  }
  if (/^[a-z][a-z]{3,12}$/.test(parts[0]) && parts.length <= 2 && !/(roof|plumb|electric|hvac|air|auto|detail|spa|dental|insur|lawn|land|home|prop|group|llc|inc|co$|services?|pro|team|crew|company)/.test(local)) return { first: "", named: true };
  return { first: "", named: false };
}
function cleanName(n: string) {
  let s = (n || "").split(/\s[|–—]\s|\s-\s|\s\|/)[0].trim();
  s = s.replace(/,?\s+(llc|l\.l\.c\.|inc\.?|incorporated|co\.)$/i, "").trim();
  return s || n;
}
function cleanSite(u: string) {
  if (!u) return "";
  try { const x = new URL(u); return x.origin + (x.pathname === "/" ? "" : x.pathname); } catch { return u.split("?")[0]; }
}
const csvCell = (v: unknown) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

Deno.serve(async (req) => {
  const { data: cfg } = await sb.from("lead_finder_config").select("value").eq("key", "access_token").maybeSingle();
  if (!cfg?.value || req.headers.get("x-lead-token") !== cfg.value) return Response.json({ error: "unauthorized" }, { status: 401 });
  const opts = await req.json().catch(() => ({}));
  const top = opts.mode === "top"; const N = Math.min(Number(opts.n) || 2000, 10000);

  const rows: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from("lead_finder_leads")
      .select("id,name,niche,city,state,phone,website,email,rating,reviews,do_not_contact,dup_of,call_status,site_need_score,site_audit")
      .not("email", "is", null).neq("email", "").is("dup_of", null).in("state", ["CO", "AZ", "TX"])
      .order("id").range(from, from + 999);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  const seen = new Set<string>();
  const leads: any[] = [];
  const stats: Record<string, any> = { scanned: rows.length, bad_email: 0, dnc: 0, dup_email: 0 };
  for (const r of rows) {
    if (r.do_not_contact || r.call_status === "not_interested" || r.call_status === "wrong_number") { stats.dnc++; continue; }
    const email = cleanEmail(r.email); if (!email) { stats.bad_email++; continue; }
    if (seen.has(email)) { stats.dup_email++; continue; }
    seen.add(email);
    if (!NICHE[r.niche]) continue;
    const p = person(email);
    const rating = Number(r.rating) || 0, reviews = Number(r.reviews) || 0;
    let score = 0;
    if (p.named) score += 40; if (p.first) score += 10;
    if (rating >= 4.5 && reviews >= 25) score += 10 + Math.min(20, Math.round(Math.log10(reviews) * 8));
    else if (rating && rating < 4.0) score -= 10;
    score += Number(r.site_need_score ?? 15);
    leads.push({ ...r, email, first: p.first, named: p.named, score });
  }

  const header = ["email", "first_name", "last_name", "company_name", "phone_number", "website", "linkedin_profile", "location",
    "lead_id", "industry", "test_industry", "city", "state", "niche_plural", "niche_singular", "niche_line", "rating", "reviews", "review_line", "demo_link",
    "lead_score", "named_email", "has_chat", "has_booking", "greet_name"];
  const toLine = (r: any) => {
    const n = NICHE[r.niche];
    const company = cleanName(r.name);
    const strong = Number(r.rating) >= 4.5 && Number(r.reviews) >= 25;
    const reviewLine = strong ? `${Number(r.rating).toFixed(1)} stars from ${r.reviews} reviews is no small thing, so you're clearly doing the work right.` : "";
    const demo = `https://demo.infinitydigitaldev.com/${r.niche}/?for=${encodeURIComponent(company).replace(/%20/g, "+")}${r.state !== "CO" ? "&st=" + r.state : ""}&lid=${r.id}`;
    const city = r.city || "your area";
    const a = r.site_audit || {};
    return [r.email, r.first, "", company, r.phone ?? "", cleanSite(r.website ?? ""), "", `${city}, ${r.state}`,
      r.id, r.niche, TEST.has(r.niche) ? "yes" : "no", city, r.state, n[0], n[1], LOCAL[r.state]?.[r.niche] ?? n[2], r.rating ?? "", r.reviews ?? "", reviewLine, demo,
      r.score, r.named ? "yes" : "no", a.unreadable ? "unknown" : (r.site_audit ? (a.chat ? "yes" : "no") : "unchecked"), a.unreadable ? "unknown" : (r.site_audit ? (a.booking ? "yes" : "no") : "unchecked"),
      r.first || "there"].map(csvCell).join(",");
  };

  const out: Record<string, any[]> = { CO: [], AZ: [], TX: [] };
  if (top) {
    const pools: Record<string, any[]> = { CO: [], AZ: [], TX: [] };
    for (const l of leads) if (!TOP_SKIP.has(l.niche)) pools[l.state].push(l);
    for (const st in pools) pools[st].sort((a, b) => b.score - a.score || (Number(b.reviews) || 0) - (Number(a.reviews) || 0) || a.id - b.id);
    let quota = Math.floor(N / 3);
    const take: Record<string, number> = { CO: 0, AZ: 0, TX: 0 };
    for (const st in pools) take[st] = Math.min(quota, pools[st].length);
    let left = N - take.CO - take.AZ - take.TX;
    for (const st of ["TX", "AZ", "CO"]) { const extra = Math.min(left, pools[st].length - take[st]); take[st] += extra; left -= extra; }
    for (const st in pools) out[st] = pools[st].slice(0, take[st]);
  } else {
    for (const l of leads) out[l.state].push(l);
  }

  const sum: Record<string, any> = {};
  for (const st in out) sum[st] = { n: out[st].length, named: out[st].filter((x) => x.named).length, first_names: out[st].filter((x) => x.first).length,
    strong_reviews: out[st].filter((x) => Number(x.rating) >= 4.5 && Number(x.reviews) >= 25).length,
    no_chat: out[st].filter((x) => x.site_audit && !x.site_audit.unreadable && !x.site_audit.chat).length,
    audited: out[st].filter((x) => x.site_audit).length, min_score: out[st].length ? out[st][out[st].length - 1].score : null };
  stats.selected = sum;

  const stamp = new Date().toISOString().slice(0, 10);
  const tag = top ? `top${N}` : "all";
  const links: Record<string, string> = {};
  const all: string[] = [];
  for (const st of ["CO", "AZ", "TX"]) {
    const lines = out[st].map(toLine); all.push(...lines);
    const path = `smartlead/${stamp}/smartlead-${tag}-${st}.csv`;
    const up = await sb.storage.from("exports").upload(path, new Blob([[header.join(","), ...lines].join("\n") + "\n"], { type: "text/csv" }), { upsert: true, contentType: "text/csv" });
    if (up.error) return Response.json({ error: up.error.message, stats }, { status: 500 });
    const { data: s } = await sb.storage.from("exports").createSignedUrl(path, 60 * 60 * 24 * 7, { download: `smartlead-${tag}-${st}.csv` });
    links[st] = s?.signedUrl ?? "";
  }
  if (top) {
    const path = `smartlead/${stamp}/smartlead-${tag}-ALL.csv`;
    await sb.storage.from("exports").upload(path, new Blob([[header.join(","), ...all].join("\n") + "\n"], { type: "text/csv" }), { upsert: true, contentType: "text/csv" });
    const { data: s } = await sb.storage.from("exports").createSignedUrl(path, 60 * 60 * 24 * 7, { download: `smartlead-${tag}-ALL.csv` });
    links.ALL = s?.signedUrl ?? "";
  }
  return Response.json({ ok: true, stats, links });
});
