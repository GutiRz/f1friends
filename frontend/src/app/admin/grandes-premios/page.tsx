import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminGrandesPremios } from "@/lib/admin-api";
import { parseTemporadaId } from "@/lib/temporada";
import type { GranPremio } from "@/types/gran-premio";

interface Props {
  searchParams: Promise<{ temporada?: string }>;
}

const ESTADO_LABEL: Record<GranPremio["estado"], string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  completado: "Completado",
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
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <style>{`
        .admin-table tbody tr:hover td { background: #f5f5f5; }
        .admin-table tbody tr { cursor: pointer; }
        .row-link { display: block; padding: 8px 12px; color: inherit; text-decoration: none; }
      `}</style>
      <nav style={{ marginBottom: 24 }}>
        <Link href="/admin">← Panel admin</Link>
      </nav>

      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Grandes Premios — Temporada {temporadaId}</h1>
        <Link href={`/admin/grandes-premios/nuevo?temporada=${temporadaId}`}>
          + Nuevo GP
        </Link>
      </div>

      {gps.length === 0 ? (
        <p>No hay grandes premios para esta temporada.</p>
      ) : (
        <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={th}>Nombre</th>
              <th style={th}>Circuito</th>
              <th style={th}>País</th>
              <th style={th}>Fecha</th>
              <th style={th}>Sprint</th>
              <th style={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {gps.map((gp) => {
              const href = `/admin/grandes-premios/${gp.id}?temporada=${temporadaId}`;
              return (
                <tr key={gp.id}>
                  <td style={td0}><Link href={href} className="row-link">{gp.orden}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{gp.nombre}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{gp.circuito ?? "—"}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{gp.pais ?? "—"}</Link></td>
                  <td style={td0}>
                    <Link href={href} className="row-link">
                      {gp.fecha ? new Date(gp.fecha).toLocaleDateString("es-ES") : "—"}
                    </Link>
                  </td>
                  <td style={td0}><Link href={href} className="row-link">{gp.tiene_sprint ? "Sí" : "No"}</Link></td>
                  <td style={td0}><Link href={href} className="row-link">{ESTADO_LABEL[gp.estado]}</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "2px solid #ccc",
};

const td0: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: 0,
};
