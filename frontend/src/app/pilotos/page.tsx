import { Fragment } from "react";
import { getPilotosDeTemporada, getTemporadaActivaId, getEquipos } from "@/lib/api/f1friends-api";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";
import { EquipoNombre } from "@/components/equipos/equipo-nombre";
import type { Equipo } from "@/types/equipo";
import type { PilotoDeTemporada } from "@/lib/api/f1friends-api";

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export const metadata = {
  title: "Parrilla — F1 Friends",
};

export default async function PilotosPage({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const activaId = await getTemporadaActivaId();
  const temporadaId = parseTemporadaId(temporada, activaId);

  const [pilotos, equipos] = await Promise.all([
    getPilotosDeTemporada(temporadaId).catch(() => []),
    getEquipos().catch(() => []),
  ]);

  const equipoMap = new Map(equipos.map((e) => [e.id, e]));
  const titulares = pilotos.filter((p) => p.tipo === "titular");
  const reservas = pilotos.filter((p) => p.tipo === "reserva");

  // Agrupa titulares por equipo preservando el orden del backend
  const grupos = new Map<number, { equipo: Equipo | null; pilotos: PilotoDeTemporada[] }>();
  for (const p of titulares) {
    const key = p.equipo_id ?? -1;
    if (!grupos.has(key)) {
      grupos.set(key, { equipo: p.equipo_id ? (equipoMap.get(p.equipo_id) ?? null) : null, pilotos: [] });
    }
    grupos.get(key)!.pilotos.push(p);
  }

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem" }}>
        <h1>Parrilla</h1>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "0.9rem" }}>
          Temporada {temporadaId}
        </p>

        {pilotos.length === 0 ? (
          <p style={{ marginTop: "1.5rem", color: "#666" }}>
            No hay pilotos asignados a esta temporada.
          </p>
        ) : (
          <table style={{ borderCollapse: "collapse", marginTop: "1.5rem", width: "100%" }}>
            <thead>
              <tr>
                <th style={th}>Nº</th>
                <th style={th}>Piloto</th>
                <th style={th}>Equipo</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(grupos.values()).map(({ equipo, pilotos: pGroup }) => (
                <Fragment key={equipo?.id ?? -1}>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        padding: "6px 12px",
                        background: equipo?.color ?? "#f0f0f0",
                        color: equipo?.color ? "#fff" : "#333",
                        fontWeight: "bold",
                        fontSize: 13,
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      {equipo ? <EquipoNombre equipo={equipo} logoHeight={18} /> : "Sin equipo"}
                    </td>
                  </tr>
                  {pGroup.map((p) => (
                    <tr key={p.piloto_id}>
                      <td style={td}>{p.numero ?? "—"}</td>
                      <td style={td}>{p.nombre_publico}</td>
                      <td style={td}>
                        {equipo ? <EquipoNombre equipo={equipo} logoHeight={20} /> : "—"}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}

              {reservas.length > 0 && (
                <Fragment key="reservas">
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        padding: "6px 12px",
                        background: "#e8e8e8",
                        fontWeight: "bold",
                        fontSize: 13,
                        borderBottom: "1px solid #ddd",
                        color: "#333",
                      }}
                    >
                      Reservas
                    </td>
                  </tr>
                  {reservas.map((p) => (
                    <tr key={p.piloto_id}>
                      <td style={td}>{p.numero ?? "—"}</td>
                      <td style={td}>{p.nombre_publico}</td>
                      <td style={td}>—</td>
                    </tr>
                  ))}
                </Fragment>
              )}
            </tbody>
          </table>
        )}
      </main>
    </>
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
