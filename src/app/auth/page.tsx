import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign in — MatriMap",
};

export default function AuthPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <AuthForm />
    </main>
  );
}
