import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign in or sign up — MatriMap",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const { mode, error } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <AuthForm
        initialMode={mode === "sign-up" ? "sign-up" : "sign-in"}
        initialError={
          error === "google"
            ? "Google sign-in was cancelled or failed. Please try again."
            : undefined
        }
      />
    </main>
  );
}
