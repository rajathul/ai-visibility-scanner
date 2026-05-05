import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Eye, EyeOff, Trophy } from 'lucide-react'
import { ScoreRing } from './ScoreRing.jsx'

const MODEL_META = {
  chatgpt: { color: '#10a37f', bg: '#10a37f14', border: '#10a37f33', icon: '⬡', tag: 'ChatGPT + Web' },
  gemini: { color: '#4285f4', bg: '#4285f414', border: '#4285f433', icon: '◈', tag: 'Gemini + Google' },
}

const SENTIMENT_STYLE = {
  positive: 'verdict-good',
  neutral: 'bg-blue-900/30 text-blue-300 border border-blue-800/50',
  negative: 'verdict-bad',
  not_mentioned: 'bg-zinc-800/60 text-zinc-400 border border-zinc-700/50',
}

const SENTIMENT_LABEL = {
  positive: '↑ Positive',
  neutral: '→ Neutral',
  negative: '↓ Negative',
  not_mentioned: '○ Not found',
}

export function ModelCard({ result, index, brandName }) {
  const [expanded, setExpanded] = useState(false)
  const meta = MODEL_META[result.model] || MODEL_META.chatgpt

  const positionLabel = result.brand_position
    ? `#${result.brand_position} mention`
    : 'Not ranked'

  return (
    <div
      className="rounded-2xl border bg-surface flex flex-col overflow-hidden transition-all duration-300 hover:border-opacity-60"
      style={{
        borderColor: result.brand_mentioned ? meta.border : '#1e1e2e',
        animationDelay: `${index * 0.15}s`,
      }}
    >
      {/* Header band */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: result.brand_mentioned ? meta.bg : '#111118' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg" style={{ color: meta.color }}>{meta.icon}</span>
          <span className="font-display font-semibold text-sm text-text">{result.model_label}</span>
        </div>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded"
          style={{ background: `${meta.color}1a`, color: meta.color, border: `1px solid ${meta.color}33` }}
        >
          {meta.tag}
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center py-6 gap-2">
        <ScoreRing score={result.visibility_score} size={90} delay={0.3 + index * 0.15} />
        <span className="font-mono text-xs text-subtle mt-1">visibility score</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
        <div className="flex flex-col items-center py-3 gap-0.5">
          {result.brand_mentioned
            ? <Trophy size={14} className="text-accent" />
            : <EyeOff size={14} className="text-subtle" />
          }
          <span className="font-mono text-xs text-subtle">found</span>
          <span className={`font-display text-xs font-semibold ${result.brand_mentioned ? 'text-accent' : 'text-subtle'}`}>
            {result.brand_mentioned ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <Eye size={14} className="text-subtle" />
          <span className="font-mono text-xs text-subtle">position</span>
          <span className="font-display text-xs font-semibold text-text">{positionLabel}</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-0.5">
          <Clock size={14} className="text-subtle" />
          <span className="font-mono text-xs text-subtle">latency</span>
          <span className="font-display text-xs font-semibold text-text">{result.response_time_ms}ms</span>
        </div>
      </div>

      {/* Sentiment + excerpt */}
      <div className="px-5 py-4 border-t border-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-subtle font-mono">sentiment</span>
          <span className={`tag ${SENTIMENT_STYLE[result.sentiment]}`}>
            {SENTIMENT_LABEL[result.sentiment]}
          </span>
        </div>

        {result.key_excerpt && (
          <blockquote className="border-l-2 pl-3 py-1 text-xs text-subtle leading-relaxed italic"
            style={{ borderColor: meta.color + '66' }}>
            "{result.key_excerpt}"
          </blockquote>
        )}

        {result.competitors_mentioned.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-subtle font-mono">competitors found ({result.competitors_mentioned.length})</span>
            <div className="flex flex-wrap gap-1">
              {result.competitors_mentioned.map(c => (
                <span key={c} className="tag verdict-bad">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Raw response toggle */}
      <div className="border-t border-border mt-auto">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs text-subtle hover:text-text transition-colors font-mono group"
        >
          <span>view raw response</span>
          {expanded
            ? <ChevronUp size={12} className="group-hover:text-accent transition-colors" />
            : <ChevronDown size={12} className="group-hover:text-accent transition-colors" />
          }
        </button>
        {expanded && (
          <div className="px-5 pb-4">
            <pre className="text-xs text-subtle leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-mono bg-bg rounded-lg p-3 border border-border">
              {result.raw_response}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
