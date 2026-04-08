"use server";

import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function crearAsignacion(
  temporadaId: number,
  data: {
    piloto_id: number;
    equipo_id: number | null;
    tipo: "titular" | "reserva";
    orden: number;
  }
): Promise<ActionResult> {
  let res: Response;
  try {
    res = await adminFetch(`/api/v1/admin/temporadas/${temporadaId}/pilotos`, {
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

  return { ok: true };
}

export async function editarAsignacion(
  temporadaId: number,
  pilotoId: number,
  data: {
    equipo_id: number | null;
    tipo: "titular" | "reserva";
    orden: number;
  }
): Promise<ActionResult> {
  let res: Response;
  try {
    res = await adminFetch(
      `/api/v1/admin/temporadas/${temporadaId}/pilotos/${pilotoId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
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
