'use client'

import Link from 'next/link'

const shopCategories = [
  { title: 'Home essentials', description: 'Furniture, appliances, and everyday items for your new space.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
  { title: 'Moving services', description: 'Find trusted movers, cleaners, and setup services near you.', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=900&q=80' },
  { title: 'Property services', description: 'Repairs, renovations, security, and professional maintenance.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
]

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.06em] text-foreground">Rental<span className="text-primary">hub</span></Link>
          <Link href="/" className="btn-outline">Browse rentals</Link>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <p className="eyebrow text-sm font-bold uppercase tracking-[0.24em] text-primary">Coming to Rentalhub</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.06em] sm:text-7xl">Settle in, not just move in.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Shop useful products and services that make renting, moving, and managing your place across Nigeria easier.</p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-20 sm:grid-cols-3 sm:px-6 lg:px-8">
        {shopCategories.map(category => <article key={category.title} className="card overflow-hidden transition duration-300 hover:-translate-y-2 hover:shadow-2xl"><img src={category.image} alt="" className="h-56 w-full object-cover" /><div className="p-6"><h2 className="text-xl font-bold">{category.title}</h2><p className="mt-2 leading-7 text-muted-foreground">{category.description}</p><button className="btn-secondary mt-6" type="button">Notify me</button></div></article>)}
      </section>
    </main>
  )
}
