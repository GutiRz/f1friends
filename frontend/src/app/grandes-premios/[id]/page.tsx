import { getGranPremioById, getSesionesByGranPremioId, getTemporadaActivaId } from "@/lib/api/f1friends-api";
import type { GranPremio } from "@/types/gran-premio";
import type { SesionConResultados } from "@/types/sesion";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";
import SesionesGranPremio from "@/components/grandes-premios/sesiones-gran-premio";

export const metadata = {
  title: "Detalle GP — F1 Friends",
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ temporada?: string }>;
};

const ESTADO_LABEL: Record<GranPremio["estado"], string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  completado: "Completado",
};

export default async function GranPremioPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { temporada } = await searchParams;
  const activaId = await getTemporadaActivaId();
  const temporadaId = parseTemporadaId(temporada, activaId);
  const gpId = Number(id);

  let gp: GranPremio | null = null;
  let gpError: string | null = null;
  let sesiones: SesionConResultados[] = [];
  let sesionesError: string | null = null;

  if (!Number.isInteger(gpId) || gpId <= 0) {
    gpError = "ID de gran premio no válido";
  } else {
    try {
      gp = await getGranPremioById(gpId);
    } catch (e) {
      gpError = e instanceof Error ? e.message : "Error desconocido";
    }

    if (gp !== null) {
      try {
        sesiones = await getSesionesByGranPremioId(gpId);
      } catch (e) {
        sesionesError = e instanceof Error ? e.message : "Error desconocido";
      }
    }
  }

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem" }}>
        {gpError ? (
          <p style={{ color: "#c00" }}>
            No se pudo cargar el gran premio: {gpError}
          </p>
        ) : gp === null ? (
          <p style={{ color: "#9ca3af" }}>Gran premio no encontrado.</p>
        ) : (
          <>
            <h1>{gp.nombre}</h1>
            <p style={{ marginTop: "0.25rem", color: "#9ca3af", fontSize: "0.9rem" }}>
              Temporada {gp.temporada_id}
            </p>

            <dl style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.5rem 1.5rem" }}>
              <dt style={{ color: "#9ca3af" }}>Ronda</dt>
              <dd>{gp.orden}</dd>

              <dt style={{ color: "#9ca3af" }}>Circuito</dt>
              <dd>{gp.circuito ?? "—"}</dd>

              <dt style={{ color: "#9ca3af" }}>País</dt>
              <dd>{gp.pais ?? "—"}</dd>

              <dt style={{ color: "#9ca3af" }}>Fecha</dt>
              <dd>
                {gp.fecha
                  ? new Date(gp.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </dd>

              <dt style={{ color: "#9ca3af" }}>Estado</dt>
              <dd>{ESTADO_LABEL[gp.estado]}</dd>

              <dt style={{ color: "#9ca3af" }}>Sprint</dt>
              <dd>{gp.tiene_sprint ? "Sí" : "No"}</dd>
            </dl>

            {sesionesError ? (
              <p style={{ marginTop: "2rem", color: "#c00" }}>
                No se pudieron cargar las sesiones: {sesionesError}
              </p>
            ) : (
              <SesionesGranPremio sesiones={sesiones} />
            )}
          </>
        )}
      </main>
    </>
  );
}
