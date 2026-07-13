import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { env } from "@/lib/env";
import { refreshAccessToken } from "@/features/music/logic/spotify-auth";
import { cookies } from "next/headers";

// Refresh if token expires within 5 minutes
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("spotify_access_token")?.value;
  const expiresAtStr = cookieStore.get("spotify_expires_at")?.value;
  const refreshToken = cookieStore.get("spotify_refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  const expiresAt = expiresAtStr ? Number(expiresAtStr) : 0;
  const isExpiredOrNearExpiry = Date.now() + EXPIRY_BUFFER_MS >= expiresAt;

  if (isExpiredOrNearExpiry && refreshToken) {
    if (
      !env.SPOTIFY_CLIENT_ID ||
      !env.SPOTIFY_CLIENT_SECRET
    ) {
      return NextResponse.json({ error: "spotify_not_configured" }, { status: 503 });
    }

    try {
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
      } = await refreshAccessToken({
        refreshToken,
        clientId: env.SPOTIFY_CLIENT_ID,
        clientSecret: env.SPOTIFY_CLIENT_SECRET,
      });

      const newExpiresAt = Date.now() + expiresIn * 1000;
      const isProduction = process.env.NODE_ENV === "production";

      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax" as const,
        path: "/",
      };

      cookieStore.set("spotify_access_token", newAccessToken, {
        ...cookieOptions,
        maxAge: expiresIn,
      });

      cookieStore.set("spotify_expires_at", String(newExpiresAt), {
        ...cookieOptions,
        maxAge: expiresIn,
      });

      const tokenToStore = newRefreshToken ?? refreshToken;
      if (tokenToStore) {
        cookieStore.set("spotify_refresh_token", tokenToStore, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30,
        });
      }

      return NextResponse.json({
        accessToken: newAccessToken,
        expiresAt: newExpiresAt,
      });
    } catch {
      return NextResponse.json({ error: "refresh_failed" }, { status: 500 });
    }
  }

  if (isExpiredOrNearExpiry && !refreshToken) {
    return NextResponse.json({ error: "token_expired" }, { status: 401 });
  }

  return NextResponse.json({ accessToken, expiresAt });
}
