import { getPilotosDeTemporada, getTemporadaActivaId, getEquipos } from "@/lib/api/f1friends-api";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";
import { EquipoNombre } from "@/components/equipos/equipo-nombre";

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export const metadata = {
  title: "Pilotos — F1 Friends",
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

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem" }}>
        <h1>Pilotos</h1>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "0.9rem" }}>
          Temporada {temporadaId}
        </p>

        {pilotos.length === 0 ? (
          <p style={{ marginTop: "1.5rem", color: "#666" }}>
            No hay pilotos asignados a esta temporada.
          </p>
        ) : (
          <>
            <h2 style={{ marginTop: "1.5rem" }}>Titulares</h2>
            {titulares.length === 0 ? (
              <p style={{ color: "#666" }}>—</p>
            ) : (
              <table style={{ borderCollapse: "collapse", marginBottom: "1.5rem" }}>
                <thead>
                  <tr>
                    <th style={th}>Nº</th>
                    <th style={th}>Piloto</th>
                    <th style={th}>Equipo</th>
                  </tr>
                </thead>
                <tbody>
                  {titulares.map((p) => (
                    <tr key={p.piloto_id}>
                      <td style={td}>{p.numero ?? "—"}</td>
                      <td style={td}>{p.nombre_publico}</td>
                      <td style={td}>
                        {p.equipo_id
                          ? (() => { const eq = equipoMap.get(p.equipo_id); return eq ? <EquipoNombre equipo={eq} /> : `#${p.equipo_id}`; })()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h2>Reservas</h2>
            {reservas.length === 0 ? (
              <p style={{ color: "#666" }}>—</p>
            ) : (
              <table style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Piloto</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((p) => (
                    <tr key={p.piloto_id}>
                      <td style={td}>{p.nombre_publico}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
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
