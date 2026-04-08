import { cookies } from "next/headers";
import type { GranPremio } from "@/types/gran-premio";
import type { Sesion } from "@/types/sesion";
import type { InscripcionGP } from "@/types/inscripcion";
import type { Temporada } from "@/types/temporada";
import type { Piloto } from "@/types/piloto";
import type { AsignacionVigente } from "@/types/asignacion";
import type { Equipo } from "@/types/equipo";

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

export async function getAdminTemporada(id: number): Promise<Temporada> {
  const all = await getAdminTemporadas();
  const t = all.find((t) => t.id === id);
  if (!t) throw new Error("NOT_FOUND");
  return t;
}

export async function getAdminPiloto(id: number): Promise<Piloto> {
  const all = await getAdminPilotos();
  const p = all.find((p) => p.id === id);
  if (!p) throw new Error("NOT_FOUND");
  return p;
}

export async function getAdminPilotos(): Promise<Piloto[]> {
  const res = await adminFetch("/api/v1/admin/pilotos");

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener los pilotos: ${res.status}`);
  }

  return res.json();
}

export async function getAdminEquipo(id: number): Promise<Equipo> {
  const all = await getAdminEquipos();
  const e = all.find((e) => e.id === id);
  if (!e) throw new Error("NOT_FOUND");
  return e;
}

export async function getAdminEquipos(): Promise<Equipo[]> {
  const res = await adminFetch("/api/v1/admin/equipos");

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener los equipos: ${res.status}`);
  }

  return res.json();
}

export async function getAdminAsignaciones(temporadaId: number): Promise<AsignacionVigente[]> {
  const res = await adminFetch(`/api/v1/admin/temporadas/${temporadaId}/pilotos`);

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener las asignaciones: ${res.status}`);
  }

  return res.json();
}

export async function getAdminTemporadas(): Promise<Temporada[]> {
  const res = await adminFetch("/api/v1/admin/temporadas");

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error(`Error al obtener las temporadas: ${res.status}`);
  }

  return res.json();
}
