import { redirect, notFound } from "next/navigation";
import { getAdminEquipo } from "@/lib/admin-api";
import { EquipoEditForm } from "./edit-form";
import PageHeader from "@/components/admin/page-header";
import { FormCard } from "@/components/admin/form-components";

export default async function AdminEquipoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);

  if (!numId || numId < 1) notFound();

  let equipo;
  try {
    equipo = await getAdminEquipo(numId);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") redirect("/admin/login");
      if (err.message === "NOT_FOUND") notFound();
    }
    throw err;
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <PageHeader title={equipo.nombre} backHref="/admin/equipos" backLabel="Equipos" />
      <FormCard>
        <EquipoEditForm equipo={equipo} />
      </FormCard>
    </div>
  );
}
