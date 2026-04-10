import { parseTemporadaId } from "@/lib/temporada";
import { NuevoGranPremioForm } from "./form";
import PageHeader from "@/components/admin/page-header";
import { FormCard } from "@/components/admin/form-components";

interface Props {
  searchParams: Promise<{ temporada?: string }>;
}

export default async function NuevoGranPremioPage({ searchParams }: Props) {
  const { temporada } = await searchParams;
  const temporadaId = parseTemporadaId(temporada);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader
        title={`Nuevo Gran Premio — Temporada ${temporadaId}`}
        backHref={`/admin/grandes-premios?temporada=${temporadaId}`}
        backLabel="Grandes Premios"
      />
      <FormCard>
        <NuevoGranPremioForm temporadaId={temporadaId} />
      </FormCard>
    </div>
  );
}
