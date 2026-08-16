import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'CheckIn',
  description: 'A calm, private daily check-in to help track and gradually reduce drinking — built for one family.',
}

import { ClientLayout } from './ClientLayout'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh flex flex-col bg-[#0F1623] text-slate-200">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
