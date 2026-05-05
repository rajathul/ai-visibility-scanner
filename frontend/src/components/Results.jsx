import { ArrowLeft, Lightbulb, TrendingUp, Globe } from 'lucide-react'
import { ScoreRing } from './ScoreRing.jsx'
import { ModelCard } from './ModelCard.jsx'

const getOverallVerdict = (score) => {
  if (score >= 70) return { label: 'Strong Visibility', cls: 'verdict-good' }
  if (score >= 40) return { label: 'Partial Visibility', cls: 'verdict-warn' }
  return { label: 'Low Visibility', cls: 'verdict-bad' }
}

export function Results({ data, onReset }) {
  const verdict = getOverallVerdict(data.overall_score)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 animate-fade-up">
      {/* Back */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-subtle hover:text-accent transition-colors font-mono text-sm mb-8 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        new diagnostic
      </button>

      {/* Hero summary */}
      <div className="rounded-2xl border border-border bg-surface p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <ScoreRing score={data.overall_score} size={120} delay={0.1} />
            <span className={`tag ${verdict.cls} mt-1`}>{verdict.label}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="font-mono text-xs text-subtle px-2 py-0.5 rounded border border-border bg-muted">
                brand
              </span>
              <span className="font-display text-xl font-bold text-text">{data.brand_name}</span>
              {data.country && (
                <span className="flex items-center gap-1.5 font-mono text-xs text-subtle px-2 py-1 rounded border border-border bg-muted">
                  <Globe size={11} />
                  {data.country}
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-accent mb-1">query</p>
            <p className="text-subtle text-sm italic mb-4">"{data.query}"</p>
            <p className="text-text text-sm leading-relaxed">{data.summary}</p>
          </div>
        </div>
      </div>

      {/* Model cards */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <TrendingUp size={16} className="text-accent" />
          <h2 className="font-display font-semibold text-text">Per-Engine Breakdown</h2>
          <span className="font-mono text-xs text-subtle ml-auto">2 engines queried in parallel</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.results.map((result, i) => (
            <ModelCard key={result.model} result={result} index={i} brandName={data.brand_name} />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3 mb-5">
          <Lightbulb size={16} className="text-accent" />
          <h2 className="font-display font-semibold text-text">Recommendations</h2>
        </div>
        <div className="flex flex-col gap-3">
          {data.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-xl border border-border bg-bg hover:border-accent/20 transition-colors"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span
                className="font-display font-bold text-2xl shrink-0 leading-none mt-0.5"
                style={{ color: `rgba(110,231,183,${0.4 + i * 0.2})` }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="text-sm text-text leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
