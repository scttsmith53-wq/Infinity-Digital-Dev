import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Infinity Digital Dev | AI-Powered Websites & Digital Solutions',
  description: 'Custom coded AI-powered websites, CRM automations, and employee swag stores for small businesses nationwide.',
  openGraph: {
    title: 'Infinity Digital Dev | AI-Powered Websites',
    description: 'Custom coded AI-powered websites, CRM automations, and swag stores for small businesses nationwide.',
    url: 'https://infinitydigitaldev.com',
    siteName: 'Infinity Digital Dev',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/images/favicon-512.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
