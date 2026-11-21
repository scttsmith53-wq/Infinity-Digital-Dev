import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { href: '/#services', label: 'Services' },
  { href: '/ai-websites', label: 'AI Websites' },
  { href: '/crm-automation', label: 'CRM & Automation' },
  { href: '/swag-stores', label: 'Swag Stores' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navigation() {
  return (
    <header className="bg-primary/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 relative">
      <div className="flex justify-between items-center h-20 px-gutter max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Infinity Digital Development"
            width={200}
            height={67}
            className="h-10 w-auto"
            quality={100}
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-lg" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-label-md text-on-surface-variant hover:text-secondary transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/contact"
          className="hidden lg:inline-block bg-secondary text-primary px-lg py-sm rounded-lg font-bold text-label-md hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
        >
          Get a Quote
        </Link>

        <details className="lg:hidden group">
          <summary
            className="list-none cursor-pointer text-on-primary p-2 [&::-webkit-details-marker]:hidden"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined group-open:hidden">menu</span>
            <span className="material-symbols-outlined hidden group-open:inline">close</span>
          </summary>
          <nav
            className="absolute left-0 right-0 top-20 bg-surface border-t border-white/5 px-gutter py-md space-y-md"
            aria-label="Mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-on-surface-variant hover:text-secondary py-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="block bg-secondary text-primary px-lg py-sm rounded-lg font-bold text-center mt-md"
            >
              Get a Quote
            </Link>
          </nav>
        </details>
      </div>
    </header>
  )
}
