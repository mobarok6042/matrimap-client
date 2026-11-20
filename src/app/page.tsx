import Link from "next/link";
import {
  CreditCard,
  Database,
  Fingerprint,
  Image as ImageIcon,
  Layers3,
  Sparkles,
} from "lucide-react";
import { Hero } from "@/components/hero";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Better Auth",
    description: "Email/password auth hosted on Express, stored in MongoDB.",
    icon: Fingerprint,
  },
  {
    title: "Stripe Checkout",
    description: "Hosted checkout sessions with signed webhook handling.",
    icon: CreditCard,
  },
  {
    title: "ImgBB hosting",
    description: "Server-side image uploads with validated MIME types.",
    icon: ImageIcon,
  },
  {
    title: "MongoDB + Mongoose",
    description: "Application models alongside the Better Auth adapter.",
    icon: Database,
  },
  {
    title: "ShadCN + HeroUI",
    description: "Own your primitives with ShadCN, move fast with HeroUI.",
    icon: Layers3,
  },
  {
    title: "Motion",
    description: "Lightweight, declarative animation across the UI.",
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything is wired up</h2>
          <p className="mt-2 text-muted-foreground">
            A working foundation for each service in the stack.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          Want to see it in action?{" "}
          <Link href="/dashboard" className="font-medium text-primary underline-offset-4 hover:underline">
            Open the dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
