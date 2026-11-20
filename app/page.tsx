import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import ServicesSection from '@/components/ServicesSection'
import WhyInfinity from '@/components/WhyInfinity'
import ProcessSection from '@/components/ProcessSection'
import CTABanner from '@/components/CTABanner'
import Footer from '@/components/Footer'
import { homeMetadata } from '@/lib/site'

export const metadata = homeMetadata

export default function Home() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      {/* TODO: Add real client logos here once Scott provides verified names and permission to publish. Do not use placeholder brands. */}
      <ServicesSection />
      <WhyInfinity />
      <ProcessSection />
      {/* TODO: Add real client testimonials here once Scott provides verified quotes, full names, and permission to publish. Do not use fabricated reviews. */}
      <CTABanner />
      <Footer />
    </main>
  )
}
