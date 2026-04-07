"use server";

import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";

interface GranPremioCreateData {
  nombre: string;
  circuito: string | null;
  pais: string | null;
  fecha: string | null;
  tiene_sprint: boolean;
  orden: number;
}

export type CreateResult = { ok: false; error: string };

// En caso de éxito hace redirect directamente — no devuelve { ok: true }.
export async function crearGranPremio(
  temporadaId: number,
  data: GranPremioCreateData
): Promise<CreateResult> {
  let res: Response;
  try {
    res = await adminFetch(`/api/v1/admin/temporadas/${temporadaId}/gp`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "No hay sesión activa") {
      redirect("/admin/login");
    }
    return { ok: false, error: "Error de conexión con el servidor" };
  }

  if (res.status === 401) redirect("/admin/login");

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: body.error ?? `Error ${res.status}` };
  }

  const gp: { id: number } = await res.json();
  // redirect() fuera del try-catch para que Next.js lo maneje correctamente.
  redirect(`/admin/grandes-premios/${gp.id}?temporada=${temporadaId}`);
}
