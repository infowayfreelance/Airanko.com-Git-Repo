'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'SEO Tools', href: '/#tools' },
    { label: 'Image Resizer', href: '/tools/image-resizer' },
    { label: 'Mobile Checker', href: '/tools/mobile-checker' },
    { label: 'Bulk Resizer', href: '/tools/bulk-image-resizer' },
    { label: 'Meta Checker', href: '/tools/meta-checker' },
    { label: 'Blog', href: '#' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Ai Ranko home">
          <img
            src="/images/ai-ranko-logo.webp"
            alt="Ai Ranko"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started Free
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="ghost" size="sm" className="justify-start">Sign In</Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started Free
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
