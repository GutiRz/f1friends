import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminTemporada } from "@/lib/admin-api";
import { TemporadaEditForm } from "./edit-form";

export default async function AdminTemporadaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);

  if (!numId || numId < 1) notFound();

  let temporada;
  try {
    temporada = await getAdminTemporada(numId);
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
        <Link href="/admin/temporadas">← Temporadas</Link>
      </nav>
      <h1>{temporada.nombre}</h1>
      <TemporadaEditForm temporada={temporada} />
    </main>
  );
}
