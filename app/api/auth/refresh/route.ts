import { NextRequest, NextResponse } from "next/server";

function parseCookies(cookieHeader: string | null) {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  cookieHeader.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      map[key] = decodeURIComponent(val);
    }
  });
  return map;
}

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ ok: false, error: "Missing supabase env" }, { status: 500 });
  }

  const cookieHeader = req.headers.get("cookie") || null;
  const cookies = parseCookies(cookieHeader);

  // Supabase refresh token cookie names may vary. Common names:
  const refreshToken = cookies["sb-refresh-token"] || cookies["supabase-refresh-token"] || cookies["sb:rt"] || "";

  if (!refreshToken) {
    return NextResponse.json({ ok: false, error: "no-refresh-token" }, { status: 401 });
  }

  const tokenUrl = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/token`;
  const body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refreshToken);

  try {
    const r = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: body.toString(),
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ ok: false, error: data }, { status: r.status });
    }

    // data should include access_token, refresh_token, expires_in
    const accessToken = data.access_token;
    const newRefresh = data.refresh_token;
    const expiresIn = data.expires_in || 3600;

    const secure = process.env.NODE_ENV === "production";

    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; ${secure ? "Secure;" : ""}`;

    const res = NextResponse.json({ ok: true });
    // Set access token cookie
    res.headers.append(
      "Set-Cookie",
      `sb-access-token=${encodeURIComponent(accessToken)}; Max-Age=${expiresIn}; ${cookieOptions}`
    );
    // Set refresh token cookie (longer expiry)
    res.headers.append(
      "Set-Cookie",
      `sb-refresh-token=${encodeURIComponent(newRefresh)}; Max-Age=${60 * 60 * 24 * 30}; ${cookieOptions}`
    );

    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
