interface SerpClinic {
  title?: string;
  rating?: number;
  reviews?: number;
  address?: string;
  phone?: string;
  website?: string;
  operating_hours?: Record<string, string>;
  open_state?: string;
  place_id?: string;
  type?: string;
  types?: string[];
  category?: string;
}

interface SerpReview {
  snippet?: string;
  text?: string;
}

interface SerpResponse {
  local_results?: SerpClinic[];
  reviews?: SerpReview[];
  error?: string;
}

async function fetchSerpApi(params: Record<string, string>): Promise<SerpResponse> {
  const url = new URL("https://serpapi.com/search.json");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("api_key", process.env.SERPAPI_API_KEY || "");

  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) throw new Error("SerpApi request failed");
  const data = await response.json() as SerpResponse;
  if (data.error) throw new Error("SerpApi request failed");
  return data;
}

const LOW_COST_QUERY = "community health center women's health";
const LOW_COST_SIGNALS = /community health|community clinic|community care|fqhc|federally qualified|health department|free clinic|planned parenthood|sliding.scale|low.cost|neighborhood health/i;

function isLowCostOption(clinic: SerpClinic): boolean {
  const clinicDescription = [clinic.title, clinic.type, clinic.category, ...(clinic.types || [])]
    .filter(Boolean)
    .join(" ");
  return LOW_COST_SIGNALS.test(clinicDescription);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialties = [...new Set(searchParams.getAll("specialty").map((item) => item.trim()).filter(Boolean))].slice(0, 2);
  const zip = searchParams.get("zip")?.trim();

  if (!specialties.length || specialties.some((specialty) => specialty.length > 120) || !zip || !/^\d{5}(?:-\d{4})?$/.test(zip)) {
    return Response.json({ error: "At least one specialty and a valid ZIP code are required." }, { status: 400 });
  }
  if (!process.env.SERPAPI_API_KEY) {
    return Response.json({ error: "Clinic search is not configured." }, { status: 503 });
  }

  try {
    const queries = [...specialties, LOW_COST_QUERY];
    const searches = await Promise.allSettled(queries.map((specialty, index) =>
      fetchSerpApi({
        engine: "google_maps",
        q: `${specialty} near ${zip}`,
        type: "search",
      }).then((value) => ({ index, value })),
    ));
    const successfulSearches = searches.filter(
      (result): result is PromiseFulfilledResult<{ index: number; value: SerpResponse }> => result.status === "fulfilled",
    );
    if (!successfulSearches.length) throw new Error("All clinic searches failed");

    const merged = new Map<string, SerpClinic & { lowCostOption: boolean }>();
    successfulSearches.forEach((search) => {
      const isLowCostSearch = search.value.index === specialties.length;
      for (const clinic of search.value.value.local_results || []) {
        const key = clinic.place_id || `${clinic.title || ""}|${clinic.address || ""}`.toLowerCase();
        const existing = merged.get(key);
        merged.set(key, {
          ...existing,
          ...clinic,
          lowCostOption: Boolean(existing?.lowCostOption || isLowCostOption(clinic) || (isLowCostSearch && isLowCostOption(clinic))),
        });
      }
    });

    const results = [...merged.values()];
    const reviewed = await Promise.all(
      results.slice(0, 5).map(async (clinic) => {
        if (!clinic.place_id) return { ...clinic, reviewSnippets: [] as string[] };
        try {
          const reviewResponse = await fetchSerpApi({
            engine: "google_maps_reviews",
            place_id: clinic.place_id,
          });
          return {
            ...clinic,
            reviewSnippets: (reviewResponse.reviews || [])
              .slice(0, 10)
              .map((review) => review.snippet || review.text || "")
              .filter(Boolean),
          };
        } catch {
          return { ...clinic, reviewSnippets: [] as string[] };
        }
      }),
    );

    const clinics = results.map((clinic, index) => {
      const reviewedClinic = reviewed[index];
      return {
        name: clinic.title || "Clinic",
        rating: typeof clinic.rating === "number" ? clinic.rating : null,
        reviews: clinic.reviews || 0,
        address: clinic.address || "",
        phone: clinic.phone || "",
        website: clinic.website || "",
        hours: clinic.operating_hours || null,
        openState: clinic.open_state || "Hours unavailable",
        placeId: clinic.place_id || "",
        lowCostOption: clinic.lowCostOption,
        reviewSnippets: reviewedClinic?.reviewSnippets || [],
      };
    });

    return Response.json({ clinics });
  } catch {
    return Response.json({ error: "Clinic results could not be loaded." }, { status: 502 });
  }
}
