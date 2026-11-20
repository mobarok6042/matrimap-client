import Link from "next/link";
import { CircleX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Payment cancelled",
};

export default function CheckoutCancelPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CircleX className="mx-auto size-10 text-muted-foreground" />
          <CardTitle>Checkout cancelled</CardTitle>
          <CardDescription>No charge was made. You can try again whenever you like.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
