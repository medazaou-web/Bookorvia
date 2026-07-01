import { NextResponse } from "next/server";
import { createServerSupabase } from "../../lib/supabase/serverClient";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerSupabase(cookieStore);
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // ignore errors during sign out
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createServerSupabase(cookieStore);
  try {
    await supabase.auth.signOut();
  } catch (e) {
    // ignore
  }
  return NextResponse.redirect(new URL("/login", req.url));
}
