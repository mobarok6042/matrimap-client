import { ServiceForm } from "../../add/service-form-page";

export const metadata = {
  title: "Edit service",
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceForm serviceId={id} />;
}
