import type { Metadata } from 'next'
import SynthidFrame from './synthid-frame'
import ImageAnalysisLab from '@/components/synthid-image-analysis'

export const metadata: Metadata = {
  title: 'SynthID Image Lab — Experimental Image Processing | Ai Ranko',
  description: 'Run private pixel-signal experiments on PNG, JPG and WebP images. Keep the same resolution, compare visual quality, and verify SynthID status independently.',
  alternates: { canonical: 'https://airanko.com/tools/synthid-remover' },
  openGraph: {
    title: 'SynthID Image Lab — Ai Ranko',
    description: 'Experimental pixel-signal processing for images. Batch processing, browser privacy, and before/after comparison. No guaranteed SynthID removal.',
    url: 'https://airanko.com/tools/synthid-remover',
    siteName: 'Ai Ranko',
    type: 'website',
    images: [{ url: 'https://airanko.com/ai-ranko-og.webp', width: 1200, height: 630 }],
  },
  robots: { index: false, follow: true },
}

export default function SynthidImageLabPage() {
  return (
    <main style={{ margin: 0, background: '#081126' }}>
      <h1 className="sr-only">SynthID Image Lab — Experimental image signal processing</h1>
      <SynthidFrame />
      <ImageAnalysisLab />
      <noscript>This image processing tool requires JavaScript to work.</noscript>
    </main>
  )
}
