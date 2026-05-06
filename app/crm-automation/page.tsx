import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = { title: 'CRM & Automation | Infinity Digital Dev' }

const stats = [
  { value: '40%', label: 'Faster Lead Response', color: 'text-secondary' },
  { value: '2.5x', label: 'Conversion Rate Lift', color: 'text-on-surface' },
  { value: '15h', label: 'Weekly Admin Saved', color: 'text-secondary' },
  { value: '100%', label: 'Data Accuracy', color: 'text-on-surface' },
]

const integrations = [
  { icon: 'payments', name: 'Stripe' },
  { icon: 'send', name: 'Twilio' },
  { icon: 'forum', name: 'Slack' },
  { icon: 'mail', name: 'Mailgun' },
  { icon: 'share', name: 'FB Ads' },
  { icon: 'cloud', name: 'AWS' },
]

export default function CRMAutomationPage() {
  return (
    <main>
      <Navigation />

      {/* Hero */}
      <section className="px-margin py-xxl bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center relative z-10">
          <div className="space-y-md">
            <span className="inline-block px-sm py-xs bg-secondary/10 text-secondary rounded-lg text-label-sm uppercase tracking-widest font-bold">
              CRM & Automation
            </span>
            <h1 className="text-display font-extrabold text-on-surface">
              Your Business on <span className="text-secondary">Autopilot</span>.
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl">
              We set up Go High Level and build automation workflows that eliminate manual data entry, nurture leads automatically, and scale your sales pipeline — without adding headcount.
            </p>
            <div className="flex flex-wrap gap-md pt-md">
              <Link href="/contact" className="bg-secondary text-on-primary px-xl py-md rounded-lg font-bold text-h3 hover:bg-secondary/90 transition-all">
                Get a Free Audit
              </Link>
              <Link href="#how-it-works" className="border border-outline text-on-surface px-xl py-md rounded-lg font-bold text-h3 hover:bg-surface-variant transition-all">
                See the Process
              </Link>
            </div>
          </div>

          {/* CRM visual */}
          <div className="relative rounded-xl overflow-hidden border border-outline/20 shadow-2xl">
            <Image
              src="/images/crm-dashboard.png"
              alt="CRM automation dashboard"
              width={1456}
              height={816}
              className="w-full h-auto"
            />
            {/* Overlay badge */}
            <div className="absolute bottom-6 left-6 glass-card px-lg py-md rounded-xl flex items-center gap-md">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
              </span>
              <span className="text-label-md font-bold text-on-primary">Automation Running</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="py-xl bg-background border-y border-outline/10">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-lg text-center">
            {stats.map((s) => (
              <div key={s.label} className="p-lg">
                <p className={`text-display font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-label-md text-on-surface-variant mt-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section id="how-it-works" className="py-xxl px-margin bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="mb-xl text-center max-w-2xl mx-auto">
            <h2 className="text-h1 font-bold text-on-surface mb-md">Our Implementation Roadmap</h2>
            <p className="text-body-md text-on-surface-variant">From initial audit to fully automated systems in under 21 days.</p>
          </div>
          <div className="relative max-w-3xl mx-auto space-y-xl">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-outline/20 hidden md:block" />
            {[
              { n: '1', title: '01. Discovery Audit', desc: 'We map your current sales process, identify friction points, and find the highest-ROI automation opportunities.' },
              { n: '2', title: '02. GHL Setup', desc: 'We build your Go High Level account, pipelines, custom fields, and automation workflows from scratch.' },
              { n: '3', title: '03. Integration & Testing', desc: 'We connect your website, ads, and tools into one unified system — then test every flow before launch.' },
            ].map((step) => (
              <div key={step.n} className="flex gap-xl items-start">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-on-primary font-bold shrink-0 relative z-10">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-h2 font-bold text-secondary mb-sm">{step.title}</h3>
                  <p className="text-body-md text-on-surface-variant">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-xxl px-margin bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-h1 font-bold text-on-surface mb-xl">What We Connect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-lg">
            <div className="bg-surface p-lg rounded-xl border border-outline/20">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-secondary">hub</span>
              </div>
              <h3 className="text-h3 font-bold text-on-surface mb-sm">Go High Level (GHL)</h3>
              <p className="text-body-md text-on-surface-variant">The core engine for your marketing, sales, and follow-up. We&apos;re certified in GHL snapshot deployment, pipeline setup, and workflow triggers.</p>
            </div>
            <div className="bg-surface p-lg rounded-xl border border-outline/20">
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-orange-500">bolt</span>
              </div>
              <h3 className="text-h3 font-bold text-on-surface mb-sm">Zapier / Make</h3>
              <p className="text-body-md text-on-surface-variant">Connecting 5,000+ apps. We build multi-step automations that handle conditional logic, API webhooks, and data formatting across your entire stack.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
            {integrations.map((tool) => (
              <div key={tool.name} className="bg-surface p-md rounded-xl border border-outline/20 flex items-center gap-md hover:border-secondary/40 transition-all">
                <span className="material-symbols-outlined text-secondary">{tool.icon}</span>
                <span className="text-label-md font-medium text-on-surface">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with form */}
      <section className="py-xxl px-margin bg-surface relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-xl">
            <h2 className="text-display font-extrabold text-on-surface mb-md">Stop Leaking Revenue.</h2>
            <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Most businesses lose 20–30% of potential sales due to slow follow-up. Let&apos;s fix that.
            </p>
          </div>
          <div className="bg-background p-xl rounded-xl border border-outline/20 grid grid-cols-1 md:grid-cols-2 gap-xl items-start">
            <div>
              <h3 className="text-h2 font-bold text-on-surface mb-md">Request a Free Workflow Audit</h3>
              <p className="text-body-md text-on-surface-variant mb-lg">
                We&apos;ll spend 30 minutes mapping your current process and show you exactly where automation saves you time and money.
              </p>
              <ul className="space-y-sm">
                {['Full CRM Gap Analysis', 'Automation Efficiency Score', 'Custom Roadmap — free'].map((item) => (
                  <li key={item} className="flex items-center gap-sm text-label-md text-on-surface">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-md">
              <div>
                <label className="block text-label-sm mb-xs uppercase font-bold text-on-surface-variant">Business Email</label>
                <input className="w-full bg-surface border border-outline/30 rounded-lg p-md text-on-surface focus:ring-2 focus:ring-secondary outline-none" placeholder="you@company.com" type="email" />
              </div>
              <div>
                <label className="block text-label-sm mb-xs uppercase font-bold text-on-surface-variant">Monthly Lead Volume</label>
                <select className="w-full bg-surface border border-outline/30 rounded-lg p-md text-on-surface focus:ring-2 focus:ring-secondary outline-none">
                  <option>1–50 leads</option>
                  <option>50–200 leads</option>
                  <option>200–1,000 leads</option>
                  <option>1,000+ leads</option>
                </select>
              </div>
              <Link href="/contact" className="block w-full text-center bg-secondary text-on-primary py-md rounded-lg font-bold text-label-md hover:bg-secondary/90 transition-all">
                Book My Free Audit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
