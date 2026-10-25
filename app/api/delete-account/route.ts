import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  // identify the user from their own token, never from anything they send
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const { error: delError } = await admin.auth.admin.deleteUser(data.user.id);
  if (delError) {
    return NextResponse.json({ error: "Could not delete account." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}