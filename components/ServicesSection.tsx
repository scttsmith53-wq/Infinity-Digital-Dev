import Link from 'next/link'

const services = [
  {
    icon: 'smart_toy',
    title: 'AI-Powered Websites',
    description: 'Custom coded sites with AI chat agents built in. Your site qualifies leads, answers questions, and books appointments — 24/7.',
    href: '/ai-websites',
  },
  {
    icon: 'hub',
    title: 'CRM & Automation',
    description: 'Go High Level setup, lead pipelines, and follow-up sequences that convert leads on autopilot. Never lose a lead again.',
    href: '/crm-automation',
  },
  {
    icon: 'shopping_bag',
    title: 'Employee Swag Stores',
    description: 'A branded online store for your team. Employees browse, order company gear, and it ships straight to their door. No inventory headaches.',
    href: '/swag-stores',
  },
]

export default function ServicesSection() {
  return (
    <section id="services" className="max-w-7xl mx-auto px-gutter py-xxl relative">
      <div className="text-center mb-xxl">
        <h2 className="text-h1 font-bold text-gradient mb-md">Our Core Services</h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto text-body-lg">
          Everything your business needs to grow online — built custom, not templated.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-lg">
        {services.map((service) => (
          <div
            key={service.title}
            className="group glass-card p-xl rounded-3xl hover:border-secondary transition-all relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-lg group-hover:bg-secondary transition-colors duration-300">
              <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-primary">
                {service.icon}
              </span>
            </div>

            <h3 className="text-h3 font-bold text-on-primary mb-md">{service.title}</h3>
            <p className="text-body-md text-on-surface-variant">{service.description}</p>

            <Link
              href={service.href}
              className="mt-lg inline-flex items-center gap-sm text-secondary text-label-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Learn more <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
