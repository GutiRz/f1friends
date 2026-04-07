"use server";

import { redirect } from "next/navigation";
import { adminFetch } from "@/lib/admin-api";
import type { EstadoGP } from "@/types/gran-premio";

export type SaveResult = { ok: true } | { ok: false; error: string };

export async function saveGranPremio(
  id: number,
  data: {
    nombre: string;
    circuito: string | null;
    pais: string | null;
    fecha: string | null;
    tiene_sprint: boolean;
    orden: number;
    estado: EstadoGP;
  }
): Promise<SaveResult> {
  const { estado, ...baseFields } = data;

  try {
    const putRes = await adminFetch(`/api/v1/admin/gp/${id}`, {
      method: "PUT",
      body: JSON.stringify(baseFields),
    });

    if (putRes.status === 401) redirect("/admin/login");

    if (!putRes.ok) {
      const body = await putRes.json().catch(() => ({}));
      return { ok: false, error: body.error ?? `Error ${putRes.status}` };
    }

    const patchRes = await adminFetch(`/api/v1/admin/gp/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    });

    if (patchRes.status === 401) redirect("/admin/login");

    if (!patchRes.ok) {
      const body = await patchRes.json().catch(() => ({}));
      return { ok: false, error: body.error ?? `Error al actualizar estado: ${patchRes.status}` };
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.message === "No hay sesión activa") {
      redirect("/admin/login");
    }
    return { ok: false, error: "Error de conexión con el servidor" };
  }
}
