import { ServiceForm } from "../../add/page";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceForm serviceId={id} />;
}
