interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Analyzing with Claude AI…' }: LoadingStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-12 h-12 spinner" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gold text-base font-bold">◈</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-cream/80 font-medium">{message}</p>
        <p className="text-cream/40 text-sm mt-1">This may take a few moments</p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-forestBright"
            style={{ animationDelay: `${i * 0.2}s`, animation: 'pulse 1.4s ease-in-out infinite' }}
          />
        ))}
      </div>
    </div>
  )
}
