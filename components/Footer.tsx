import Link from 'next/link'
import Image from 'next/image'
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/site'

const capabilities = ['AI Websites', 'CRM Automation', 'Swag Stores', 'Web Development', 'SEO & Maintenance']
const company = [
  { label: 'About Us', href: '/about' },
  { label: 'Services', href: '/#services' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-white/5">
      <div className="max-w-7xl mx-auto px-gutter py-xxl grid md:grid-cols-3 gap-xl">
        <div className="md:col-span-1 space-y-lg">
          <Link href="/" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="Infinity Digital Development"
              width={180}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-body-md text-on-surface-variant pr-8">
            Infinity Digital Development builds custom-coded AI-powered websites for small businesses. Based in Denver, Colorado, serving the United States.
          </p>
          <div className="flex flex-col gap-sm pt-md">
            <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-sm text-label-md font-bold text-on-primary hover:text-secondary transition-colors">
              <span className="material-symbols-outlined text-secondary">phone</span>
              {PHONE_DISPLAY}
            </a>
            <div className="flex items-center gap-sm text-label-md font-bold text-on-primary">
              <span className="material-symbols-outlined text-secondary">location_on</span>
              Denver, Colorado
            </div>
          </div>
        </div>

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

        <div className="space-y-sm">
          <h4 className="text-label-sm uppercase tracking-widest text-secondary mb-lg">Company</h4>
          <nav className="flex flex-col gap-md">
            {company.map((c) => (
              <Link key={c.label} href={c.href} className="text-body-md text-on-surface-variant hover:text-on-primary transition-colors">
                {c.label}
              </Link>
            ))}
          </nav>
          {/* TODO: Add real LinkedIn and X (Twitter) profile URLs once Scott provides them. Do not link to the linkedin.com or twitter.com homepages. */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-gutter py-md border-t border-white/5 text-center">
        <p className="text-body-md text-on-surface-variant text-sm opacity-50">
          © {new Date().getFullYear()} Infinity Digital Development. Denver, Colorado.
        </p>
      </div>
    </footer>
  )
}
