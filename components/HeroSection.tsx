import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden mesh-gradient">
      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full animate-glow" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/40 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-4s' }} />

      <div className="max-w-7xl mx-auto px-gutter py-xxl grid lg:grid-cols-2 gap-xl items-center relative z-10">
        <div className="space-y-lg text-center lg:text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-sm bg-white/5 border border-white/10 text-secondary px-md py-xs rounded-full text-label-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            Precision Digital Engineering
          </div>

          {/* Headline */}
          <h1 className="text-display font-extrabold leading-[1.1] text-gradient">
            We Build Websites That Work While You Sleep
          </h1>

          {/* Subheadline */}
          <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0">
            AI-powered websites, CRM automations, and branded swag stores for small businesses ready to grow.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-md pt-md">
            <Link
              href="/contact"
              className="bg-secondary text-primary px-xl py-md rounded-xl font-bold text-label-md hover:scale-105 transition-transform shadow-lg shadow-secondary/20"
            >
              Start Your Project
            </Link>
            <Link
              href="/#services"
              className="glass-card text-on-primary px-xl py-md rounded-xl text-label-md hover:bg-white/10 transition-all border border-white/20"
            >
              View Services
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative lg:h-[500px] flex items-center justify-center">
          <div className="relative w-full max-w-lg animate-float">
            <div className="absolute inset-0 bg-secondary/20 blur-[80px] rounded-full" />
            <Image
              src="/images/hero-mockup.png"
              alt="AI-powered website mockup"
              width={1456}
              height={816}
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
