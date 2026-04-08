import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminGranPremio, getAdminSesiones, getAdminInscripciones } from "@/lib/admin-api";
import { getEquipos } from "@/lib/api/f1friends-api";
import { getAdminPilotos } from "@/lib/admin-api";
import { parseTemporadaId } from "@/lib/temporada";
import type { Sesion } from "@/types/sesion";
import { GranPremioEditForm } from "./edit-form";
import { InscripcionesTable } from "./inscripciones-table";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ temporada?: string }>;
}

const TIPO_SESION_LABEL: Record<Sesion["tipo"], string> = {
  qualy: "Clasificación",
  sprint_qualy: "Sprint Qualy",
  sprint: "Sprint",
  carrera: "Carrera",
};

const ESTADO_SESION_LABEL: Record<Sesion["estado"], string> = {
  pendiente: "Pendiente",
  completada: "Completada",
};

async function handleFetch<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") redirect("/admin/login");
      if (err.message === "NOT_FOUND") notFound();
    }
    throw err;
  }
}

export default async function AdminGranPremioDetallePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { temporada } = await searchParams;
  const gpId = Number(id);
  const temporadaId = parseTemporadaId(temporada);

  if (!Number.isInteger(gpId) || gpId < 1) {
    notFound();
  }

  const [gp, sesiones, inscripciones, pilotos, equipos] = await Promise.all([
    handleFetch(() => getAdminGranPremio(gpId)),
    handleFetch(() => getAdminSesiones(gpId)),
    handleFetch(() => getAdminInscripciones(gpId)),
    getAdminPilotos(),
    getEquipos(),
  ]);

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 24 }}>
        <Link href={`/admin/grandes-premios?temporada=${temporadaId}`}>
          ← Grandes Premios
        </Link>
      </nav>

      <h1>{gp.nombre}</h1>

      <GranPremioEditForm gp={gp} />

      <h2>Sesiones</h2>

      {sesiones.length === 0 ? (
        <p>No hay sesiones creadas para este Gran Premio.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Tipo</th>
              <th style={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {sesiones.map((s) => (
              <tr key={s.id}>
                <td style={td}>{TIPO_SESION_LABEL[s.tipo]}</td>
                <td style={td}>{ESTADO_SESION_LABEL[s.estado]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 32 }}>Inscripciones</h2>
      <InscripcionesTable inscripciones={inscripciones} pilotos={pilotos} equipos={equipos} />
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "2px solid #ccc",
};

const td: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};
