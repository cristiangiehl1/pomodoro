import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url(),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
  SPOTIFY_REDIRECT_URI: z.url().optional(),
  NEXT_PUBLIC_APP_URL: z.url(),
});

export const env = schema.parse(process.env);
