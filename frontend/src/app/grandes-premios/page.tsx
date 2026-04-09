import { getGrandesPremios, getTemporadaActivaId } from "@/lib/api/f1friends-api";
import type { GranPremio } from "@/types/gran-premio";
import { parseTemporadaId } from "@/lib/temporada";
import PublicNav from "@/components/navigation/public-nav";
import TarjetasGrandesPremios from "@/components/grandes-premios/tarjetas-grandes-premios";

export const metadata = {
  title: "Calendario — F1 Friends",
};

type Props = {
  searchParams: Promise<{ temporada?: string }>;
};

export default async function GrandesPremiosPage({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const activaId = await getTemporadaActivaId();
  const temporadaId = parseTemporadaId(temporada, activaId);

  let grandesPremios: GranPremio[] = [];
  let error: string | null = null;

  try {
    grandesPremios = await getGrandesPremios(temporadaId);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PublicNav temporadaId={temporadaId} />
      <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ margin: 0 }}>Calendario</h1>
        <p style={{ marginTop: "0.25rem", color: "#9ca3af", fontSize: "0.85rem" }}>
          Temporada {temporadaId}
        </p>

        {error ? (
          <p style={{ marginTop: "1.5rem", color: "#c00" }}>
            No se pudieron cargar los grandes premios: {error}
          </p>
        ) : grandesPremios.length === 0 ? (
          <p style={{ marginTop: "1.5rem", color: "#9ca3af" }}>
            No hay grandes premios disponibles.
          </p>
        ) : (
          <TarjetasGrandesPremios grandesPremios={grandesPremios} temporadaId={temporadaId} />
        )}
      </main>
    </>
  );
}
