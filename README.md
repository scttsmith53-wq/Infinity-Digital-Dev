# Infinity Digital Dev — Next.js Site

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to AWS Amplify

1. Push this folder to a GitHub repo
2. Go to AWS Amplify Console → New App → Host Web App
3. Connect your GitHub repo
4. Amplify auto-detects Next.js — accept the build settings
5. Add custom domain: infinitydigitaldev.com via Route 53

## Folder Structure

```
app/
  layout.tsx        ← fonts, metadata, global styles, JSON-LD
  page.tsx          ← homepage
  robots.ts         ← crawler rules, including AI crawlers, and sitemap
  sitemap.ts        ← XML sitemap
  contact/page.tsx  ← contact form and FAQ
  globals.css       ← glass-card, mesh-gradient, text-gradient utilities
public/
  llms.txt          ← plain-language description for AI answer engines
components/
  Navigation.tsx
  HeroSection.tsx
  TrustedBy.tsx
  ServicesSection.tsx
  WhyInfinity.tsx
  ProcessSection.tsx
  Testimonials.tsx
  CTABanner.tsx
  Footer.tsx
```

## What to update before launch

1. **Logo** — replace the text logo in Navigation.tsx and Footer.tsx with your actual logo image
2. **Phone number** — public number is (970) 601-4017
3. **Contact form** — wire up to Go High Level webhook (replace the button onClick)
4. **Testimonials** — the homepage has a TODO where real client reviews should go. Do not add quotes until they are verified.
5. **Client logos** — the homepage has a TODO where real client logos should go. Do not add placeholder brands.

## Color Palette

| Token | Hex | Use |
|---|---|---|
| `primary` | `#0a1128` | Nav background, dark sections |
| `secondary` | `#00d4ff` | Buttons, accents, icons |
| `background` | `#020617` | Page background |
| `surface` | `#0f172a` | Card backgrounds |
| `on-surface-variant` | `#94a3b8` | Body text |
