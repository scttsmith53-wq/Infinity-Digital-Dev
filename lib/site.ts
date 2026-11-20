import type { Metadata } from 'next'

export const SITE_URL = 'https://infinitydigitaldev.com'
export const SITE_NAME = 'Infinity Digital Development'
export const PHONE_DISPLAY = '(970) 601-4017'
export const PHONE_TEL = '+19706014017'
export const PHONE_SCHEMA = '+1-970-601-4017'

export const OG_IMAGE_PATH = '/images/og-image.png'
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`
export const OG_IMAGE_ALT =
  'Infinity Digital Development — AI-powered websites from Denver, Colorado'

export const SISTER_DOMAINS = [
  'https://infinitydigitalhq.com',
  'https://infinitydigitaldevelopment.com',
  'https://sentinelhunter.co',
] as const

const AI_CRAWLERS = [
  'GPTBot',
  'ClaudeBot',
  'PerplexityBot',
  'Google-Extended',
  'OAI-SearchBot',
] as const

export const AI_CRAWLER_USER_AGENTS = AI_CRAWLERS

type PageMetaInput = {
  title: string
  description: string
  /** Path beginning with `/`, or `/` for the homepage. */
  path: string
}

export function absoluteUrl(path: string): string {
  if (path === '/') return SITE_URL
  return `${SITE_URL}${path}`
}

export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const url = absoluteUrl(path)

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE_URL],
    },
  }
}

export const homeMetadata = pageMetadata({
  title: 'AI Websites in Denver | Infinity Digital Development',
  description:
    "Scott Smith's Denver agency, Infinity Digital Development, builds custom AI websites, CRM automation, and swag stores for US small businesses.",
  path: '/',
})

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['ProfessionalService', 'Organization'],
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ['Infinity Digital Dev', 'IDD'],
      url: absoluteUrl('/'),
      logo: `${SITE_URL}/images/logo.png`,
      image: OG_IMAGE_URL,
      description:
        'Infinity Digital Development is a Denver, Colorado agency founded by Scott Smith. It builds custom-coded AI-powered websites, CRM automations, and employee swag stores for small businesses across the United States.',
      telephone: PHONE_SCHEMA,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Denver',
        addressRegion: 'CO',
        addressCountry: 'US',
      },
      areaServed: {
        '@type': 'Country',
        name: 'United States',
        identifier: 'US',
      },
      founder: {
        '@type': 'Person',
        '@id': `${SITE_URL}/#scott-smith`,
        name: 'Scott Smith',
        jobTitle: 'Founder',
        workLocation: {
          '@type': 'Place',
          name: 'Denver, Colorado',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Denver',
            addressRegion: 'CO',
            addressCountry: 'US',
          },
        },
      },
      sameAs: [...SISTER_DOMAINS],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: PHONE_SCHEMA,
        contactType: 'customer service',
        areaServed: 'US',
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: absoluteUrl('/'),
      name: SITE_NAME,
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}
