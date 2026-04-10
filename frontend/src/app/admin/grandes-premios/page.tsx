import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminGrandesPremios } from "@/lib/admin-api";
import { parseTemporadaId } from "@/lib/temporada";
import type { GranPremio } from "@/types/gran-premio";
import PageHeader from "@/components/admin/page-header";
import { AdminCard, adminTh, adminTd, adminTableStyles } from "@/components/admin/admin-table";

interface Props {
  searchParams: Promise<{ temporada?: string }>;
}

const ESTADO_BADGE: Record<GranPremio["estado"], { label: string; bg: string; color: string }> = {
  pendiente: { label: "Pendiente", bg: "#fef9c3", color: "#854d0e" },
  en_curso: { label: "En curso", bg: "#dbeafe", color: "#1d4ed8" },
  completado: { label: "Completado", bg: "#dcfce7", color: "#16a34a" },
};

export default async function AdminGrandesPremiosPage({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const temporadaId = parseTemporadaId(temporada);

  let gps: GranPremio[];
  try {
    gps = await getAdminGrandesPremios(temporadaId);
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      redirect("/admin/login");
    }
    throw err;
  }

  return (
    <div>
      <style>{adminTableStyles}</style>
      <PageHeader
        title={`Grandes Premios — Temporada ${temporadaId}`}
        newHref={`/admin/grandes-premios/nuevo?temporada=${temporadaId}`}
        newLabel="Nuevo GP"
      />
      {gps.length === 0 ? (
        <p style={{ color: "#64748b" }}>No hay grandes premios para esta temporada.</p>
      ) : (
        <AdminCard>
          <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={adminTh}>#</th>
                <th style={adminTh}>Nombre</th>
                <th style={adminTh}>Circuito</th>
                <th style={adminTh}>País</th>
                <th style={adminTh}>Fecha</th>
                <th style={adminTh}>Sprint</th>
                <th style={adminTh}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {gps.map((gp) => {
                const href = `/admin/grandes-premios/${gp.id}?temporada=${temporadaId}`;
                const badge = ESTADO_BADGE[gp.estado];
                return (
                  <tr key={gp.id}>
                    <td style={adminTd}><Link href={href} className="row-link" style={{ color: "#94a3b8" }}>{gp.orden}</Link></td>
                    <td style={adminTd}><Link href={href} className="row-link" style={{ fontWeight: 500 }}>{gp.nombre}</Link></td>
                    <td style={adminTd}><Link href={href} className="row-link">{gp.circuito ?? "—"}</Link></td>
                    <td style={adminTd}><Link href={href} className="row-link">{gp.pais ?? "—"}</Link></td>
                    <td style={adminTd}>
                      <Link href={href} className="row-link">
                        {gp.fecha ? new Date(gp.fecha).toLocaleDateString("es-ES") : "—"}
                      </Link>
                    </td>
                    <td style={adminTd}>
                      <Link href={href} className="row-link">
                        {gp.tiene_sprint ? (
                          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 500, background: "#ede9fe", color: "#7c3aed" }}>Sprint</span>
                        ) : "—"}
                      </Link>
                    </td>
                    <td style={adminTd}>
                      <Link href={href} className="row-link">
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 500, background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </AdminCard>
      )}
    </div>
  );
}
