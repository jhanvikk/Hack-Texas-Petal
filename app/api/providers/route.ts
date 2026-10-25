import {
  STORY_CONDITIONS,
  SYMPTOM_SEARCH_PATTERNS,
  type SymptomSearchTerm,
} from "@/lib/symptomSearch";

interface SerpApiResult {
  title?: unknown;
  link?: unknown;
  website?: unknown;
  source?: unknown;
  displayed_link?: unknown;
  address?: unknown;
  phone?: unknown;
  phone_number?: unknown;
  rating?: unknown;
  reviews?: unknown;
  snippet?: unknown;
}

interface Provider {
  title: string;
  link: string;
  source?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  snippet?: string;
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeResult(result: SerpApiResult, location: string): Provider | null {
  const title = asText(result.title);
  if (!title) return null;

  const rawLink = asText(result.link) ?? asText(result.website);
  let link: string;
  try {
    const url = rawLink ? new URL(rawLink) : null;
    link = url?.protocol === "https:" ? url.toString() : "";
  } catch {
    link = "";
  }

  if (!link) {
    link = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${location}`)}`;
  }

  return {
    title,
    link,
    source: asText(result.source) ?? asText(result.displayed_link),
    address: asText(result.address),
    phone: asText(result.phone) ?? asText(result.phone_number),
    rating: asNumber(result.rating),
    reviews: asNumber(result.reviews),
    snippet: asText(result.snippet),
  };
}

export async function POST(request: Request) {
  let body: { location?: unknown; condition?: unknown; symptoms?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter a city, state, or ZIP code to search." }, { status: 400 });
  }

  const location = typeof body.location === "string" ? body.location.trim() : "";
  if (!location || location.length > 120) {
    return Response.json({ error: "Enter a location under 120 characters." }, { status: 400 });
  }

  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Provider search is not configured. Add SERPAPI_API_KEY to .env.local and restart the server." },
      { status: 503 }
    );
  }

  const requestedCondition = typeof body.condition === "string" ? body.condition : "";
  const condition = STORY_CONDITIONS.includes(requestedCondition as (typeof STORY_CONDITIONS)[number])
    && requestedCondition !== "Exploring / Unsure"
    ? requestedCondition
    : "";
  const allowedSymptoms = new Set<string>(SYMPTOM_SEARCH_PATTERNS.map(({ term }) => term));
  const symptoms = Array.isArray(body.symptoms)
    ? [...new Set(body.symptoms.filter((term): term is SymptomSearchTerm => typeof term === "string" && allowedSymptoms.has(term)))]
    : [];
  const queryTerms = [...symptoms, condition].filter(Boolean);
  if (queryTerms.length === 0) {
    return Response.json(
      { error: "Add a recognized condition or symptom to search for relevant providers." },
      { status: 400 }
    );
  }

  const symptomQuery = symptoms.length > 1
    ? `(${symptoms.map((symptom) => `"${symptom}"`).join(" OR ")})`
    : symptoms.map((symptom) => `"${symptom}"`).join(" ");
  const query = [condition, symptomQuery, "women's health gynecologist clinics"]
    .filter(Boolean)
    .join(" ");

  const params = new URLSearchParams({
    engine: "google_maps",
    type: "search",
    q: query,
    location,
    z: "14",
    google_domain: "google.com",
    hl: "en",
    gl: "us",
    api_key: apiKey,
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return Response.json({ error: "Provider search is temporarily unavailable." }, { status: 502 });
    }

    const data = await response.json();
    if (data.error) {
      return Response.json({ error: "SerpAPI could not complete the search. Check your API key and account." }, { status: 502 });
    }

    const localResults = Array.isArray(data.local_results)
      ? data.local_results
      : Array.isArray(data.local_results?.places)
        ? data.local_results.places
        : [];
    const organicResults = Array.isArray(data.organic_results) ? data.organic_results : [];
    const providers = [...localResults, ...organicResults]
      .map((result) => normalizeResult(result as SerpApiResult, location))
      .filter((result): result is Provider => result !== null)
      .filter((result, index, all) => all.findIndex((item) => item.title === result.title) === index)
      .slice(0, 10);

    return Response.json({ providers });
  } catch {
    return Response.json({ error: "Could not connect to provider search. Please try again." }, { status: 502 });
  }
}