import { redirect, notFound } from "next/navigation";
import { getAdminAsignaciones, getAdminPilotos, getAdminTemporada } from "@/lib/admin-api";
import { getEquipos } from "@/lib/api/f1friends-api";
import { NuevaAsignacionForm } from "./nueva-asignacion-form";
import { AsignacionesTable } from "./asignaciones-table";
import type { AsignacionVigente } from "@/types/asignacion";
import PageHeader from "@/components/admin/page-header";
import { AdminCard } from "@/components/admin/admin-table";
import { FormCard } from "@/components/admin/form-components";

export default async function AdminTemporadaPilotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const temporadaId = Number(id);
  if (!temporadaId || temporadaId < 1) notFound();

  let asignaciones: AsignacionVigente[];
  let temporada: Awaited<ReturnType<typeof getAdminTemporada>>;

  try {
    [asignaciones, temporada] = await Promise.all([
      getAdminAsignaciones(temporadaId),
      getAdminTemporada(temporadaId),
    ]);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") redirect("/admin/login");
      if (err.message === "NOT_FOUND") notFound();
    }
    throw err;
  }

  const [pilotos, equipos] = await Promise.all([
    getAdminPilotos(),
    getEquipos(),
  ]);

  const pilotoMap = Object.fromEntries(pilotos.map((p) => [p.id, p.nombre_publico]));
  const pilotosAsignados = new Set(asignaciones.map((a) => a.piloto_id));

  return (
    <div style={{ maxWidth: 700 }}>
      <PageHeader
        title="Parrilla"
        backHref={`/admin/temporadas/${temporadaId}`}
        backLabel={temporada.nombre}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FormCard>
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 14px" }}>
            Añadir piloto
          </h2>
          <NuevaAsignacionForm
            temporadaId={temporadaId}
            pilotos={pilotos}
            equipos={equipos}
            pilotosAsignados={pilotosAsignados}
          />
        </FormCard>

        <div>
          <h2 style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>
            Parrilla
          </h2>
          <AsignacionesTable
            temporadaId={temporadaId}
            asignaciones={asignaciones}
            pilotoMap={pilotoMap}
            equipos={equipos}
          />
        </div>
      </div>
    </div>
  );
}
