const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function runDiagnostic({ query, brand_name, competitors, country }) {
  const res = await fetch(`${BASE_URL}/api/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, brand_name, competitors, country: country || null }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}
