'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  FileSpreadsheet,
  Lightbulb,
  Zap,
  BarChart3,
  MessageSquare,
  Wand2,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/excel-intake',
    icon: FileSpreadsheet,
    label: 'Excel Intake',
    description: 'Analyze spreadsheets',
  },
  {
    href: '/strategy',
    icon: Lightbulb,
    label: 'Strategy',
    description: 'CFO AI roadmap',
  },
  {
    href: '/automate',
    icon: Zap,
    label: 'Automate',
    description: 'Automation blueprints',
  },
  {
    href: '/powerbi',
    icon: BarChart3,
    label: 'Power BI',
    description: 'DAX & star schema',
  },
  {
    href: '/sandbox',
    icon: MessageSquare,
    label: 'Sandbox',
    description: 'AI chat session',
  },
  {
    href: '/wizard',
    icon: Wand2,
    label: 'Metric Wizard',
    description: 'KPI specification',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-panel flex flex-col shrink-0">
      {/* Logo / Header */}
      <div className="p-5 border-b border-panel">
        <div className="flex items-center gap-2.5">
          <span className="text-gold text-xl font-bold leading-none">◈</span>
          <div>
            <p className="text-cream font-semibold text-sm leading-tight">CFO Intelligence</p>
            <p className="text-cream/40 text-xs leading-tight">Ascando Partners</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-cream/30 text-xs font-medium uppercase tracking-wider px-3 py-2 mt-1">
          Modules
        </p>
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm',
                active
                  ? 'bg-forest border border-forestMid text-cream'
                  : 'text-cream/60 hover:text-cream hover:bg-panel',
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'shrink-0 transition-colors',
                  active ? 'text-forestBright' : 'text-cream/40 group-hover:text-forestBright',
                )}
              />
              <div className="flex-1 min-w-0">
                <p className={cn('font-medium leading-tight', active ? 'text-cream' : '')}>{item.label}</p>
                <p className="text-cream/40 text-xs leading-tight mt-0.5 truncate">{item.description}</p>
              </div>
              {active && <ChevronRight size={14} className="text-forestBright shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-panel">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              variables: { colorBackground: '#1C2331', colorText: '#FBFAF6' },
            }}
          />
          <div className="min-w-0">
            <p className="text-cream/80 text-xs font-medium truncate">Account</p>
            <p className="text-cream/40 text-xs">Ascando Partners</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
