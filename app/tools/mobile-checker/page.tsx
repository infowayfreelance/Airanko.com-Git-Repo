import type { Metadata } from 'next'
import Navbar from '@/components/navbar'
import MobileCheckerTool from '@/components/mobile-checker/mobile-checker-tool'

export const metadata: Metadata = {
  title: 'Mobile Friendliness Checker – Ai Ranko',
  description:
    'Preview any website in mobile, tablet, or desktop view. Test mobile responsiveness and friendliness of any URL instantly — free.',
  keywords: 'mobile friendliness checker, responsive design tester, mobile preview, website mobile test',
}

export default function MobileCheckerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <MobileCheckerTool />
      </main>
    </div>
  )
}
