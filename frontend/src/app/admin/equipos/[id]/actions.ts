"use server";

import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveEquipo(
  id: number,
  data: {
    nombre: string;
    color: string | null;
    logo: string | null;
  }
): Promise<SaveResult> {
  let res: Response;
  try {
    res = await adminFetch(`/api/v1/admin/equipos/${id}`, {
      method: "PUT",
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

  return { ok: true };
}
