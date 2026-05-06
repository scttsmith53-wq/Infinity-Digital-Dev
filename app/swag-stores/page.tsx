import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata = { title: 'Employee Swag Stores | Infinity Digital Dev' }

const catalogItems: { name: string; desc: string; img?: string; icon?: string }[] = [
  { img: '/images/swag-hoodie.png', name: 'Apparel', desc: 'T-shirts, polos, hoodies' },
  { img: '/images/swag-hat.png', name: 'Headwear', desc: 'Hats, beanies, visors' },
  { img: '/images/swag-bottle.png', name: 'Drinkware', desc: 'Mugs, tumblers, bottles' },
  { img: '/images/swag-golf.png', name: 'Accessories', desc: 'Golf balls, pens, keychains' },
  { icon: 'shopping_bag', name: 'Bags & Totes', desc: 'Eco-friendly bags' },
  { icon: 'inventory_2', name: 'Event Kits', desc: 'Tradeshows & onboarding packs' },
]

export default function SwagStoresPage() {
  return (
    <main>
      <Navigation />

      {/* Hero */}
      <section className="px-margin py-xxl bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-xxl">
          <div className="flex-1 space-y-lg">
            <h1 className="text-display font-extrabold text-on-surface leading-tight">
              Give Your Team a Branded Swag Store — We Build It, They Shop It.
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl">
              We set up a custom online store stocked with your logo on premium items. Employees order what they want, when they want it. Bulk orders available anytime for events and new hires.
            </p>
            <div className="flex flex-wrap gap-md pt-md">
              <Link href="/contact" className="bg-secondary text-on-primary px-xl py-md rounded-lg font-bold text-label-md hover:bg-secondary/90 transition-all">
                Get Your Store Built
              </Link>
              <Link href="#catalog" className="border border-outline text-on-surface px-xl py-md rounded-lg font-bold text-label-md hover:bg-surface transition-all">
                See What&apos;s Available
              </Link>
            </div>
          </div>

          {/* Product grid with real images */}
          <div className="flex-1 w-full">
            <div className="bg-surface p-xl rounded-xl border border-outline/20 shadow-sm">
              <div className="grid grid-cols-2 gap-md">
                {[
                  { src: '/images/swag-hoodie.png', name: 'Premium Hoodie', price: 'From $45' },
                  { src: '/images/swag-hat.png', name: 'Branded Cap', price: 'From $22' },
                  { src: '/images/swag-bottle.png', name: 'Insulated Bottle', price: 'From $28' },
                  { src: '/images/swag-golf.png', name: 'Logo Golf Balls', price: 'From $18' },
                ].map((item) => (
                  <div key={item.name} className="bg-background p-md rounded-lg border border-outline/20 flex flex-col items-center gap-sm">
                    <div className="w-full aspect-square relative rounded-lg overflow-hidden">
                      <Image
                        src={item.src}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-label-md font-medium text-on-surface">{item.name}</p>
                      <p className="text-label-sm text-secondary font-bold">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-h1 font-bold text-on-surface mb-xxl text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
            {[
              { n: '1', title: 'You send us your logo and pick your products', desc: 'Choose from our catalog of 50+ quality items. We add your branding.' },
              { n: '2', title: 'We build and launch your store', desc: 'Your custom store is live in under a week. Share the link with your team.' },
              { n: '3', title: 'Employees shop, orders ship direct', desc: 'Team members browse, buy, and get items shipped straight to their door. Bulk orders available anytime.' },
            ].map((step) => (
              <div key={step.n} className="flex flex-col gap-md">
                <div className="w-12 h-12 bg-secondary text-on-primary rounded-full flex items-center justify-center font-bold text-h3">
                  {step.n}
                </div>
                <h3 className="text-h3 font-bold text-on-surface">{step.title}</h3>
                <p className="text-body-md text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="px-margin py-xxl bg-background">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-h1 font-bold text-on-surface mb-xxl text-center">What&apos;s in the Catalog</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-lg">
            {catalogItems.map((item) => (
              <div key={item.name} className="bg-surface p-xl rounded-xl border border-outline/20 flex flex-col items-center text-center gap-md hover:border-secondary/40 transition-all">
                {'img' in item ? (
                  <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                    <Image src={item.img} alt={item.name} fill className="object-cover" />
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-secondary text-[40px]">{item.icon}</span>
                )}
                <h4 className="text-h3 font-bold text-on-surface">{item.name}</h4>
                <p className="text-label-md text-on-surface-variant">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-h1 font-bold text-on-surface mb-xl text-center">Two Ways to Use It</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div className="p-xl bg-background rounded-xl border-l-4 border-secondary shadow-sm space-y-md">
              <h3 className="text-h2 font-bold text-on-surface">For Everyday Team Swag</h3>
              <p className="text-body-md text-on-surface-variant">
                Employees browse and buy on their own. Great for remote teams, company culture, and team pride. No minimums required.
              </p>
            </div>
            <div className="p-xl bg-background rounded-xl border-l-4 border-secondary shadow-sm space-y-md">
              <h3 className="text-h2 font-bold text-on-surface">For Events & Bulk Orders</h3>
              <p className="text-body-md text-on-surface-variant">
                Place a single order for a tradeshow, company retreat, or new hire onboarding kit. We handle the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why it's worth it */}
      <section className="px-margin py-xxl bg-background border-y border-outline/10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-h1 font-bold text-on-surface mb-xl text-center">Why It&apos;s Worth It</h2>
          <div className="space-y-lg">
            {[
              { title: 'No inventory headaches', desc: 'Print-on-demand means no boxes in your garage. Orders are fulfilled automatically.' },
              { title: 'Your brand, done right', desc: 'Every item has your logo and your colors. We handle the branding setup.' },
              { title: 'Live in under a week', desc: 'We do all the setup. You just share the link with your team.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-lg items-start">
                <span className="material-symbols-outlined text-secondary pt-1">verified</span>
                <div>
                  <h4 className="font-bold text-body-lg text-on-surface">{item.title}</h4>
                  <p className="text-on-surface-variant text-body-md">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-margin py-xxl bg-surface">
        <div className="max-w-5xl mx-auto text-center space-y-xl">
          <h2 className="text-display font-extrabold text-on-surface leading-tight">
            Every site we build includes the option to add a swag store.
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Add it to any project — or set one up for your existing business. Setup takes less than a week.
          </p>
          <Link href="/contact" className="inline-block bg-secondary text-on-primary px-xxl py-md rounded-lg font-bold text-h3 hover:bg-secondary/90 transition-all">
            Add a Swag Store to My Project
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
