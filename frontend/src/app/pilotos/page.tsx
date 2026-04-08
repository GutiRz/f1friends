import { getPilotosDeTemporada, getTemporadaActivaId, getEquipos } from "@/lib/api/f1friends-api";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";
import type { Equipo } from "@/types/equipo";
import type { PilotoDeTemporada } from "@/lib/api/f1friends-api";

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export const metadata = {
  title: "Parrilla — F1 Friends",
};

/** /images/equipos/red-bull.svg → /images/coches/red-bull.png */
function getCarImagePath(logo?: string | null): string | null {
  if (!logo) return null;
  const match = logo.match(/\/images\/equipos\/(.+)\.\w+$/);
  if (!match) return null;
  return `/images/coches/${match[1]}.jpg`;
}

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
      <style>{`
        .parrilla-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 2rem;
        }
        @media (max-width: 640px) {
          .parrilla-grid { grid-template-columns: 1fr; }
        }
        .team-card {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          position: relative;
          min-height: 160px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .team-card-inner {
          padding: 18px 20px 0;
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .team-name {
          color: #fff;
          font-weight: 900;
          font-size: 1.25rem;
          letter-spacing: -0.3px;
          text-shadow: 0 1px 4px rgba(0,0,0,0.3);
          margin: 0 0 8px;
          line-height: 1.2;
        }
        .team-logo-circle {
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .driver-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.95);
          font-size: 0.92rem;
          font-weight: 600;
          text-shadow: 0 1px 3px rgba(0,0,0,0.3);
          margin-right: 16px;
        }
        .driver-pill-num {
          font-weight: 700;
          opacity: 0.65;
          font-size: 0.8rem;
        }
        .team-car-area {
          position: relative;
          height: 110px;
          margin-top: 4px;
          overflow: hidden;
          padding: 0 12px;
        }
        .team-car-img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center bottom;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));
        }
        .reservas-section {
          margin-top: 2.5rem;
        }
        .reservas-title {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 10px;
        }
        .reservas-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .reserva-card {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f4f4f4;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 0.88rem;
          color: #333;
        }
        .reserva-num {
          font-weight: 700;
          color: #bbb;
          font-size: 0.8rem;
        }
      `}</style>
      <main style={{ padding: "2rem", maxWidth: 960, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>Parrilla</h1>
        <p style={{ marginTop: "0.25rem", color: "#888", fontSize: "0.85rem", marginBottom: 0 }}>
          Temporada {temporadaId}
        </p>

        {pilotos.length === 0 ? (
          <p style={{ marginTop: "1.5rem", color: "#666" }}>
            No hay pilotos asignados a esta temporada.
          </p>
        ) : (
          <>
            <div className="parrilla-grid">
              {Array.from(grupos.values()).map(({ equipo, pilotos: pGroup }) => {
                const color = equipo?.color ?? "#555";
                const carSrc = getCarImagePath(equipo?.logo);
                return (
                  <div
                    key={equipo?.id ?? -1}
                    className="team-card"
                    style={{
                      background: `
                        linear-gradient(135deg,
                          rgba(255,255,255,0.22) 0%,
                          rgba(255,255,255,0.04) 45%,
                          rgba(0,0,0,0.28) 100%
                        ),
                        ${color}
                      `
                    }}
                  >
                    {/* Info superior */}
                    <div className="team-card-inner">
                      <div>
                        <p className="team-name">{equipo?.nombre ?? "Sin equipo"}</p>
                        <div>
                          {pGroup.map((p) => (
                            <span key={p.piloto_id} className="driver-pill">
                              {p.numero && <span className="driver-pill-num">{p.numero}</span>}
                              {p.nombre_publico}
                            </span>
                          ))}
                        </div>
                      </div>
                      {equipo?.logo && (
                        <div className="team-logo-circle">
                          <img
                            src={equipo.logo}
                            alt={equipo.nombre}
                            height={24}
                            style={{ objectFit: "contain" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Coche */}
                    <div className="team-car-area">
                      {carSrc && (
                        <img
                          src={carSrc}
                          alt={`Coche ${equipo?.nombre}`}
                          className="team-car-img"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {reservas.length > 0 && (
              <div className="reservas-section">
                <p className="reservas-title">Reservas</p>
                <div className="reservas-grid">
                  {reservas.map((p) => (
                    <div key={p.piloto_id} className="reserva-card">
                      {p.numero && <span className="reserva-num">{p.numero}</span>}
                      <span>{p.nombre_publico}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
