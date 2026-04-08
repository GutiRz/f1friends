import Link from "next/link";
import {
  getClasificacionPilotos,
  getClasificacionConstructores,
  getTemporadaActivaId,
  getPilotosDeTemporada,
  getEquipos,
} from "@/lib/api/f1friends-api";
import type { ClasificacionPiloto, ClasificacionConstructor } from "@/types/clasificacion";
import TablaClasificacionPilotos from "@/components/clasificacion/tabla-clasificacion-pilotos";
import TablaClasificacionConstructores from "@/components/clasificacion/tabla-clasificacion-constructores";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";

export const metadata = {
  title: "Clasificación — F1 Friends",
};

type Props = {
  searchParams: Promise<{ temporada?: string; tab?: string }>;
};

export default async function ClasificacionPage({ searchParams }: Props) {
  const { temporada, tab } = await searchParams;
  const activaId = await getTemporadaActivaId();
  const temporadaId = parseTemporadaId(temporada, activaId);
  const activeTab = tab === "constructores" ? "constructores" : "pilotos";

  const tabBase = `/clasificacion?temporada=${temporadaId}`;

  let pilotos: ClasificacionPiloto[] = [];
  let constructores: ClasificacionConstructor[] = [];
  let error: string | null = null;

  const [pilotosTemporada, equipos] = await Promise.all([
    getPilotosDeTemporada(temporadaId).catch(() => []),
    getEquipos().catch(() => []),
  ]);
  const equipoById = new Map(equipos.map((e) => [e.id, e]));
  const pilotoEquipoMap = new Map(
    pilotosTemporada
      .filter((p) => p.equipo_id != null)
      .map((p) => [p.piloto_id, equipoById.get(p.equipo_id!)!])
      .filter(([, eq]) => eq != null)
  );
  const equipoMap = equipoById;

  try {
    if (activeTab === "pilotos") {
      pilotos = await getClasificacionPilotos(temporadaId);
    } else {
      constructores = await getClasificacionConstructores(temporadaId);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem", width: "min(860px, 100%)", margin: "0 auto", boxSizing: "border-box" }}>
        <h1 style={{ margin: 0 }}>Clasificación</h1>
        <p style={{ marginTop: "0.25rem", color: "#9ca3af", fontSize: "0.85rem" }}>
          Temporada {temporadaId}
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginTop: "1.5rem", borderBottom: "2px solid #2e2e3a" }}>
          <Link
            href={`${tabBase}&tab=pilotos`}
            style={{
              padding: "8px 20px",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: activeTab === "pilotos" ? "#fff" : "#6b7280",
              borderBottom: activeTab === "pilotos" ? "2px solid #e10600" : "2px solid transparent",
              marginBottom: -2,
              textDecoration: "none",
            }}
          >
            Pilotos
          </Link>
          <Link
            href={`${tabBase}&tab=constructores`}
            style={{
              padding: "8px 20px",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: activeTab === "constructores" ? "#fff" : "#6b7280",
              borderBottom: activeTab === "constructores" ? "2px solid #e10600" : "2px solid transparent",
              marginBottom: -2,
              textDecoration: "none",
            }}
          >
            Constructores
          </Link>
        </div>

        {error ? (
          <p style={{ marginTop: "1.5rem", color: "#c00" }}>
            No se pudo cargar la clasificación: {error}
          </p>
        ) : activeTab === "pilotos" ? (
          pilotos.length === 0 ? (
            <p style={{ marginTop: "1.5rem", color: "#9ca3af" }}>No hay resultados disponibles.</p>
          ) : (
            <TablaClasificacionPilotos pilotos={pilotos} pilotoEquipoMap={pilotoEquipoMap} />
          )
        ) : (
          constructores.length === 0 ? (
            <p style={{ marginTop: "1.5rem", color: "#9ca3af" }}>No hay resultados disponibles.</p>
          ) : (
            <TablaClasificacionConstructores constructores={constructores} equipoMap={equipoMap} />
          )
        )}
      </main>
    </>
  );
}
