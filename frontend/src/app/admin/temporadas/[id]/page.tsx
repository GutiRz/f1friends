import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminTemporada } from "@/lib/admin-api";
import { TemporadaEditForm } from "./edit-form";
import PageHeader from "@/components/admin/page-header";

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
    <div style={{ maxWidth: 560 }}>
      <PageHeader
        title={temporada.nombre}
        backHref="/admin/temporadas"
        backLabel="Temporadas"
      />
      <div style={{ marginBottom: 20 }}>
        <Link
          href={`/admin/temporadas/${numId}/pilotos`}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", background: "#0f172a", color: "#f8fafc",
            borderRadius: 6, fontSize: "0.875rem", fontWeight: 500, textDecoration: "none",
          }}
        >
          Gestionar pilotos
        </Link>
      </div>
      <TemporadaEditForm temporada={temporada} />
    </div>
  );
}
