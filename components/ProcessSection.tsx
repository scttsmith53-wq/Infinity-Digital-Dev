const steps = [
  {
    phase: '01',
    icon: 'explore',
    title: 'Discovery Call',
    description: 'We learn your business, your goals, and what you need the site to do. Free, no pressure.',
    highlight: false,
  },
  {
    phase: '02',
    icon: 'architecture',
    title: 'We Build It',
    description: 'Custom design, custom code, AI agent configured for your business. Ready in 2–4 weeks.',
    highlight: false,
  },
  {
    phase: '03',
    icon: 'rocket_launch',
    title: 'You Launch & Grow',
    description: 'Go live, start capturing leads, and let the AI handle the first conversation while you sleep.',
    highlight: true,
  },
]

export default function ProcessSection() {
  return (
    <section id="process" className="max-w-7xl mx-auto px-gutter py-xxl">
      <div className="text-center max-w-2xl mx-auto mb-xxl">
        <h2 className="text-h1 font-bold text-gradient mb-md">How It Works</h2>
        <p className="text-on-surface-variant text-body-lg">Three steps from conversation to a live, AI-powered website.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-xl relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-secondary/30 to-transparent z-0" />

        {steps.map((step) => (
          <div key={step.phase} className="relative z-10 flex flex-col items-center text-center space-y-lg group">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center border transition-all duration-500 ${
                step.highlight
                  ? 'bg-secondary text-primary shadow-[0_0_50px_rgba(0,212,255,0.3)] group-hover:scale-110'
                  : 'glass-card text-secondary border-white/10 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.2)] group-hover:border-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-4xl">{step.icon}</span>
            </div>
            <div className="px-md">
              <div className="text-label-sm text-secondary uppercase tracking-[0.2em] mb-xs">Phase {step.phase}</div>
              <h3 className="text-h3 font-bold mb-sm text-on-primary">{step.title}</h3>
              <p className="text-body-md text-on-surface-variant">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
