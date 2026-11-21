"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { apiFetch, getAuthErrorMessage, getUserFacingError } from "@/lib/api";
import { authClient, signIn, signUp } from "@/lib/auth-client";
import { showErrorAlert, showSuccessAlert, showWarningAlert } from "@/lib/alerts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "sign-in" | "sign-up";

const PASSWORD_RULE_MESSAGE =
  "Password must be at least 6 characters and contain one uppercase and one lowercase letter.";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-4">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.6.27-3.14.77-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function AuthForm({
  initialMode = "sign-in",
  initialError,
}: {
  initialMode?: Mode;
  initialError?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"customer" | "vendor">("customer");
  const [image, setImage] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(initialError ?? null);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const passwordChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "sign-up" && !passwordValid) {
      setError(PASSWORD_RULE_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      if (mode === "sign-up") {
        const result = await signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        } as unknown as Parameters<typeof signUp.email>[0]);

        if (result.error) {
          await showErrorAlert(
            getAuthErrorMessage(result.error.message, "We could not create your account. Please try again."),
            "Account creation failed",
          );
          return;
        }

        // The account is now authenticated, so the protected upload endpoint
        // accepts the optional profile image. A missing ImgBB key must not
        // block registration.
        let imageUploadFailed = false;
        if (image) {
          try {
            const form = new FormData();
            form.append("image", image);
            const uploaded = await apiFetch<{ displayUrl?: string; url?: string }>(
              "/api/upload/image",
              { method: "POST", body: form },
            );
            const imageUrl = uploaded.displayUrl ?? uploaded.url;
            if (imageUrl) {
              const updateResult = await authClient.updateUser({ image: imageUrl });
              if (updateResult.error) {
                throw new Error(
                  getAuthErrorMessage(updateResult.error.message, "We could not save your profile photo."),
                );
              }
            }
          } catch (caught) {
            console.warn("[matrimap:auth] Optional profile image upload failed", caught);
            imageUploadFailed = true;
          }
        }

        if (imageUploadFailed) {
          void showWarningAlert("Account created", "Your profile photo could not be uploaded.");
        } else {
          void showSuccessAlert("Account created", "Welcome to MatriMap.");
        }
        router.push(`/${role}?welcome=1`);
        router.refresh();
        return;
      }

      const result = await signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        await showErrorAlert(
          getAuthErrorMessage(result.error.message, "We could not sign you in. Please try again."),
          "Sign-in failed",
        );
        return;
      }

      void showSuccessAlert("Signed in", "Welcome back to MatriMap.");
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      await showErrorAlert(
        getUserFacingError(caught, "We could not complete sign-in. Please try again."),
        "Sign-in failed",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);

    try {
      const callbackURL = `${window.location.origin}/complete-profile`;
      const result = await signIn.social({
        provider: "google",
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL: `${window.location.origin}/auth?mode=sign-in&error=google`,
      });

      if (result.error) {
        await showErrorAlert(
          getAuthErrorMessage(result.error.message, "Google sign-in is unavailable right now. Please try again later."),
          "Google sign-in failed",
        );
        setGoogleLoading(false);
      }
    } catch (caught) {
      await showErrorAlert(
        getUserFacingError(caught, "Google sign-in is unavailable right now. Please try again later."),
        "Google sign-in failed",
      );
      setGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "sign-in" ? "Welcome back" : "Create your account"}</CardTitle>
        <CardDescription>
          {mode === "sign-in"
            ? "Sign in to manage your MatriMap profile."
            : "Get started — it only takes a minute."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "sign-up" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ayesha Rahman"
                  autoComplete="name"
                  required
                  minLength={2}
                />
              </div>

              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">Account role</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["customer", "vendor"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={role === option ? "default" : "outline"}
                      aria-pressed={role === option}
                      onClick={() => setRole(option)}
                      className="w-full capitalize"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              minLength={mode === "sign-up" ? 6 : undefined}
              required
            />
            {mode === "sign-up" && (
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <li className={passwordChecks.length ? "text-primary" : ""}>
                  <RuleIcon ok={passwordChecks.length} /> At least 6 characters
                </li>
                <li className={passwordChecks.uppercase ? "text-primary" : ""}>
                  <RuleIcon ok={passwordChecks.uppercase} /> One uppercase letter
                </li>
                <li className={passwordChecks.lowercase ? "text-primary" : ""}>
                  <RuleIcon ok={passwordChecks.lowercase} /> One lowercase letter
                </li>
              </ul>
            )}
          </div>

          {mode === "sign-up" && (
            <div className="grid gap-2">
              <Label htmlFor="image">Profile image (optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                className="cursor-pointer"
              />
              {image && <p className="text-xs text-muted-foreground">Selected: {image.name}</p>}
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading || googleLoading} className="w-full">
            {loading && <Loader2 className="size-4 animate-spin" />}
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or continue with
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={loading || googleLoading}
        >
          {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
          Google
        </Button>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "sign-in" ? "New to MatriMap?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="font-medium text-primary underline-offset-4 hover:underline"
            onClick={() => switchMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </CardContent>
    </Card>
  );
}

function RuleIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="mr-1 inline size-3" aria-label="met" />
  ) : (
    <X className="mr-1 inline size-3" aria-label="not met" />
  );
}
