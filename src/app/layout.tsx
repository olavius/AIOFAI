import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CFO Intelligence Platform · Ascando Partners',
  description: 'AI-powered financial intelligence for CFOs and finance executives',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-ink text-cream antialiased">
        {children}
      </body>
    </html>
  )
}
