import { cookies } from "next/headers";
import type { GranPremio } from "@/types/gran-premio";
import type { Sesion } from "@/types/sesion";
import type { InscripcionGP } from "@/types/inscripcion";

const COOKIE_NAME = "f1friends_token";

function getBaseUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error("BACKEND_API_URL environment variable is not set");
  }
  return url;
}

/**
 * Realiza una llamada autenticada al backend de administración.
 * Lee el JWT de la cookie HttpOnly y lo reenvía como Authorization: Bearer.
 * Solo usar desde Server Components o Route Handlers.
 */
export async function adminFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    throw new Error("No hay sesión activa");
  }

  return fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getAdminGrandesPremios(
  temporadaId: number
): Promise<GranPremio[]> {
  const res = await adminFetch(
    `/api/v1/admin/temporadas/${temporadaId}/gp`
  );

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener los grandes premios: ${res.status}`);
  }

  return res.json();
}

export async function getAdminGranPremio(id: number): Promise<GranPremio> {
  const res = await adminFetch(`/api/v1/admin/gp/${id}`);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (res.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener el gran premio: ${res.status}`);
  }

  return res.json();
}

export async function getAdminSesiones(gpId: number): Promise<Sesion[]> {
  const res = await adminFetch(`/api/v1/admin/gp/${gpId}/sesiones`);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener las sesiones: ${res.status}`);
  }

  return res.json();
}

export async function getAdminInscripciones(gpId: number): Promise<InscripcionGP[]> {
  const res = await adminFetch(`/api/v1/admin/gp/${gpId}/inscripciones`);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener las inscripciones: ${res.status}`);
  }

  return res.json();
}
