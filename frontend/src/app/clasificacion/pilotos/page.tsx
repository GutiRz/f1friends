import { getClasificacionPilotos, getTemporadaActivaId, getPilotosDeTemporada, getEquipos } from "@/lib/api/f1friends-api";
import type { ClasificacionPiloto } from "@/types/clasificacion";
import TablaClasificacionPilotos from "@/components/clasificacion/tabla-clasificacion-pilotos";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";

export const metadata = {
  title: "Clasificación de pilotos — F1 Friends",
};

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export default async function ClasificacionPilotosPage({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const activaId = await getTemporadaActivaId();
  const temporadaId = parseTemporadaId(temporada, activaId);

  let pilotos: ClasificacionPiloto[] = [];
  let error: string | null = null;

  try {
    pilotos = await getClasificacionPilotos(temporadaId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const [pilotosTemporada, equipos] = await Promise.all([
    getPilotosDeTemporada(temporadaId).catch(() => []),
    getEquipos().catch(() => []),
  ]);

  const equipoById = new Map(equipos.map((e) => [e.id, e]));
  // piloto_id → Equipo
  const pilotoEquipoMap = new Map(
    pilotosTemporada
      .filter((p) => p.equipo_id != null)
      .map((p) => [p.piloto_id, equipoById.get(p.equipo_id!)!])
      .filter(([, eq]) => eq != null)
  );

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem" }}>
          <h1>Clasificación de pilotos</h1>
        <p style={{ marginTop: "0.25rem", color: "#9ca3af", fontSize: "0.9rem" }}>
          Temporada {temporadaId}
        </p>

        {error ? (
          <p style={{ marginTop: "1.5rem", color: "#c00" }}>
            No se pudo cargar la clasificación: {error}
          </p>
        ) : pilotos.length === 0 ? (
          <p style={{ marginTop: "1.5rem", color: "#9ca3af" }}>
            No hay resultados disponibles.
          </p>
        ) : (
          <TablaClasificacionPilotos pilotos={pilotos} pilotoEquipoMap={pilotoEquipoMap} />
        )}
      </main>
    </>
  );
}
