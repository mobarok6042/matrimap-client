import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
