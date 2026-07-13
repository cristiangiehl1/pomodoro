import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { exchangeCodeForToken } from "@/features/music/logic/spotify-auth";
import { cookies } from "next/headers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/?spotify_error=unauthorized", APP_URL));
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/?spotify_error=${encodeURIComponent(error)}`, APP_URL),
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("spotify_oauth_state")?.value;

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/?spotify_error=state_mismatch", APP_URL),
    );
  }

  // Clear state cookie immediately
  cookieStore.delete("spotify_oauth_state");

  if (!code) {
    return NextResponse.redirect(
      new URL("/?spotify_error=missing_code", APP_URL),
    );
  }

  if (
    !env.SPOTIFY_CLIENT_ID ||
    !env.SPOTIFY_CLIENT_SECRET ||
    !env.SPOTIFY_REDIRECT_URI
  ) {
    return NextResponse.redirect(
      new URL("/?spotify_error=not_configured", APP_URL),
    );
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await exchangeCodeForToken(
      {
        code,
        clientId: env.SPOTIFY_CLIENT_ID,
        clientSecret: env.SPOTIFY_CLIENT_SECRET,
        redirectUri: env.SPOTIFY_REDIRECT_URI,
      },
    );

    const expiresAt = Date.now() + expiresIn * 1000;
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    };

    cookieStore.set("spotify_access_token", accessToken, {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    cookieStore.set("spotify_expires_at", String(expiresAt), {
      ...cookieOptions,
      maxAge: expiresIn,
    });

    if (refreshToken) {
      cookieStore.set("spotify_refresh_token", refreshToken, {
        ...cookieOptions,
        // Refresh tokens are long-lived; keep for 30 days
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return NextResponse.redirect(new URL("/", APP_URL));
  } catch {
    return NextResponse.redirect(
      new URL("/?spotify_error=auth_failed", APP_URL),
    );
  }
}
