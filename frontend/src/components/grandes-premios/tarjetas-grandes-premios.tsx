"use client";

import Link from "next/link";
import type { GranPremio } from "@/types/gran-premio";
import { banderaUrl, circuitoSlug } from "@/lib/gp-utils";

type Props = {
  grandesPremios: GranPremio[];
  temporadaId: number;
};

function formatFecha(fecha?: string): string {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TarjetasGrandesPremios({ grandesPremios, temporadaId }: Props) {
  const proximaId =
    grandesPremios.find((gp) => gp.estado === "en_curso")?.id ??
    grandesPremios.find((gp) => gp.estado === "pendiente")?.id;

  return (
    <>
      <style>{`
        .gp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 2rem;
        }
        @media (max-width: 900px) { .gp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .gp-grid { grid-template-columns: 1fr; } }

        .gp-card {
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          border: 1px solid #2a2a35;
          background: #111118;
          transition: border-color 0.15s, background 0.15s;
          overflow: hidden;
          min-height: 160px;
        }
        .gp-card:hover { border-color: #3a3a48; background: #16161e; }
        .gp-card.proxima { background: #e10600; border-color: #e10600; color: #fff; }
        .gp-card.proxima:hover { background: #c90500; border-color: #c90500; }
        .gp-card.pendiente { background: #0e0e15; border-color: #222230; }
        .gp-card.pendiente .gp-nombre { color: #9ca3af; }
        .gp-card.pendiente .gp-meta { color: #6b7280; }

        .gp-top {
          padding: 14px 16px 10px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .gp-ronda {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 0.55;
          margin-bottom: 6px;
        }
        .gp-titulo {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .gp-bandera {
          width: 20px;
          height: 14px;
          object-fit: cover;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .gp-nombre {
          font-size: 1.05rem;
          font-weight: 700;
          line-height: 1.2;
        }
        .gp-meta {
          font-size: 0.78rem;
          opacity: 0.65;
          margin-top: 2px;
          padding-left: 28px;
        }

        .gp-circuit-area {
          flex-shrink: 0;
          width: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px 0 0;
        }
        .gp-circuit-img {
          width: 80px;
          height: 60px;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.5;
        }
        .gp-card.proxima .gp-circuit-img { opacity: 0.4; }

        .gp-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 16px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .gp-card.proxima .gp-footer { border-top-color: rgba(255,255,255,0.2); }
        .gp-fecha {
          font-size: 0.8rem;
          font-weight: 600;
          opacity: 0.85;
        }
        .gp-badges { display: flex; gap: 5px; align-items: center; }
        .gp-badge {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 20px;
        }
        .gp-badge.sprint { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); }
        .gp-badge.proxima-label { background: #fff; color: #e10600; }
        .gp-badge.completada-label { background: rgba(255,255,255,0.06); color: #6b7280; }
      `}</style>

      <div className="gp-grid">
        {grandesPremios.map((gp) => {
          const isProxima = gp.id === proximaId;
          const cls = isProxima ? "proxima" : gp.estado === "completado" ? "completada" : "pendiente";
          const bandera = banderaUrl(gp.pais);
          const slug = circuitoSlug(gp.circuito);
          const circuitoSrc = slug ? `/images/circuitos/${slug}.svg` : null;

          return (
            <Link
              key={gp.id}
              href={`/grandes-premios/${gp.id}?temporada=${temporadaId}`}
              className={`gp-card ${cls}`}
            >
              <div className="gp-top">
                <div className="gp-ronda">Ronda {gp.orden}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="gp-titulo">
                      {bandera && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bandera} alt={gp.pais} className="gp-bandera" />
                      )}
                      <span className="gp-nombre">{gp.nombre}</span>
                    </div>
                    {gp.circuito && (
                      <div className="gp-meta">{gp.circuito}</div>
                    )}
                  </div>
                  {circuitoSrc && (
                    <div className="gp-circuit-area">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={circuitoSrc}
                        alt={gp.circuito ?? ""}
                        className="gp-circuit-img"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="gp-footer">
                <span className="gp-fecha">{formatFecha(gp.fecha)}</span>
                <span className="gp-badges">
                  {gp.tiene_sprint && <span className="gp-badge sprint">Sprint</span>}
                  {isProxima && <span className="gp-badge proxima-label">Próxima</span>}
                  {gp.estado === "completado" && <span className="gp-badge completada-label">Completado</span>}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
