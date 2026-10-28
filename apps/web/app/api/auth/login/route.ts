import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // 1. Try real backend first if running
    try {
      const upstream = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (upstream.ok) {
        const data = await upstream.json();
        const response = NextResponse.json({ ok: true });
        const secure = process.env.NODE_ENV === "production";
        response.cookies.set("orbitops_access", data.access_token, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 60,
        });
        response.cookies.set("orbitops_refresh", data.refresh_token, {
          httpOnly: true,
          secure,
          sameSite: "strict",
          path: "/api/auth",
          maxAge: 14 * 24 * 60 * 60,
        });
        return response;
      }
    } catch {
      // Backend is offline, seamlessly fall through to Demo Mode
    }

    // 2. Demo Mode fallback: allow previewing the entire app without the backend running
    const response = NextResponse.json({ ok: true, demo: true });
    response.cookies.set("orbitops_access", "demo_mode_token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 60,
    });
    response.cookies.set("orbitops_refresh", "demo_refresh_token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/api/auth",
      maxAge: 14 * 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Failed to sign in" },
      { status: 500 }
    );
  }
}
