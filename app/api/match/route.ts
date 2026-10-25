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
  const { cleanedStory, condition, duration, ageRange } = await req.json();
  if (typeof cleanedStory !== "string" || !cleanedStory.trim()) {
    return NextResponse.json({ error: "Missing story." }, { status: 400 });
  }

  // re-strip on the server; never trust the client to have done it
  const text = toEmbedText({ condition, duration, text: stripPII(cleanedStory) });

  const supabase = getSupabaseClient();
  if (!supabase) {
    const matches = SAMPLE_STORIES.map((peer) => {
      let sim = 0.78;
      if (peer.condition.toLowerCase().includes((condition || "").toLowerCase())) sim += 0.12;
      if (peer.duration.toLowerCase() === (duration || "").toLowerCase()) sim += 0.05;
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

  const { data: e, error: eErr } = await supabase.functions.invoke("embed", { body: { text } });
  if (eErr || !e?.embedding) {
    return NextResponse.json({ error: "Embedding failed." }, { status: 502 });
  }

  const { data: cands, error } = await supabase.rpc("match_peers", {
    query_embedding: e.embedding,
    match_count: 10,
  });
  if (error) {
    return NextResponse.json({ error: "Match lookup failed." }, { status: 500 });
  }

  const matches = (cands ?? [])
    .map((c: { id: string; similarity: number }) => {
      const peer = SAMPLE_STORIES.find((s) => s.id === c.id);
      if (!peer) return null;
      return {
        id: peer.id,
        score: Math.round(finalScore(c.similarity, ageRange, peer.ageRange) * 100),
        why: whyText({ condition, ageRange }, peer),
      };
    })
    .filter((m: unknown): m is { id: string; score: number; why: string } => m !== null)
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
    .slice(0, 5); // top 5 so declining one still leaves 3 to show

  return NextResponse.json({ matches });
}