import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center p-4">
      <div className="text-center">
        <span className="text-gold text-3xl font-bold">◈</span>
        <h1 className="text-5xl font-bold text-cream mt-4">404</h1>
        <p className="text-cream/60 mt-2 mb-6">Page not found</p>
        <Link
          href="/excel-intake"
          className="inline-flex items-center gap-2 bg-forestBright hover:bg-forestMid text-cream font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
