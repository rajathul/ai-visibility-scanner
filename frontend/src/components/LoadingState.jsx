const MODEL_STEPS = [
  { id: 'chatgpt', label: 'ChatGPT', color: '#10a37f', icon: '⬡' },
  { id: 'gemini', label: 'Gemini', color: '#4285f4', icon: '◈' },
  { id: 'claude', label: 'Claude (analysis)', color: '#6ee7b7', icon: '◎' },
]

export function LoadingState() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-16 animate-fade-up">
      <div className="text-center mb-12">
        <p className="font-mono text-sm text-subtle mb-2">running diagnostic</p>
        <h2 className="font-display text-2xl font-bold text-text">
          Querying AI engines in parallel...
        </h2>
      </div>

      {/* Pipeline viz */}
      <div className="flex flex-col gap-3 mb-16">
        {MODEL_STEPS.map((step, i) => (
          <div
            key={step.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-surface"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono shrink-0 animate-pulse-slow"
              style={{ background: `${step.color}22`, color: step.color, border: `1px solid ${step.color}44` }}
            >
              {step.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-medium text-sm text-text">{step.label}</span>
                <span className="font-mono text-xs text-subtle">
                  {step.id === 'claude' ? 'analyzing...' : 'searching...'}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full shimmer"
                  style={{
                    width: '100%',
                    background: `linear-gradient(90deg, ${step.color}11 25%, ${step.color}44 50%, ${step.color}11 75%)`,
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0, 1].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5">
            <div className="shimmer h-4 w-20 rounded mb-4" />
            <div className="shimmer h-16 w-16 rounded-full mx-auto mb-4" />
            <div className="shimmer h-3 w-full rounded mb-2" />
            <div className="shimmer h-3 w-4/5 rounded mb-2" />
            <div className="shimmer h-3 w-3/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
