import { createAuthClient } from "better-auth/react";

// Auth calls stay on the Next.js origin (same origin as the browser). A route
// handler proxies /api/auth/* to the Express server that owns Better Auth.
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

/** Roles used by the app. `pending` means a Google user has not picked yet. */
export type UserRole = "customer" | "vendor" | "pending";

export function redirectPathForRole(role?: UserRole | string | null): string {
  return role === "vendor" ? "/vendor" : role === "customer" ? "/customer" : "/complete-profile";
}
