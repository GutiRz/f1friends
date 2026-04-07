import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminGranPremio, getAdminSesiones } from "@/lib/admin-api";
import { parseTemporadaId } from "@/lib/temporada";
import type { GranPremio } from "@/types/gran-premio";
import type { Sesion } from "@/types/sesion";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ temporada?: string }>;
}

const ESTADO_GP_LABEL: Record<GranPremio["estado"], string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  completado: "Completado",
};

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

  const [gp, sesiones] = await Promise.all([
    handleFetch(() => getAdminGranPremio(gpId)),
    handleFetch(() => getAdminSesiones(gpId)),
  ]);

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 24 }}>
        <Link href={`/admin/grandes-premios?temporada=${temporadaId}`}>
          ← Grandes Premios
        </Link>
      </nav>

      <h1>{gp.nombre}</h1>

      <table style={{ marginBottom: 32, borderCollapse: "collapse" }}>
        <tbody>
          <Row label="Circuito" value={gp.circuito ?? "—"} />
          <Row label="País" value={gp.pais ?? "—"} />
          <Row
            label="Fecha"
            value={
              gp.fecha
                ? new Date(gp.fecha).toLocaleDateString("es-ES")
                : "—"
            }
          />
          <Row label="Estado" value={ESTADO_GP_LABEL[gp.estado]} />
          <Row label="Sprint" value={gp.tiene_sprint ? "Sí" : "No"} />
          <Row label="Orden" value={String(gp.orden)} />
        </tbody>
      </table>

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
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ ...td, fontWeight: "bold", paddingRight: 24 }}>{label}</td>
      <td style={td}>{value}</td>
    </tr>
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
