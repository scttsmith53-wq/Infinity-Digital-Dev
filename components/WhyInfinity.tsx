const stats = [
  { value: '100%', label: 'Custom Code', sub: 'Zero bloat. Maximum performance.' },
  { value: 'AI', label: 'Native', sub: 'Intelligence baked in from day one.', highlight: true },
  { value: 'US', label: 'Nationwide', sub: 'Remote-first. We work anywhere.' },
  { value: '24/7', label: 'Uptime', sub: 'Systems that never sleep.' },
]

export default function WhyInfinity() {
  return (
    <section className="max-w-7xl mx-auto px-gutter py-xxl relative overflow-hidden">
      <div className="absolute -left-40 top-0 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="grid lg:grid-cols-2 gap-xl items-center">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-md">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`p-lg rounded-2xl ${
                stat.highlight
                  ? 'bg-secondary shadow-xl shadow-secondary/10'
                  : 'glass-card border-l-4 border-l-secondary'
              }`}
            >
              <div className={`text-h1 font-extrabold mb-xs ${stat.highlight ? 'text-primary' : 'text-secondary'}`}>
                {stat.value}
              </div>
              <div className={`text-h3 font-bold mb-xs ${stat.highlight ? 'text-primary' : 'text-on-primary'}`}>
                {stat.label}
              </div>
              <p className={`text-sm ${stat.highlight ? 'text-primary/80' : 'text-on-surface-variant'}`}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Text side */}
        <div className="space-y-lg">
          <h2 className="text-h1 font-bold text-gradient leading-tight">
            Built for scale, engineered for speed.
          </h2>
          <p className="text-body-lg text-on-surface-variant">
            We don&apos;t just build websites — we build digital infrastructure that supports your business from launch to scale. Every site ships with performance, security, and AI built in from day one.
          </p>
          <ul className="space-y-sm">
            {['2–4 week delivery', 'No WordPress, no templates', 'AI chat agent included', '$750 to get started'].map((item) => (
              <li key={item} className="flex items-center gap-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
