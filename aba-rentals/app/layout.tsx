import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rentalhub — Find your next place in Nigeria',
  description: 'A trusted rental marketplace for finding homes, flats, shops, and commercial spaces across all 36 Nigerian states and the FCT.',
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
