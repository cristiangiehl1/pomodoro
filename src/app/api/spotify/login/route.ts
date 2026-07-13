import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { buildAuthorizeUrl } from "@/features/music/logic/spotify-auth";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_REDIRECT_URI) {
    return NextResponse.json(
      { error: "spotify_not_configured" },
      { status: 503 },
    );
  }

  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  const authorizeUrl = buildAuthorizeUrl({
    clientId: env.SPOTIFY_CLIENT_ID,
    redirectUri: env.SPOTIFY_REDIRECT_URI,
    state,
  });

  return NextResponse.redirect(authorizeUrl);
}
