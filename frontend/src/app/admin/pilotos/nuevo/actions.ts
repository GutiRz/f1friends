"use server";

import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";

export type CreateResult = { ok: true } | { ok: false; error: string };

export async function crearPiloto(data: {
  nombre_publico: string;
  nombre_real: string | null;
  nacionalidad: string | null;
  numero: number | null;
  id_psn: string | null;
  id_ea: string | null;
  id_xbox: string | null;
}): Promise<CreateResult> {
  let res: Response;
  try {
    res = await adminFetch("/api/v1/admin/pilotos", {
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

  redirect("/admin/pilotos");
}
