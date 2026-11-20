import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Payment complete — MatriMap",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CircleCheck className="mx-auto size-10 text-primary" />
          <CardTitle>Payment complete</CardTitle>
          <CardDescription>Your Stripe Checkout session finished successfully.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {session_id && (
            <p className="w-full truncate rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              {session_id}
            </p>
          )}
          <Link href="/dashboard" className={cn(buttonVariants())}>
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
