import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminPiloto } from "@/lib/admin-api";
import { PilotoEditForm } from "./edit-form";

export default async function AdminPilotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);

  if (!numId || numId < 1) notFound();

  let piloto;
  try {
    piloto = await getAdminPiloto(numId);
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
        <Link href="/admin/pilotos">← Pilotos</Link>
      </nav>
      <h1>{piloto.nombre_publico}</h1>
      <PilotoEditForm piloto={piloto} />
    </main>
  );
}
