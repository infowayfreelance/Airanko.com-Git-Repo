import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'Ai Ranko – AI-Powered SEO & Image Tools',
  description: 'Ai Ranko offers powerful AI-driven SEO tools and image utilities. Resize, crop, convert images and boost your site rankings.',
  keywords: 'AI SEO tools, image resizer, image converter, webp converter, crop image, SEO analyzer',
  generator: 'Ai Ranko',
  icons: {
    icon: [{ url: '/ai-ranko-icon.webp', type: 'image/webp' }],
    shortcut: ['/ai-ranko-icon.webp'],
    apple: [{ url: '/ai-ranko-icon.webp', type: 'image/webp' }],
  },
  openGraph: {
    title: 'Ai Ranko – AI-Powered SEO & Image Tools',
    description: 'Free AI-powered SEO and image tools for marketers, developers, and creators.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
