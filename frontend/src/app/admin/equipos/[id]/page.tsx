import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminEquipo } from "@/lib/admin-api";
import { EquipoEditForm } from "./edit-form";

export default async function AdminEquipoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);

  if (!numId || numId < 1) notFound();

  let equipo;
  try {
    equipo = await getAdminEquipo(numId);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "UNAUTHORIZED") redirect("/admin/login");
      if (err.message === "NOT_FOUND") notFound();
    }
    throw err;
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/admin/equipos">← Equipos</Link>
      </nav>
      <h1>{equipo.nombre}</h1>
      <EquipoEditForm equipo={equipo} />
    </main>
  );
}
