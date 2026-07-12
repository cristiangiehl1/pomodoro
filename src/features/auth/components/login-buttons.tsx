"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginButtons() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google")}
      >
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("github")}
      >
        Continue with GitHub
      </Button>
    </div>
  );
}
