# AI Visibility Scanner

Query ChatGPT and Gemini in parallel to see how a brand ranks in AI search responses, then have Claude Sonnet score visibility, sentiment, and competitor presence. Optional country targeting localizes the results.

## Stack

- **Backend** — FastAPI (Python 3.12), async parallel queries, in-memory per-IP rate limit
- **Frontend** — React 18 + Vite + Tailwind CSS (CSS-only animations)
- **Engines** — OpenAI Responses API (web search), Google `google-genai` SDK (Search grounding)
- **Analyst** — Anthropic Claude Sonnet, scores all engines into a single JSON report
- **Deploy** — single multi-stage Docker image (FastAPI serves the built React bundle)

---

## Local development

Two terminals. The Vite dev server proxies `/api/*` to the backend on `:8000`, so no `VITE_API_URL` is needed locally.

### Backend

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
cp .env.example .env       # fill in your 3 API keys
uv run uvicorn main:app --reload --port 8000
```

(Or use `python -m venv` + `pip` if you don't have `uv`.)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

---

## Production build (single image)

The root [`Dockerfile`](Dockerfile) is multi-stage: it builds the React app with Node, then copies the bundle into a Python image where FastAPI serves both the API and the static frontend on one port.

```bash
docker build -t ai-visibility .
docker run --rm -p 8000:8000 --env-file backend/.env ai-visibility
```

Open http://localhost:8000 — same artifact you'll deploy.

---

## Deploy to Render

1. Push the repo to GitHub
2. Render dashboard → New → Web Service → connect the repo
3. Render auto-detects the root `Dockerfile`
4. Add environment variables (see [Configuration](#configuration))
5. Deploy — Render returns a `*.onrender.com` URL

Render's free tier sleeps after 15 minutes of inactivity (~30s cold start on first request). Fine for demos; not for production traffic.

> **Cost note:** the compute is free, but every diagnostic call bills the OpenAI / Anthropic keys you set. The default rate limit (10 req/min/IP) is the main guardrail against a public link burning your credits — set spending caps in each provider's dashboard as a hard backstop.

---

## Configuration

All configuration is via environment variables in `backend/.env` (or Render's dashboard).

| Variable | Required | Default | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | yes | — | ChatGPT (Responses API with `web_search_preview`) |
| `GEMINI_API_KEY` | yes | — | Google AI Studio key, free tier is enough |
| `ANTHROPIC_API_KEY` | yes | — | Used only by the analyzer pass |
| `RATE_LIMIT_PER_MIN` | no | `10` | Per-IP cap on `/api/diagnose` |
| `PORT` | no | `8000` | Render injects this automatically |

---

## API

### `POST /api/diagnose`

```json
{
  "query": "best magnesium supplement for seniors",
  "brand_name": "NatureMade",
  "competitors": ["Nature's Bounty", "NOW Foods"],
  "country": "United States"
}
```

`competitors` and `country` are optional. When `country` is set, it's appended to the query sent to the engines (`"... in United States"`) and passed to Claude as the target market.

**Response:**

```json
{
  "query": "best magnesium supplement for seniors",
  "brand_name": "NatureMade",
  "country": "United States",
  "results": [
    {
      "model": "chatgpt",
      "model_label": "ChatGPT",
      "brand_mentioned": true,
      "brand_position": 2,
      "visibility_score": 74,
      "sentiment": "positive",
      "key_excerpt": "NatureMade offers a well-absorbed chelated form...",
      "competitors_mentioned": ["Nature's Bounty"],
      "response_time_ms": 2341
    },
    { "model": "gemini", "model_label": "Gemini", "...": "..." }
  ],
  "overall_score": 68,
  "recommendations": [
    "Publish a comparison page targeting the 'best magnesium for seniors' phrasing.",
    "...",
    "..."
  ],
  "summary": "NatureMade has strong visibility on ChatGPT but is absent from Gemini's top picks..."
}
```

### `GET /health`

Returns `{"status": "ok"}`. Useful for Render's health checks.

---

## How it works

1. User submits `{query, brand_name, competitors?, country?}` from the UI.
2. The backend rate-limits per IP (`x-forwarded-for`-aware, so it works behind Render's load balancer).
3. The query is geo-augmented if `country` is set, then fanned out in parallel:
   - **ChatGPT** via `openai.AsyncOpenAI.responses.create(model="gpt-5.5", tools=[web_search_preview])`
   - **Gemini** via `google-genai` SDK with `Tool(google_search=GoogleSearch())`
4. Both raw responses are sent to **Claude Sonnet** with a structured-output prompt.
5. Claude returns one JSON object: per-engine scores, an overall weighted score, an executive summary, and three recommendations.
6. The frontend renders score rings, per-engine cards (with raw-response toggles), and the recommendations list.

---

## Getting API keys

| Provider | Link |
|---|---|
| OpenAI (ChatGPT) | https://platform.openai.com/api-keys |
| Google (Gemini) | https://aistudio.google.com/app/apikey |
| Anthropic (Claude) | https://console.anthropic.com/ |
