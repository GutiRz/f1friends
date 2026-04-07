import { getGranPremioById } from "@/lib/api/f1friends-api";
import type { GranPremio } from "@/types/gran-premio";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";

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
  const temporadaId = parseTemporadaId(temporada);
  const gpId = parseInt(id, 10);

  let gp: GranPremio | null = null;
  let error: string | null = null;

  if (!Number.isInteger(gpId) || gpId <= 0) {
    error = "ID de gran premio no válido";
  } else {
    try {
      gp = await getGranPremioById(gpId);
    } catch (e) {
      error = e instanceof Error ? e.message : "Error desconocido";
    }
  }

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem" }}>
        {error ? (
          <p style={{ color: "#c00" }}>
            No se pudo cargar el gran premio: {error}
          </p>
        ) : gp === null ? (
          <p style={{ color: "#666" }}>Gran premio no encontrado.</p>
        ) : (
          <>
            <h1>{gp.nombre}</h1>
            <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "0.9rem" }}>
              Temporada {temporadaId}
            </p>

            <dl style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.5rem 1.5rem" }}>
              <dt style={{ color: "#666" }}>Ronda</dt>
              <dd>{gp.orden}</dd>

              <dt style={{ color: "#666" }}>Circuito</dt>
              <dd>{gp.circuito ?? "—"}</dd>

              <dt style={{ color: "#666" }}>País</dt>
              <dd>{gp.pais ?? "—"}</dd>

              <dt style={{ color: "#666" }}>Fecha</dt>
              <dd>
                {gp.fecha
                  ? new Date(gp.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </dd>

              <dt style={{ color: "#666" }}>Estado</dt>
              <dd>{ESTADO_LABEL[gp.estado]}</dd>

              <dt style={{ color: "#666" }}>Sprint</dt>
              <dd>{gp.tiene_sprint ? "Sí" : "No"}</dd>
            </dl>
          </>
        )}
      </main>
    </>
  );
}
