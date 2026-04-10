import { redirect, notFound } from "next/navigation";
import { getAdminGranPremio, getAdminSesiones, getAdminInscripciones, getAdminPilotos } from "@/lib/admin-api";
import { getEquipos } from "@/lib/api/f1friends-api";
import { parseTemporadaId } from "@/lib/temporada";
import type { Sesion } from "@/types/sesion";
import { GranPremioEditForm } from "./edit-form";
import { InscripcionesTable } from "./inscripciones-table";
import PageHeader from "@/components/admin/page-header";
import { AdminCard, adminTh, adminTableStyles } from "@/components/admin/admin-table";
import { FormCard } from "@/components/admin/form-components";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ temporada?: string }>;
}

const TIPO_SESION_LABEL: Record<Sesion["tipo"], string> = {
  qualy: "Clasificación",
  sprint_qualy: "Sprint Qualy",
  sprint: "Sprint",
  carrera: "Carrera",
};

const ESTADO_SESION_BADGE: Record<Sesion["estado"], { label: string; bg: string; color: string }> = {
  pendiente: { label: "Pendiente", bg: "#fef9c3", color: "#854d0e" },
  completada: { label: "Completada", bg: "#dcfce7", color: "#16a34a" },
};

async function handleFetch<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") redirect("/admin/login");
      if (err.message === "NOT_FOUND") notFound();
    }
    throw err;
  }
}

export default async function AdminGranPremioDetallePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { temporada } = await searchParams;
  const gpId = Number(id);
  const temporadaId = parseTemporadaId(temporada);

  if (!Number.isInteger(gpId) || gpId < 1) notFound();

  const [gp, sesiones, inscripciones, pilotos, equipos] = await Promise.all([
    handleFetch(() => getAdminGranPremio(gpId)),
    handleFetch(() => getAdminSesiones(gpId)),
    handleFetch(() => getAdminInscripciones(gpId)),
    getAdminPilotos(),
    getEquipos(),
  ]);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <style>{adminTableStyles}</style>
      <PageHeader
        title={gp.nombre}
        backHref={`/admin/grandes-premios?temporada=${temporadaId}`}
        backLabel="Grandes Premios"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FormCard>
          <GranPremioEditForm gp={gp} />
        </FormCard>

        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a", margin: "0 0 12px" }}>Sesiones</h2>
          {sesiones.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No hay sesiones creadas para este Gran Premio.</p>
          ) : (
            <AdminCard>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={adminTh}>Tipo</th>
                    <th style={adminTh}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {sesiones.map((s) => {
                    const badge = ESTADO_SESION_BADGE[s.estado];
                    return (
                      <tr key={s.id}>
                        <td style={{ padding: "12px 16px", fontSize: "0.875rem", borderBottom: "1px solid #f1f5f9" }}>
                          {TIPO_SESION_LABEL[s.tipo]}
                        </td>
                        <td style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
                          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 500, background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </AdminCard>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#0f172a", margin: "0 0 12px" }}>Inscripciones</h2>
          <InscripcionesTable inscripciones={inscripciones} pilotos={pilotos} equipos={equipos} />
        </div>
      </div>
    </div>
  );
}
