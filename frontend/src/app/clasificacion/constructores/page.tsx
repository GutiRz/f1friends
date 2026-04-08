import { getClasificacionConstructores, getTemporadaActivaId, getEquipos } from "@/lib/api/f1friends-api";
import type { ClasificacionConstructor } from "@/types/clasificacion";
import TablaClasificacionConstructores from "@/components/clasificacion/tabla-clasificacion-constructores";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";

export const metadata = {
  title: "Clasificación de constructores — F1 Friends",
};

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export default async function ClasificacionConstructoresPage({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const activaId = await getTemporadaActivaId();
  const temporadaId = parseTemporadaId(temporada, activaId);

  let constructores: ClasificacionConstructor[] = [];
  let error: string | null = null;

  try {
    constructores = await getClasificacionConstructores(temporadaId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const equipos = await getEquipos().catch(() => []);
  const equipoMap = new Map(equipos.map((e) => [e.id, e]));

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem" }}>
        <h1>Clasificación de constructores</h1>
        <p style={{ marginTop: "0.25rem", color: "#666", fontSize: "0.9rem" }}>
          Temporada {temporadaId}
        </p>

        {error ? (
          <p style={{ marginTop: "1.5rem", color: "#c00" }}>
            No se pudo cargar la clasificación: {error}
          </p>
        ) : constructores.length === 0 ? (
          <p style={{ marginTop: "1.5rem", color: "#666" }}>
            No hay resultados disponibles.
          </p>
        ) : (
          <TablaClasificacionConstructores constructores={constructores} equipoMap={equipoMap} />
        )}
      </main>
    </>
  );
}
