import { createClient, FunctionsHttpError } from "@supabase/supabase-js";
import { SAMPLE_STORIES } from "../lib/sampleData";
import { toEmbedText } from "../lib/match";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  for (const s of SAMPLE_STORIES) {
    const text = toEmbedText({
      condition: s.condition,
      duration: s.duration,
      text: s.fullStoryCleaned,
    });

    const { data, error } = await supabase.functions.invoke("embed", {
      body: { text },
    });

    if (error) {
      if (error instanceof FunctionsHttpError) {
        console.error("EMBED FAILED:", error.context.status, await error.context.text());
      } else {
        console.error("EMBED FAILED:", error.message);
      }
      process.exit(1);
    }

    console.log("embedding length:", data?.embedding?.length);

    const { error: upErr } = await supabase
      .from("peers")
      .upsert({ id: s.id, embedding: data.embedding });

    if (upErr) {
      console.error("UPSERT FAILED:", JSON.stringify(upErr, null, 2));
      process.exit(1);
    }

    console.log("seeded", s.id);
  }
}

main();