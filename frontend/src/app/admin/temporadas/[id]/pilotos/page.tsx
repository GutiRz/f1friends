import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminAsignaciones, getAdminPilotos, getAdminTemporada } from "@/lib/admin-api";
import { getEquipos } from "@/lib/api/f1friends-api";
import { NuevaAsignacionForm } from "./nueva-asignacion-form";
import type { AsignacionVigente } from "@/types/asignacion";

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

  const pilotoMap = new Map(pilotos.map((p) => [p.id, p.nombre_publico]));
  const equipoMap = new Map(equipos.map((e) => [e.id, e.nombre]));
  const pilotosAsignados = new Set(asignaciones.map((a) => a.piloto_id));

  const titulares = asignaciones.filter((a) => a.tipo === "titular");
  const reservas = asignaciones.filter((a) => a.tipo === "reserva");

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href={`/admin/temporadas/${temporadaId}`}>← {temporada.nombre}</Link>
      </nav>
      <h1>Pilotos — {temporada.nombre}</h1>

      <h2 style={{ marginTop: 24 }}>Añadir piloto</h2>
      <NuevaAsignacionForm
        temporadaId={temporadaId}
        pilotos={pilotos}
        equipos={equipos}
        pilotosAsignados={pilotosAsignados}
      />

      <h2>Titulares ({titulares.length})</h2>
      {titulares.length === 0 ? (
        <p style={{ color: "#666" }}>No hay titulares asignados.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
          <thead>
            <tr>
              <th style={th}>Piloto</th>
              <th style={th}>Equipo</th>
            </tr>
          </thead>
          <tbody>
            {titulares.map((a) => (
              <tr key={a.id}>
                <td style={td}>{pilotoMap.get(a.piloto_id) ?? `#${a.piloto_id}`}</td>
                <td style={td}>{a.equipo_id ? (equipoMap.get(a.equipo_id) ?? `#${a.equipo_id}`) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Reservas ({reservas.length})</h2>
      {reservas.length === 0 ? (
        <p style={{ color: "#666" }}>No hay reservas asignadas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Piloto</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((a) => (
              <tr key={a.id}>
                <td style={td}>{pilotoMap.get(a.piloto_id) ?? `#${a.piloto_id}`}</td>
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
