import { createAuthClient } from "better-auth/react";
import { resetAccessToken } from "@/lib/api";

// Auth calls stay on the Next.js origin (same origin as the browser). A route
// handler proxies /api/auth/* to the Express server that owns Better Auth.
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, useSession } = authClient;

export async function signOut(...args: Parameters<typeof authClient.signOut>) {
  try {
    await fetch("/api/auth-token", { method: "DELETE", credentials: "include" });
  } finally {
    resetAccessToken();
  }
  return authClient.signOut(...args);
}

/** Roles used by the app. `pending` means a Google user has not picked yet. */
export type UserRole = "customer" | "vendor" | "pending" | "admin";
