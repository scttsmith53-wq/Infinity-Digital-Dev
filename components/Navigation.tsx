'use client'

import { useState } from 'react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="bg-primary/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="flex justify-between items-center h-20 px-gutter max-w-7xl mx-auto">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Infinity Digital Dev"
            width={180}
            height={48}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-lg">
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

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-on-primary p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface border-t border-white/5 px-gutter py-md space-y-md">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-on-surface-variant hover:text-secondary py-sm transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="block bg-secondary text-primary px-lg py-sm rounded-lg font-bold text-center mt-md"
            onClick={() => setMobileOpen(false)}
          >
            Get a Quote
          </Link>
        </div>
      )}
    </header>
  )
}
