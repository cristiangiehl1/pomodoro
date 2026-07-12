import type { Metadata } from "next";
import { LoginButtons } from "@/features/auth/components/login-buttons";

export const metadata: Metadata = {
  title: "Sign in — Pomodoro",
  description: "Sign in to your Pomodoro account with Google or GitHub.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-8 p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to continue to Pomodoro
          </p>
        </div>
        <LoginButtons />
      </div>
    </div>
  );
}
