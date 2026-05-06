const testimonials = [
  {
    initials: 'SJ',
    name: 'Sarah J.',
    company: 'Tech Solutions Inc.',
    quote: 'Infinity transformed our lead gen. The AI chat agent qualifies clients before I even wake up. It\'s like adding a 24/7 sales team at a fraction of the cost.',
  },
  {
    initials: 'MR',
    name: 'Mark R.',
    company: 'MileHigh Logistics',
    quote: 'The swag store was up in less than a week. Our employees love ordering their own gear and we\'ve completely eliminated the logistics headache.',
  },
  {
    initials: 'ET',
    name: 'Elena T.',
    company: 'Peak Design Co.',
    quote: 'Cleanest code we\'ve ever seen. Fast, reliable, and the CRM automation saved us 10 hours a week from the first month.',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-surface py-xxl relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-gutter relative z-10">
        <div className="text-center mb-xxl">
          <h2 className="text-h1 font-bold text-gradient mb-md">What Our Clients Say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-lg">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-xl rounded-3xl border border-white/5 shadow-xl">
              <div className="flex text-secondary mb-md">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined fill-1">star</span>
                ))}
              </div>
              <p className="text-body-md text-on-surface mb-lg italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="text-label-md font-bold text-on-primary">{t.name}</div>
                  <div className="text-label-sm text-on-surface-variant">{t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
