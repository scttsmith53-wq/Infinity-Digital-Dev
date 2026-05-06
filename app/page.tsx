import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import TrustedBy from '@/components/TrustedBy'
import ServicesSection from '@/components/ServicesSection'
import WhyInfinity from '@/components/WhyInfinity'
import ProcessSection from '@/components/ProcessSection'
import Testimonials from '@/components/Testimonials'
import CTABanner from '@/components/CTABanner'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      <TrustedBy />
      <ServicesSection />
      <WhyInfinity />
      <ProcessSection />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  )
}
