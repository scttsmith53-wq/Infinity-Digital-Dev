import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = { title: 'Services | Infinity Digital Dev' }

const services = [
  {
    icon: 'psychology',
    title: 'AI Websites',
    desc: 'Custom coded Next.js websites with built-in AI chat agents. Your site qualifies leads, answers questions, and books appointments 24/7.',
    features: ['AI Chat Agent Included', 'Custom Coded (No Templates)', 'Mobile-First Design'],
    href: '/ai-websites',
  },
  {
    icon: 'hub',
    title: 'CRM Automation',
    desc: 'Go High Level setup and custom automation workflows that eliminate manual data entry and keep your sales pipeline moving automatically.',
    features: ['Go High Level Setup', 'Lead Pipeline & Follow-Up', 'AI Phone Agent'],
    href: '/crm-automation',
  },
  {
    icon: 'inventory_2',
    title: 'Employee Swag Stores',
    desc: 'A branded online store for your team. Employees browse and buy company gear anytime. Bulk orders for events and new hires made easy.',
    features: ['Live in Under a Week', 'No Inventory Management', 'Bulk Order Support'],
    href: '/swag-stores',
  },
]

export default function ServicesPage() {
  return (
    <main>
      <Navigation />

      {/* Hero */}
      <section className="px-margin py-xxl bg-surface relative overflow-hidden">
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full" />
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-sm bg-secondary/10 border border-secondary/20 px-md py-xs rounded-full mb-lg">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="text-label-sm uppercase tracking-widest text-secondary font-bold">What We Build</span>
          </div>
          <h1 className="text-display font-extrabold text-on-surface mb-lg max-w-4xl leading-tight">
            Everything Your Business Needs to <span className="text-secondary">Grow Online</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mb-xl">
            We blend technical precision with practical business sense to deliver digital tools that drive real growth.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-xxl px-margin bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {services.map((service) => (
              <div
                key={service.title}
                className="group relative bg-surface border border-outline/20 p-xl rounded-xl hover:border-secondary/50 hover:shadow-[0_0_20px_rgba(0,89,184,0.1)] transition-all duration-300"
              >
                <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center rounded-lg mb-xl group-hover:bg-secondary transition-colors duration-300">
                  <span className="material-symbols-outlined text-secondary group-hover:text-on-primary text-[32px]">
                    {service.icon}
                  </span>
                </div>
                <h3 className="text-h2 font-bold text-on-surface mb-md">{service.title}</h3>
                <p className="text-body-md text-on-surface-variant mb-xl">{service.desc}</p>
                <ul className="space-y-sm mb-xl">
                  {service.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-sm text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={service.href}
                  className="text-secondary text-label-md font-bold flex items-center gap-xs hover:gap-md transition-all"
                >
                  Learn more <span className="material-symbols-outlined">chevron_right</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-xxl px-margin bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xxl">
            <h2 className="text-h1 font-bold text-on-surface mb-md">Built With the Best Tools</h2>
            <p className="text-body-md text-on-surface-variant max-w-xl mx-auto">Every project uses industry-leading technology for speed, security, and reliability.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {[
              { icon: 'terminal', name: 'Next.js / React' },
              { icon: 'palette', name: 'Tailwind CSS' },
              { icon: 'cloud', name: 'AWS Amplify' },
              { icon: 'smart_toy', name: 'AI Agents' },
            ].map((tech) => (
              <div key={tech.name} className="bg-background p-lg rounded-lg flex flex-col items-center justify-center gap-md border border-outline/20 hover:border-secondary/40 transition-all">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">{tech.icon}</span>
                </div>
                <span className="text-label-md font-medium text-on-surface">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-xxl px-margin bg-background">
        <div className="max-w-5xl mx-auto bg-secondary rounded-xl p-xxl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-display font-extrabold text-on-primary mb-lg">Ready to get started?</h2>
            <p className="text-body-lg text-on-primary/80 max-w-2xl mx-auto mb-xl">
              Book a free 15-minute call. We&apos;ll tell you exactly what your business needs — no pitch, just answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-lg justify-center items-center">
              <Link href="/contact" className="bg-on-primary text-secondary px-xxl py-md rounded-lg font-bold text-h3 hover:bg-on-primary/90 transition-all active:scale-95">
                Book a Free Call
              </Link>
              <Link href="/ai-websites" className="border border-on-primary/30 text-on-primary px-xxl py-md rounded-lg font-bold text-h3 hover:bg-on-primary/10 transition-all">
                See Pricing
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-on-primary/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
        </div>
      </section>

      <Footer />
    </main>
  )
}
