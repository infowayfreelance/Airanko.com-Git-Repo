import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { CookieConsentProvider } from '@/components/cookie-consent/cookie-consent-provider'
import { CookieConsentBanner } from '@/components/cookie-consent/cookie-consent-banner'
import { CookiePreferencesDialog } from '@/components/cookie-consent/cookie-preferences-dialog'
import { AnalyticsGate } from '@/components/cookie-consent/analytics-gate'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' })

export const metadata: Metadata = {
  title: 'Ai Ranko – AI-Powered SEO & Image Tools',
  description: 'Ai Ranko offers powerful AI-driven SEO tools and image utilities. Resize, crop, convert images and boost your site rankings.',
  keywords: 'AI SEO tools, image resizer, image converter, webp converter, crop image, SEO analyzer',
  verification: {
    google: 'J5o5mKfRWfAJK1p9IvClN-usXyPAlXElWaRVcRoDucM',
  },
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
    siteName: 'Ai Ranko',
    images: [
      {
        url: '/ai-ranko-og.webp',
        width: 1200,
        height: 630,
        alt: 'Ai Ranko – AI-Powered SEO Intelligence. Analyze. Optimize. Rank.',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ai Ranko – AI-Powered SEO & Image Tools',
    description: 'Free AI-powered SEO and image tools for marketers, developers, and creators.',
    images: ['/ai-ranko-og.webp'],
  },
}

const globalJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://airanko.com/#organization',
      name: 'Ai Ranko',
      url: 'https://airanko.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://airanko.com/images/ai-ranko-logo.webp',
      },
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@airanko.com',
        availableLanguage: 'English',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://airanko.com/#website',
      url: 'https://airanko.com',
      name: 'Ai Ranko',
      description: 'Free AI-powered SEO and image tools for marketers, developers, and creators.',
      publisher: { '@id': 'https://airanko.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://airanko.com/tools/{search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} bg-background`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(globalJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <CookieConsentProvider>
          {children}
          <CookieConsentBanner />
          <CookiePreferencesDialog />
          {process.env.NODE_ENV === 'production' && <AnalyticsGate />}
        </CookieConsentProvider>
      </body>
    </html>
  )
}
