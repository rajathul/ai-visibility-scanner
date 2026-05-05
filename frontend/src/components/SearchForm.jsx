import { useState } from 'react'
import { Search, Plus, X, Zap, Globe } from 'lucide-react'

const EXAMPLES = [
  { query: 'best magnesium supplement for seniors', brand: 'NatureMade' },
  { query: 'best noise cancelling headphones under $300', brand: 'Sony' },
  { query: 'best protein powder for weight loss women', brand: 'Optimum Nutrition' },
  { query: 'best standing desk for home office', brand: 'FlexiSpot' },
]

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Germany', 'France', 'Japan', 'Brazil', 'Mexico',
  'Netherlands', 'Sweden', 'Singapore', 'United Arab Emirates',
  'South Korea', 'Italy', 'Spain', 'Indonesia',
]

export function SearchForm({ onSubmit, loading }) {
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('')
  const [country, setCountry] = useState('')
  const [competitors, setCompetitors] = useState([])
  const [competitorInput, setCompetitorInput] = useState('')

  const addCompetitor = () => {
    const val = competitorInput.trim()
    if (val && !competitors.includes(val) && competitors.length < 5) {
      setCompetitors(c => [...c, val])
      setCompetitorInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCompetitor() }
  }

  const fillExample = (ex) => {
    setQuery(ex.query)
    setBrand(ex.brand)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim() || !brand.trim()) return
    onSubmit({ query: query.trim(), brand_name: brand.trim(), competitors, country })
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Examples */}
      <div className="mb-8">
        <p className="font-mono text-xs text-subtle mb-3 text-center">try an example</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => fillExample(ex)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-subtle hover:text-accent hover:border-accent/40 transition-all"
            >
              {ex.query.length > 38 ? ex.query.slice(0, 38) + '…' : ex.query}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Query */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="What would a shopper ask AI? e.g. best protein powder for muscle gain"
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3.5 text-sm text-text placeholder-subtle focus:outline-none focus:border-accent/50 transition-colors font-body"
          />
        </div>

        {/* Brand + country */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs text-accent pointer-events-none">@</span>
            <input
              type="text"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="Your brand name"
              className="w-full bg-surface border border-border rounded-xl pl-8 pr-4 py-3.5 text-sm text-text placeholder-subtle focus:outline-none focus:border-accent/50 transition-colors font-body"
            />
          </div>
          <div className="relative">
            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="appearance-none bg-surface border border-border rounded-xl pl-8 pr-8 py-3.5 text-sm text-text focus:outline-none focus:border-accent/50 transition-colors font-body cursor-pointer w-full sm:w-48"
              title="Target market (optional)"
            >
              <option value="">Global</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none text-xs">▾</span>
          </div>
        </div>

        {/* Competitors */}
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={competitorInput}
              onChange={e => setCompetitorInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add known competitors (optional)"
              className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm text-text placeholder-subtle focus:outline-none focus:border-border/80 transition-colors font-body"
            />
            <button
              type="button"
              onClick={addCompetitor}
              disabled={!competitorInput.trim() || competitors.length >= 5}
              className="px-4 py-3 rounded-xl border border-border text-subtle hover:text-accent hover:border-accent/40 transition-all disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>
          {competitors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {competitors.map(c => (
                <span
                  key={c}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono bg-muted text-text border border-border"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() => setCompetitors(cs => cs.filter(x => x !== c))}
                    className="text-subtle hover:text-danger transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!query.trim() || !brand.trim() || loading}
          className="relative flex items-center justify-center gap-2 w-full py-4 rounded-xl font-display font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, #065f46, #047857)', color: '#6ee7b7' }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #047857, #059669)' }}
          />
          <Zap size={15} className="relative z-10" />
          <span className="relative z-10">Run Diagnostic</span>
        </button>
      </form>
    </div>
  )
}
