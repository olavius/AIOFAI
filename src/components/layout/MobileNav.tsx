'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Menu, X, FileSpreadsheet, Lightbulb, Zap, BarChart3, MessageSquare, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/excel-intake', icon: FileSpreadsheet, label: 'Excel Intake' },
  { href: '/strategy', icon: Lightbulb, label: 'Strategy' },
  { href: '/automate', icon: Zap, label: 'Automate' },
  { href: '/powerbi', icon: BarChart3, label: 'Power BI' },
  { href: '/sandbox', icon: MessageSquare, label: 'Sandbox' },
  { href: '/wizard', icon: Wand2, label: 'Metric Wizard' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile header bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface border-b border-panel flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <span className="text-gold text-lg font-bold">◈</span>
          <span className="text-cream font-semibold text-sm">CFO Intelligence</span>
        </div>
        <div className="flex items-center gap-3">
          <UserButton />
          <button
            onClick={() => setOpen(!open)}
            className="text-cream/70 hover:text-cream p-1.5 rounded-lg hover:bg-panel transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-ink/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-surface border-b border-panel p-3 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    active ? 'bg-forest border border-forestMid text-cream' : 'text-cream/60 hover:text-cream hover:bg-panel',
                  )}
                >
                  <Icon size={17} className={active ? 'text-forestBright' : 'text-cream/40'} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
