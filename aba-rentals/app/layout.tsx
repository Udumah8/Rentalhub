import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AbaRentals — Find your next place in Aba',
  description: 'A premium local rental marketplace for finding trusted homes, flats, and commercial spaces in Aba, Nigeria.',
  themeColor: '#0f766e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
