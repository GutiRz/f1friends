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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
            {gps.map((gp) => (
              <tr key={gp.id}>
                <td style={td}>{gp.orden}</td>
                <td style={td}>
                  <Link href={`/admin/grandes-premios/${gp.id}?temporada=${temporadaId}`}>
                    {gp.nombre}
                  </Link>
                </td>
                <td style={td}>{gp.circuito ?? "—"}</td>
                <td style={td}>{gp.pais ?? "—"}</td>
                <td style={td}>
                  {gp.fecha
                    ? new Date(gp.fecha).toLocaleDateString("es-ES")
                    : "—"}
                </td>
                <td style={td}>{gp.tiene_sprint ? "Sí" : "No"}</td>
                <td style={td}>{ESTADO_LABEL[gp.estado]}</td>
              </tr>
            ))}
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

const td: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};
