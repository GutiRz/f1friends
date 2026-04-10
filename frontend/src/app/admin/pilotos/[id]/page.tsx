import { redirect, notFound } from "next/navigation";
import { getAdminPiloto } from "@/lib/admin-api";
import { PilotoEditForm } from "./edit-form";
import PageHeader from "@/components/admin/page-header";
import { FormCard } from "@/components/admin/form-components";

export default async function AdminPilotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);

  if (!numId || numId < 1) notFound();

  let piloto;
  try {
    piloto = await getAdminPiloto(numId);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") redirect("/admin/login");
      if (err.message === "NOT_FOUND") notFound();
    }
    throw err;
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <PageHeader title={piloto.nombre_publico} backHref="/admin/pilotos" backLabel="Pilotos" />
      <FormCard>
        <PilotoEditForm piloto={piloto} />
      </FormCard>
    </div>
  );
}
