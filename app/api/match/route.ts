
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SAMPLE_STORIES } from "@/lib/sampleData";
import { stripPII } from "@/lib/safety";
import { toEmbedText, finalScore, whyText } from "@/lib/match";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key);
}

export async function POST(req: Request) {
  try {
    const { cleanedStory, condition, duration, ageRange } = await req.json();

    if (typeof cleanedStory !== "string" || !cleanedStory.trim()) {
      return NextResponse.json(
        { error: "Missing story." },
        { status: 400 }
      );
    }

    // Re-strip on the server; never trust the client to have done it.
    const text = toEmbedText({
      condition,
      duration,
      text: stripPII(cleanedStory),
    });

    const supabase = getSupabaseClient();

    // Use sample matches when Supabase isn't configured.
    if (!supabase) {
      const matches = SAMPLE_STORIES.map((peer) => {
        let sim = 0.78;

        if (
          condition &&
          peer.condition.toLowerCase().includes(condition.toLowerCase())
        ) {
          sim += 0.12;
        }

        if (peer.duration.toLowerCase() === (duration || "").toLowerCase()) {
          sim += 0.05;
        }

        return {
          id: peer.id,
          score: Math.round(finalScore(sim, ageRange, peer.ageRange) * 100),
          why: whyText({ condition, ageRange }, peer),
        };
      })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return NextResponse.json({ matches });
    }

    const { data: embeddingData, error: embeddingError } =
      await supabase.functions.invoke("embed", {
        body: { text },
      });

    if (embeddingError || !embeddingData?.embedding) {
      return NextResponse.json(
        { error: "Embedding failed." },
        { status: 502 }
      );
    }

    const { data: candidates, error: matchError } = await supabase.rpc(
      "match_peers",
      {
        query_embedding: embeddingData.embedding,
        match_count: 10,
      }
    );

    if (matchError) {
      return NextResponse.json(
        { error: "Match lookup failed." },
        { status: 500 }
      );
    }

    const matches = (candidates ?? [])
      .map((candidate: { id: string; similarity: number }) => {
        const peer = SAMPLE_STORIES.find(
          (story) => story.id === candidate.id
        );

        if (!peer) return null;

        return {
          id: peer.id,
          score: Math.round(
            finalScore(candidate.similarity, ageRange, peer.ageRange) * 100
          ),
          why: whyText({ condition, ageRange }, peer),
        };
      })
      .filter(
        (match: unknown): match is { id: string; score: number; why: string } =>
          match !== null
      )
      .sort(
        (
          first: { id: string; score: number; why: string },
          second: { id: string; score: number; why: string }
        ) => second.score - first.score
      )
      .slice(0, 5);

    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json(
      { error: "Unable to process matching request." },
      { status: 500 }
    );
  }
}
