import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = { title: 'About Us | Infinity Digital Dev' }

const principles = [
  { icon: 'code', title: 'Clean Code', desc: 'We treat every line of code as a facility. Our developers write expressive, maintainable, and highly optimized logic designed for long-term scalability.' },
  { icon: 'precision_manufacturing', title: 'Precision Execution', desc: 'From pixel-perfect UIs to sub-100ms AI responses, we focus on the granular details that separate generic software from elite digital products.' },
  { icon: 'visibility', title: 'Radical Transparency', desc: 'No black boxes. We operate with open Jira boards, shared Slack channels, and weekly technical deep-dives so you\'re never in the dark.' },
]

export default function AboutPage() {
  return (
    <main>
      <Navigation />

      {/* Hero */}
      <section className="px-margin py-xxl bg-surface relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="inline-block text-label-sm uppercase tracking-widest text-secondary font-bold mb-lg">
            Precision Engineering
          </span>
          <h1 className="text-display font-extrabold text-on-surface leading-tight mb-lg max-w-3xl">
            Precision-Built Websites.<br />
            <span className="text-secondary">Nationwide.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mb-xl">
            We build AI-powered websites and automation systems with the rigor of a structural engineer and the agility of a startup. Remote-first, client-obsessed, and built to scale with your business.
          </p>
          <div className="flex gap-md">
            <Link href="/#services" className="bg-secondary text-on-primary px-xl py-md rounded-lg font-bold text-label-md hover:bg-secondary/90 transition-all">
              Our Services
            </Link>
            <Link href="/contact" className="border border-outline text-on-surface px-xl py-md rounded-lg font-bold text-label-md hover:bg-background transition-all">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="px-margin py-xxl bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xxl">
            <h2 className="text-h1 font-bold text-on-surface mb-md">The Infinity Principles</h2>
            <p className="text-on-surface-variant text-body-lg">Precision is not an act, but a habit.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {principles.map((p) => (
              <div key={p.title} className="bg-surface p-xl rounded-xl border border-outline/20 hover:border-secondary/40 transition-all">
                <span className="material-symbols-outlined text-secondary text-[40px] mb-md block">{p.icon}</span>
                <h3 className="text-h3 font-bold text-on-surface mb-md">{p.title}</h3>
                <p className="text-body-md text-on-surface-variant">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-xxl items-center">
          <div>
            <h2 className="text-h1 font-bold text-on-surface mb-lg">Remote-First. Results-Focused.</h2>
            <p className="text-body-lg text-on-surface-variant mb-lg">
              We work with businesses across the country — fully remote, fully responsive. You get a dedicated team that builds fast, communicates clearly, and delivers on time.
            </p>
            <p className="text-body-lg text-on-surface-variant mb-xl">
              No bloated agency overhead. No offshore handoffs. Just clean code, real automation, and a partner who picks up the phone.
            </p>
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-secondary">location_on</span>
              <span className="text-label-md font-bold text-on-surface">Based in Denver, CO — Serving Businesses Nationwide</span>
            </div>
          </div>
          <div className="bg-background rounded-xl border border-outline/20 p-xl space-y-lg">
            {[
              { icon: 'people', stat: '50+', label: 'Businesses Served Nationwide' },
              { icon: 'schedule', stat: '2–4 wks', label: 'Average Time to Launch' },
              { icon: 'thumb_up', stat: '100%', label: 'Custom Code, No Templates' },
              { icon: 'support_agent', stat: '24/7', label: 'AI Agents Active' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-lg">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">{item.icon}</span>
                </div>
                <div>
                  <div className="text-h2 font-extrabold text-secondary">{item.stat}</div>
                  <div className="text-label-md text-on-surface-variant">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-h1 font-bold text-on-surface mb-xxl text-center">Who We Are</h2>
          <div className="flex flex-col md:flex-row items-center gap-xxl max-w-4xl mx-auto">
            <div className="shrink-0">
              <div className="relative w-56 h-56">
                <Image
                  src="/images/scott-headshot.jpg"
                  alt="Scott — Founder, Infinity Digital Dev"
                  fill
                  className="object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-3 -right-3 bg-secondary text-on-primary text-label-sm font-bold px-md py-xs rounded-full shadow-lg">
                  Founder & CEO
                </div>
              </div>
            </div>
            <div className="space-y-md text-center md:text-left">
              <h3 className="text-h2 font-bold text-on-surface">Scott</h3>
              <p className="text-body-lg text-on-surface-variant">
                US Army veteran, licensed real estate agent, and NMLS-licensed mortgage professional turned AI automation builder. Scott founded Infinity Digital Dev to bring enterprise-grade digital tools to small and mid-size businesses at a price point that actually makes sense.
              </p>
              <p className="text-body-md text-on-surface-variant">
                Based in Denver, Colorado — working with clients nationwide.
              </p>
              <div className="flex flex-wrap gap-md justify-center md:justify-start pt-sm">
                {['US Army Veteran', 'Licensed Realtor', 'AI Automation Expert', 'NMLS Licensed'].map((tag) => (
                  <span key={tag} className="bg-secondary/10 text-secondary text-label-sm font-bold px-md py-xs rounded-full border border-secondary/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-margin py-xxl bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-xxl">
            <h2 className="text-h1 font-bold text-on-surface mb-md">Our Tech Stack</h2>
            <p className="text-body-md text-on-surface-variant max-w-xl mx-auto">We use industry-leading tools to build robust, future-proof sites.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {[
              { icon: 'terminal', name: 'Next.js / React' },
              { icon: 'palette', name: 'Tailwind CSS' },
              { icon: 'cloud', name: 'AWS / Amplify' },
              { icon: 'integration_instructions', name: 'OpenAI / Claude' },
            ].map((tech) => (
              <div key={tech.name} className="bg-surface p-lg rounded-lg flex flex-col items-center justify-center gap-md border border-outline/20 hover:border-secondary/40 transition-all">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">{tech.icon}</span>
                </div>
                <span className="text-label-md font-medium text-on-surface text-center">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-5xl mx-auto bg-secondary rounded-xl p-xxl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-display font-extrabold text-on-primary mb-lg">Ready to build something great?</h2>
            <p className="text-body-lg text-on-primary/80 max-w-2xl mx-auto mb-xl">
              Schedule a free call with our team. We&apos;ll walk you through exactly what your business needs — no pitch, just answers.
            </p>
            <div className="flex flex-col sm:flex-row gap-lg justify-center">
              <Link href="/contact" className="bg-on-primary text-secondary px-xxl py-md rounded-lg font-bold text-h3 hover:bg-on-primary/90 transition-all">
                Book a Free Call
              </Link>
              <Link href="/#services" className="border border-on-primary/30 text-on-primary px-xxl py-md rounded-lg font-bold text-h3 hover:bg-on-primary/10 transition-all">
                View Services
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-on-primary/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
        </div>
      </section>

      <Footer />
    </main>
  )
}
