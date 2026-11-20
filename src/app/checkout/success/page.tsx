import { PaymentSuccessDetails } from "@/components/payment-success-details";

export const metadata = {
  title: "Payment successful",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  return <PaymentSuccessDetails sessionId={session_id ?? null} />;
}
