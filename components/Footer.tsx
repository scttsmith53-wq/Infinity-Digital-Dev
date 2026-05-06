import Link from 'next/link'
import Image from 'next/image'

const capabilities = ['AI Websites', 'CRM Automation', 'Swag Stores', 'Web Development', 'SEO & Maintenance']
const company = [
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-white/5">
      <div className="max-w-7xl mx-auto px-gutter py-xxl grid md:grid-cols-4 gap-xl">
        {/* Brand */}
        <div className="md:col-span-1 space-y-lg">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="Infinity Digital Dev"
              width={180}
              height={48}
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
          <p className="text-body-md text-on-surface-variant pr-8">
            Custom coded AI-powered websites for businesses nationwide. Built for performance, designed to grow.
          </p>
          <div className="flex flex-col gap-sm pt-md">
            <a href="tel:7202527037" className="flex items-center gap-sm text-label-md font-bold text-on-primary hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-secondary">phone</span>
              720-252-7037
            </a>
            <div className="flex items-center gap-sm text-label-md font-bold text-on-primary">
              <span className="material-symbols-outlined text-secondary">location_on</span>
              Denver, CO
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-sm">
          <h4 className="text-label-sm uppercase tracking-widest text-secondary mb-lg">Services</h4>
          <nav className="flex flex-col gap-md">
            {capabilities.map((c) => (
              <Link key={c} href="/#services" className="text-body-md text-on-surface-variant hover:text-on-primary transition-colors">
                {c}
              </Link>
            ))}
          </nav>
        </div>

        {/* Company */}
        <div className="space-y-sm">
          <h4 className="text-label-sm uppercase tracking-widest text-secondary mb-lg">Company</h4>
          <nav className="flex flex-col gap-md">
            {company.map((c) => (
              <Link key={c.label} href={c.href} className="text-body-md text-on-surface-variant hover:text-on-primary transition-colors">
                {c.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Connect */}
        <div className="space-y-sm">
          <h4 className="text-label-sm uppercase tracking-widest text-secondary mb-lg">Connect</h4>
          <div className="flex gap-lg">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-secondary hover:text-primary transition-all">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-gutter py-md border-t border-white/5 text-center">
        <p className="text-body-md text-on-surface-variant text-sm opacity-50">
          © {new Date().getFullYear()} Infinity Digital Dev. Built for businesses nationwide.
        </p>
      </div>
    </footer>
  )
}
