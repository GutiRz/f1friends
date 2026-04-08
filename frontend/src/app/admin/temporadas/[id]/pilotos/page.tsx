import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminAsignaciones, getAdminPilotos, getAdminTemporada } from "@/lib/admin-api";
import { getEquipos } from "@/lib/api/f1friends-api";
import { NuevaAsignacionForm } from "./nueva-asignacion-form";
import { AsignacionesTable } from "./asignaciones-table";
import type { AsignacionVigente } from "@/types/asignacion";

export default async function AdminTemporadaPilotosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const temporadaId = Number(id);
  if (!temporadaId || temporadaId < 1) notFound();

  let asignaciones: AsignacionVigente[];
  let temporada: Awaited<ReturnType<typeof getAdminTemporada>>;

  try {
    [asignaciones, temporada] = await Promise.all([
      getAdminAsignaciones(temporadaId),
      getAdminTemporada(temporadaId),
    ]);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") redirect("/admin/login");
      if (err.message === "NOT_FOUND") notFound();
    }
    throw err;
  }

  const [pilotos, equipos] = await Promise.all([
    getAdminPilotos(),
    getEquipos(),
  ]);

  const pilotoMap = Object.fromEntries(pilotos.map((p) => [p.id, p.nombre_publico]));
  const pilotosAsignados = new Set(asignaciones.map((a) => a.piloto_id));

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href={`/admin/temporadas/${temporadaId}`}>← {temporada.nombre}</Link>
      </nav>
      <h1>Pilotos — {temporada.nombre}</h1>

      <h2 style={{ marginTop: 24 }}>Añadir piloto</h2>
      <NuevaAsignacionForm
        temporadaId={temporadaId}
        pilotos={pilotos}
        equipos={equipos}
        pilotosAsignados={pilotosAsignados}
      />

      <h2>Parrilla</h2>
      <AsignacionesTable
        temporadaId={temporadaId}
        asignaciones={asignaciones}
        pilotoMap={pilotoMap}
        equipos={equipos}
      />
    </main>
  );
}
