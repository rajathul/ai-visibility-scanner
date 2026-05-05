import asyncio
import json
import logging
import os
import re
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Optional

import anthropic
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from openai import AsyncOpenAI
from pydantic import BaseModel

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("aeo")

app = FastAPI(title="AI Visibility Scanner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)
anthropic_client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)


class DiagnosticRequest(BaseModel):
    query: str
    brand_name: str
    competitors: Optional[list[str]] = []
    country: Optional[str] = None


class ModelResult(BaseModel):
    model_config = {"protected_namespaces": ()}
    model: str
    model_label: str
    raw_response: str
    brand_mentioned: bool
    brand_position: Optional[int]
    competitors_mentioned: list[str]
    total_brands_mentioned: int
    response_time_ms: int
    visibility_score: int
    sentiment: str
    key_excerpt: Optional[str]


class DiagnosticResponse(BaseModel):
    query: str
    brand_name: str
    country: Optional[str]
    results: list[ModelResult]
    overall_score: int
    recommendations: list[str]
    summary: str


async def query_chatgpt(query: str) -> tuple[str, int]:
    start = time.time()
    logger.info("GPT-5.5: querying %r", query)
    try:
        response = await openai_client.responses.create(
            model="gpt-5.5",
            tools=[{"type": "web_search_preview"}],
            input=query,
        )
        elapsed = int((time.time() - start) * 1000)
        text = response.output_text or "No response received."
        logger.info("GPT-5.5: ok in %dms, %d chars", elapsed, len(text))
        return text, elapsed
    except Exception as e:
        elapsed = int((time.time() - start) * 1000)
        logger.exception("GPT-5.5: FAILED after %dms — %s", elapsed, e)
        return f"Error querying GPT-5.5: {type(e).__name__}: {e}", elapsed


async def query_gemini(query: str) -> tuple[str, int]:
    start = time.time()
    logger.info("Gemini: querying %r", query)
    try:
        response = await gemini_client.aio.models.generate_content(
            model="gemini-3.1-flash-lite-preview",
            contents=query,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())],
            ),
        )
        elapsed = int((time.time() - start) * 1000)
        text = response.text or "No response received."
        logger.info("Gemini: ok in %dms, %d chars", elapsed, len(text))
        return text, elapsed
    except Exception as e:
        elapsed = int((time.time() - start) * 1000)
        logger.exception("Gemini: FAILED after %dms — %s", elapsed, e)
        return f"Error querying Gemini: {type(e).__name__}: {e}", elapsed


def analyze_with_claude(
    query: str,
    brand_name: str,
    competitors: list[str],
    country: Optional[str],
    gpt_response: str,
    gemini_response: str,
) -> dict:
    prompt = f"""You are an Answer Engine Optimization (AEO) analyst. Analyze how a brand appears in AI engine responses.

QUERY ASKED: "{query}"
BRAND TO TRACK: "{brand_name}"
TARGET MARKET: {country or "Global / not specified"}
KNOWN COMPETITORS: {json.dumps(competitors) if competitors else "Not specified — infer from responses"}

RESPONSES FROM AI ENGINES:

=== ChatGPT (with web search) ===
{gpt_response}

=== Gemini (with Google Search grounding) ===
{gemini_response}

Analyze each response and return a JSON object with this exact structure:
{{
  "models": [
    {{
      "model": "chatgpt",
      "model_label": "ChatGPT",
      "brand_mentioned": true/false,
      "brand_position": null or integer (1-based position in recommendation list, null if not mentioned),
      "competitors_mentioned": ["list", "of", "competitor", "names", "found"],
      "total_brands_mentioned": integer,
      "visibility_score": integer 0-100,
      "sentiment": "positive" | "neutral" | "negative" | "not_mentioned",
      "key_excerpt": "the exact sentence or phrase mentioning the brand, or null"
    }},
    {{ same for "gemini" / "Gemini" }}
  ],
  "overall_score": integer 0-100 (weighted average across all models),
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "summary": "2-3 sentence executive summary of the brand's AI visibility"
}}

Scoring guide for visibility_score:
- 90-100: Brand mentioned first or prominently with positive framing
- 70-89: Brand mentioned in top 3 with neutral/positive framing  
- 50-69: Brand mentioned but not prominently
- 20-49: Brand barely mentioned or in passing
- 0-19: Brand not mentioned at all

Return ONLY the JSON. No markdown, no explanation."""

    logger.info("Claude: analyzing brand=%r, prompt=%d chars", brand_name, len(prompt))
    start = time.time()
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )
    logger.info("Claude: ok in %dms", int((time.time() - start) * 1000))

    raw = response.content[0].text.strip()
    # Strip markdown fences if present
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return json.loads(raw)


RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "10"))
_request_log: dict[str, deque] = defaultdict(deque)


def rate_limit(request: Request) -> None:
    ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or (
        request.client.host if request.client else "unknown"
    )
    now = time.time()
    dq = _request_log[ip]
    while dq and dq[0] < now - 60:
        dq.popleft()
    if len(dq) >= RATE_LIMIT_PER_MIN:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded: {RATE_LIMIT_PER_MIN} requests/min per IP. Try again shortly.",
        )
    dq.append(now)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/diagnose", response_model=DiagnosticResponse)
async def diagnose(request: DiagnosticRequest, http: Request):
    rate_limit(http)
    if not request.query or not request.brand_name:
        raise HTTPException(status_code=400, detail="query and brand_name are required")

    # Geo-augment the query so engines localize results
    geo_query = f"{request.query} in {request.country}" if request.country else request.query

    # Fire both queries in parallel
    gpt_task = query_chatgpt(geo_query)
    gemini_task = query_gemini(geo_query)

    (gpt_text, gpt_ms), (gemini_text, gemini_ms) = await asyncio.gather(
        gpt_task, gemini_task
    )

    # Claude analyzes both
    analysis = analyze_with_claude(
        request.query,
        request.brand_name,
        request.competitors or [],
        request.country,
        gpt_text,
        gemini_text,
    )

    raw_responses = {
        "chatgpt": (gpt_text, gpt_ms),
        "gemini": (gemini_text, gemini_ms),
    }

    results = []
    for model_data in analysis["models"]:
        model_key = model_data["model"]
        raw_text, response_ms = raw_responses.get(model_key, ("", 0))
        results.append(
            ModelResult(
                model=model_key,
                model_label=model_data["model_label"],
                raw_response=raw_text,
                brand_mentioned=model_data["brand_mentioned"],
                brand_position=model_data.get("brand_position"),
                competitors_mentioned=model_data.get("competitors_mentioned", []),
                total_brands_mentioned=model_data.get("total_brands_mentioned", 0),
                response_time_ms=response_ms,
                visibility_score=model_data["visibility_score"],
                sentiment=model_data["sentiment"],
                key_excerpt=model_data.get("key_excerpt"),
            )
        )

    return DiagnosticResponse(
        query=request.query,
        brand_name=request.brand_name,
        country=request.country,
        results=results,
        overall_score=analysis["overall_score"],
        recommendations=analysis["recommendations"],
        summary=analysis["summary"],
    )


# Serve built frontend if present (production build inside container).
# Skipped in local dev where Vite handles the UI on :3000.
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="frontend")
    logger.info("Serving frontend from %s", STATIC_DIR)
else:
    logger.info("No static dir at %s — running API-only", STATIC_DIR)
