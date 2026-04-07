import Link from "next/link";
import { parseTemporadaId } from "@/lib/temporada";
import { NuevoGranPremioForm } from "./form";

interface Props {
  searchParams: Promise<{ temporada?: string }>;
}

export default async function NuevoGranPremioPage({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const temporadaId = parseTemporadaId(temporada);

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 24 }}>
        <Link href={`/admin/grandes-premios?temporada=${temporadaId}`}>
          ← Grandes Premios
        </Link>
      </nav>

      <h1>Nuevo Gran Premio — Temporada {temporadaId}</h1>

      <NuevoGranPremioForm temporadaId={temporadaId} />
    </main>
  );
}
