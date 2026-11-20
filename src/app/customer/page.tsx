import { RoleLanding } from "@/components/role-landing";

export const metadata = {
  title: "Customer — MatriMap",
};

export default async function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  return <RoleLanding role="customer" showWelcome={welcome === "1"} />;
}
