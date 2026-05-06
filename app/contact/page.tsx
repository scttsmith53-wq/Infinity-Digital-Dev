import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = { title: 'Contact Us | Infinity Digital Dev' }

const faqs = [
  { q: 'How long does a custom AI website take?', a: 'Our standard development cycle is 2–4 weeks, depending on the number of pages and complexity of integrations.' },
  { q: 'Do you offer ongoing maintenance?', a: 'Yes — our $199/month plan includes regular updates, security patches, performance monitoring, and priority support.' },
  { q: 'What is the AI phone agent?', a: "It's an AI that answers your business phone calls, qualifies leads, and books appointments automatically — included in our $299/month plan." },
  { q: 'Do you work with businesses outside Colorado?', a: "Absolutely — we work with businesses nationwide. Everything is handled remotely and we're available by phone, video call, or email." },
  { q: 'Do you require a contract?', a: 'No contracts on monthly plans. Cancel anytime. The $750 site build is a one-time project fee.' },
]

export default function ContactPage() {
  return (
    <main>
      <Navigation />
      <section className="relative pt-xxl pb-xl px-margin max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
        <div className="flex flex-col gap-md">
          <span className="text-secondary font-bold text-label-sm uppercase tracking-widest">Connect With Us</span>
          <h1 className="text-display font-extrabold text-on-surface leading-tight">
            Scale your digital presence with precision engineering.
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            We help businesses nationwide build AI-powered websites and automation systems that work around the clock.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-md">
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">call</span>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Phone</p>
                <a href="tel:7202527037" className="text-body-md font-bold text-on-surface hover:text-secondary transition-colors">720-252-7037</a>
              </div>
            </div>
            <div className="flex items-start gap-md">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant">Location</p>
                <p className="text-body-md font-bold text-on-surface">Pueblo, CO (Remote-Friendly)</p>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-card p-xl rounded-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 blur-[60px]" />
          <div className="flex flex-col gap-lg relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-on-surface-variant">Full Name</label>
                <input className="bg-surface/50 border border-outline/30 rounded-lg p-md text-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="John Doe" type="text" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-label-sm text-on-surface-variant">Email Address</label>
                <input className="bg-surface/50 border border-outline/30 rounded-lg p-md text-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="john@company.com" type="email" />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm text-on-surface-variant">Phone Number</label>
              <input className="bg-surface/50 border border-outline/30 rounded-lg p-md text-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all" placeholder="(720) 555-0000" type="tel" />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm text-on-surface-variant">What do you need?</label>
              <select className="bg-surface/50 border border-outline/30 rounded-lg p-md text-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all">
                <option value="">Select a service...</option>
                <option>AI-Powered Website ($750 setup)</option>
                <option>Site + Maintenance ($750 + $199/mo)</option>
                <option>Site + CRM + AI Phone Agent ($750 + $299/mo)</option>
                <option>Employee Swag Store</option>
                <option>Not sure — just exploring</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-label-sm text-on-surface-variant">Tell us about your business</label>
              <textarea className="bg-surface/50 border border-outline/30 rounded-lg p-md text-on-surface focus:ring-1 focus:ring-secondary focus:border-secondary outline-none transition-all resize-none" placeholder="What does your business do? What's your biggest challenge right now?" rows={4} />
            </div>
            <button className="w-full bg-secondary text-on-primary font-bold py-md rounded-lg hover:bg-secondary/90 active:scale-95 transition-all shadow-lg shadow-secondary/20">
              Send Message
            </button>
          </div>
        </div>
      </section>
      <section className="py-xxl px-margin max-w-4xl mx-auto">
        <h2 className="text-h1 font-bold text-center text-on-surface mb-xl">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-md">
          {faqs.map((faq) => (
            <div key={faq.q} className="border border-outline/20 rounded-xl p-lg bg-surface hover:bg-surface-variant/20 transition-all">
              <div className="flex justify-between items-start gap-md">
                <h3 className="text-h3 font-bold text-on-surface">{faq.q}</h3>
                <span className="material-symbols-outlined text-secondary shrink-0">expand_more</span>
              </div>
              <p className="mt-md text-on-surface-variant text-body-md">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
