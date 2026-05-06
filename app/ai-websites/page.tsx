import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = { title: 'AI Websites | Infinity Digital Dev' }

const features = [
  { icon: 'code', title: 'Custom Coded Site', desc: 'Built from scratch in Next.js. No page builders, no bloated templates. Fast, secure, and yours.' },
  { icon: 'smart_toy', title: 'AI Chat Agent', desc: 'An AI assistant that lives on your site. It knows your business, answers FAQs, and captures visitor info around the clock.' },
  { icon: 'notifications_active', title: 'Lead Capture', desc: 'Every conversation is logged. You get notified when a real lead comes in, so you can follow up fast.' },
  { icon: 'phonelink', title: 'Mobile-First', desc: 'Looks great on every device. Built responsive from day one, not as an afterthought.' },
]

const plans = [
  {
    name: 'Starter Site',
    price: '$750',
    period: 'one-time',
    monthly: null,
    features: ['5 pages', 'AI chat agent included', 'Fully responsive', 'Contact form + lead capture', 'Hosted and launched'],
    highlight: false,
    cta: 'Get Started',
  },
  {
    name: 'Site + Maintenance',
    price: '$750',
    period: 'setup',
    monthly: '$199/mo',
    features: ['Everything in Starter', 'Monthly updates & edits', '24/7 monitoring', 'Security patches', 'Priority support'],
    highlight: true,
    cta: 'Get Started',
  },
  {
    name: 'Site + CRM + Phone',
    price: '$750',
    period: 'setup',
    monthly: '$299/mo',
    features: ['Everything in Maintenance', 'Go High Level CRM setup', 'Automated follow-up sequences', 'AI phone agent', 'Pipeline reporting'],
    highlight: false,
    cta: 'Get Started',
  },
]

export default function AIWebsitesPage() {
  return (
    <main>
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col justify-center items-center text-center px-margin py-xxl overflow-hidden bg-background">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block px-md py-xs rounded-full border border-secondary/30 text-secondary bg-secondary/5 font-bold text-label-sm mb-lg uppercase tracking-widest">
            Custom Websites + AI That Works For You
          </span>
          <h1 className="text-display font-extrabold text-on-surface mb-md tracking-tight">
            A Website That Talks To Your Customers —{' '}
            <span className="text-secondary">Even at 2am.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-xl">
            We build fast, custom-coded websites with an AI chat agent built right in. It answers questions, captures leads, and books appointments — so you don&apos;t have to.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-md">
            <Link href="/contact" className="bg-secondary text-on-primary px-xl py-md rounded-lg font-bold text-label-md hover:bg-secondary/90 transition-all">
              Get a Free Quote
            </Link>
            <Link href="#how-it-works" className="border border-secondary text-secondary px-xl py-md rounded-lg font-bold text-label-md hover:bg-secondary/5 transition-all">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {features.map((f) => (
              <div key={f.title} className="p-xl rounded-xl border border-outline/20 bg-background hover:border-secondary/40 transition-all">
                <span className="material-symbols-outlined text-secondary text-[48px] mb-md block">{f.icon}</span>
                <h3 className="text-h3 font-bold text-on-surface mb-sm">{f.title}</h3>
                <p className="text-body-md text-on-surface-variant">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-margin py-xxl bg-background">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-h1 font-bold text-on-surface mb-xxl">How We Get You Online</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[
              { n: '1', title: 'Discovery Call', desc: 'A free call to understand your business goals. No pressure, no pitch.' },
              { n: '2', title: 'We Build It', desc: 'Professional design and custom code, ready in 2–4 weeks.' },
              { n: '3', title: 'You Launch & Grow', desc: 'Go live and start capturing leads automatically — day and night.' },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-h3 mb-md border border-secondary/30">
                  {step.n}
                </div>
                <h4 className="text-h3 font-bold text-on-surface mb-sm">{step.title}</h4>
                <p className="text-body-md text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xxl">
            <h2 className="text-h1 font-bold text-on-surface mb-sm">Simple, Upfront Pricing</h2>
            <p className="text-body-md text-on-surface-variant">Choose the plan that fits your business. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-xl rounded-xl flex flex-col justify-between relative ${
                  plan.highlight
                    ? 'bg-background border-2 border-secondary shadow-xl md:scale-105 z-10'
                    : 'bg-background border border-outline/20'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary text-on-primary px-md py-xs rounded-full text-label-sm font-bold">
                    Most Popular
                  </div>
                )}
                <div>
                  <h4 className={`text-label-md uppercase tracking-widest mb-md ${plan.highlight ? 'text-secondary' : 'text-on-surface-variant'}`}>
                    {plan.name}
                  </h4>
                  <div className="mb-lg">
                    <span className="text-h1 font-extrabold text-on-surface">{plan.price}</span>
                    <span className="text-body-md text-on-surface-variant ml-xs">{plan.period}</span>
                    {plan.monthly && <div className="text-secondary font-bold text-h3 mt-xs">{plan.monthly}</div>}
                  </div>
                  <ul className="space-y-md mb-xl">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-sm text-body-md text-on-surface">
                        <span className="material-symbols-outlined text-secondary text-sm">check</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/contact"
                  className={`block w-full text-center py-md rounded-lg font-bold text-label-md transition-all ${
                    plan.highlight
                      ? 'bg-secondary text-on-primary hover:bg-secondary/90'
                      : 'border border-secondary text-secondary hover:bg-secondary/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-xl text-label-sm text-on-surface-variant opacity-70">
            All plans include a free 30-minute discovery call. No contracts. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-margin py-xxl bg-background">
        <div className="max-w-4xl mx-auto text-center py-xl border border-outline/20 rounded-2xl bg-surface">
          <h2 className="text-h1 font-bold text-on-surface mb-sm">Not sure which plan is right for you?</h2>
          <p className="text-body-lg text-on-surface-variant mb-xl">
            Book a free 15-minute call and we&apos;ll tell you exactly what your business needs.
          </p>
          <Link href="/contact" className="inline-block bg-secondary text-on-primary px-xxl py-md rounded-lg font-bold text-label-md hover:bg-secondary/90 transition-all">
            Book a Free Call
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
