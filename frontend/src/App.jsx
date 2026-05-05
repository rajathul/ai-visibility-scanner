import { useState } from 'react'
import { SearchForm } from './components/SearchForm.jsx'
import { LoadingState } from './components/LoadingState.jsx'
import { Results } from './components/Results.jsx'
import { runDiagnostic } from './lib/api.js'
import { AlertCircle } from 'lucide-react'

export default function App() {
  const [state, setState] = useState('idle') // idle | loading | results | error
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (params) => {
    setState('loading')
    setError(null)
    try {
      const result = await runDiagnostic(params)
      setData(result)
      setState('results')
    } catch (e) {
      setError(e.message)
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(110,231,183,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(110,231,183,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orb */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(110,231,183,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold accent-glow"
              style={{ background: 'linear-gradient(135deg, #065f46, #047857)', color: '#6ee7b7' }}
            >
              ◎
            </div>
            <div>
              <span className="font-display font-bold text-text text-sm">AI Visibility</span>
              <span className="font-display text-subtle text-sm"> Scanner</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-subtle hidden sm:block">powered by</span>
            <div className="flex items-center gap-1.5">
              {['ChatGPT', 'Gemini'].map(m => (
                <span key={m} className="font-mono text-xs px-2 py-0.5 rounded border border-border text-subtle bg-surface">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col">
        {state === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="text-center mb-12 px-4 animate-fade-up">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-accent/80 bg-accent-dim border border-accent/20 px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Answer Engine Optimization
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-text mb-4 leading-tight">
                How visible is your brand<br />
                <span className="text-accent">to AI engines?</span>
              </h1>
              <p className="text-subtle text-base max-w-lg mx-auto leading-relaxed">
                Query ChatGPT and Gemini simultaneously.
                See exactly where your brand ranks — and who's beating you.
              </p>
            </div>
            <div className="w-full animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <SearchForm onSubmit={handleSubmit} loading={false} />
            </div>
          </div>
        )}

        {state === 'loading' && <LoadingState />}

        {state === 'results' && data && (
          <Results data={data} onReset={handleReset} />
        )}

        {state === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-up">
            <div className="flex flex-col items-center gap-4 text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-red-900/30 border border-red-800/40">
                <AlertCircle size={28} className="text-danger" />
              </div>
              <h2 className="font-display text-xl font-bold text-text">Diagnostic Failed</h2>
              <p className="text-subtle text-sm font-mono">{error}</p>
              <button
                onClick={handleReset}
                className="mt-2 px-6 py-2.5 rounded-xl border border-border text-sm text-subtle hover:text-accent hover:border-accent/40 transition-all font-mono"
              >
                try again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <span className="font-mono text-xs text-subtle">
            Analysis by Claude Sonnet · Data from live AI engines
          </span>
          <span className="font-mono text-xs text-subtle">
            {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  )
}
