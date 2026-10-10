'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const shopCategories = [
  { title: 'Home essentials', description: 'Furniture, appliances, and everyday items for your new space.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
  { title: 'Moving services', description: 'Find trusted movers, cleaners, and setup services near you.', image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=900&q=80' },
  { title: 'Property services', description: 'Repairs, renovations, security, and professional maintenance.', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
]

export default function ShopPage() {
  return (
    <motion.main
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.header
        className="border-b border-border bg-background/90 backdrop-blur-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-[-0.06em] text-foreground">Rental<span className="text-primary">hub</span></Link>
          <motion.a
            href="/"
            className="btn-outline"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Browse rentals
          </motion.a>
        </div>
      </motion.header>

      <motion.section
        className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
      >
        <motion.p
          className="eyebrow text-sm font-bold uppercase tracking-[0.24em] text-primary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 30 }}
        >
          Coming to Rentalhub
        </motion.p>
        <motion.h1
          className="mt-4 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.06em] sm:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Settle in, not just move in.
        </motion.h1>
        <motion.p
          className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Shop useful products and services that make renting, moving, and managing your place across Nigeria easier.
        </motion.p>
      </motion.section>

      <motion.section
        className="mx-auto grid max-w-7xl gap-5 px-4 pb-20 sm:grid-cols-3 sm:px-6 lg:px-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.3
            }
          }
        }}
      >
        {shopCategories.map((category, index) => (
          <motion.article
            key={category.title}
            className="card overflow-hidden"
            whileHover={{ y: -8, boxShadow: '0 24px 60px hsl(var(--foreground) / 0.16)' }}
            variants={{
              visible: { opacity: 1, y: 0 },
              hidden: { opacity: 0, y: 30 }
            }}
          >
            <motion.div
              className="relative h-56 w-full overflow-hidden"
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <motion.img
                src={category.image}
                alt={`${category.title} for Rentalhub renters`}
                className="object-cover w-full h-full transition-transform duration-500"
                whileHover={{ scale: 1.1 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.div
              className="p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h2
                className="text-xl font-bold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {category.title}
              </motion.h2>
              <motion.p
                className="mt-2 leading-7 text-muted-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {category.description}
              </motion.p>
              <motion.a
                className="btn-secondary mt-6 inline-block"
                href="mailto:hello@rentalhub.ng?subject=Rentalhub shop interest"
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px hsl(var(--secondary) / 0.3)' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Notify me
              </motion.a>
            </motion.div>
          </motion.article>
        ))}
      </motion.section>
    </motion.main>
  )
}