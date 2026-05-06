import Link from 'next/link'

export default function CTABanner() {
  return (
    <section className="max-w-7xl mx-auto px-gutter py-xxl">
      <div className="bg-gradient-to-br from-primary to-surface-variant rounded-[2.5rem] p-xxl text-center space-y-lg relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full" />

        <h2 className="text-h1 font-bold text-on-primary relative z-10 max-w-3xl mx-auto text-gradient">
          Ready to build your AI-powered website?
        </h2>
        <p className="text-on-surface-variant relative z-10 max-w-xl mx-auto">
          Starting at $750. Live in 2–4 weeks. Book a free 15-minute call and we&apos;ll tell you exactly what your business needs.
        </p>
        <div className="relative z-10 pt-md">
          <Link
            href="/contact"
            className="inline-block bg-secondary text-primary px-xxl py-md rounded-xl text-h3 font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
          >
            Book a Free Call
          </Link>
        </div>
      </div>
    </section>
  )
}
