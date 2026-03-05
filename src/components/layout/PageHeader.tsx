import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description: string
  badge?: string
}

export function PageHeader({ icon: Icon, title, description, badge }: PageHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-8">
      <div className="w-11 h-11 rounded-xl bg-forest border border-forestMid flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={20} className="text-forestBright" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-semibold text-cream">{title}</h1>
          {badge && (
            <span className="tag">{badge}</span>
          )}
        </div>
        <p className="text-cream/60 text-sm mt-0.5">{description}</p>
      </div>
    </div>
  )
}
