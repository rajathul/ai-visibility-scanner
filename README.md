# AI Visibility Scanner

Query ChatGPT and Gemini simultaneously to see how your brand ranks in AI engine responses. Analysis powered by Claude Sonnet.

## Stack

- **Backend:** FastAPI + Python, async parallel queries
- **Frontend:** React + Tailwind + Framer Motion
- **Analysis engine:** Claude Sonnet (parses + scores responses)
- **Deploy:** Docker (local) + Netlify (frontend)

---

## Quick Start (Docker)

### 1. Clone & configure

```bash
git clone <your-repo>
cd aeo-diagnostic

# Set up backend env
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

### 2. Add your API keys to `backend/.env`

```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

---

## Local Dev (without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your keys
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API

### `POST /api/diagnose`

```json
{
  "query": "best magnesium supplement for seniors",
  "brand_name": "NatureMade",
  "competitors": ["Nature's Bounty", "NOW Foods"]
}
```

**Response:**
```json
{
  "query": "...",
  "brand_name": "NatureMade",
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
    ...
  ],
  "overall_score": 68,
  "recommendations": [...],
  "summary": "..."
}
```

---

## How it works

1. User enters a shopper query + their brand name
2. FastAPI fires 2 async requests simultaneously:
   - **ChatGPT** via Responses API with web search
   - **Gemini** via REST API with Google Search grounding
3. Both raw responses are sent to **Claude Sonnet** for structured analysis
4. Claude extracts: brand position, sentiment, competitors, visibility score
5. Frontend renders side-by-side comparison cards + recommendations

---

## Getting API Keys

| Service | Link |
|---|---|
| OpenAI (ChatGPT) | https://platform.openai.com/api-keys |
| Google (Gemini) | https://aistudio.google.com/app/apikey |
| Anthropic (Claude) | https://console.anthropic.com/ |
