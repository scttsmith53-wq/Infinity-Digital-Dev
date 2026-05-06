export default function TrustedBy() {
  const clients = [
    { icon: 'architecture', name: 'BuildCo' },
    { icon: 'restaurant', name: 'MileHigh Eats' },
    { icon: 'medical_services', name: 'PeakCare' },
    { icon: 'local_shipping', name: 'LogiRoute' },
  ]

  return (
    <section className="bg-primary py-xl border-y border-white/5">
      <div className="max-w-7xl mx-auto px-gutter">
        <p className="text-label-sm text-on-surface-variant uppercase tracking-[0.3em] text-center mb-xl">
          Trusted by Businesses Nationwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-xxl opacity-40 hover:opacity-100 transition-opacity duration-700">
          {clients.map((c) => (
            <div key={c.name} className="flex items-center gap-xs grayscale invert">
              <span className="material-symbols-outlined text-h1">{c.icon}</span>
              <span className="text-h3 font-bold">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
