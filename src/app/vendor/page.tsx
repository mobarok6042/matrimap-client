import { RoleLanding } from "@/components/role-landing";

export const metadata = {
  title: "Vendor",
};

export default async function VendorPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  return <RoleLanding role="vendor" showWelcome={welcome === "1"} />;
}
