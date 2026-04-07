import type { ClasificacionPiloto, ClasificacionConstructor } from "@/types/clasificacion";
import type { GranPremio } from "@/types/gran-premio";
import type { SesionConResultados } from "@/types/sesion";
import type { Piloto } from "@/types/piloto";
import type { Equipo } from "@/types/equipo";

function getBaseUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error("BACKEND_API_URL environment variable is not set");
  }
  return url;
}

export async function getClasificacionPilotos(
  temporadaId: number
): Promise<ClasificacionPiloto[]> {
  const res = await fetch(
    `${getBaseUrl()}/api/v1/public/temporadas/${temporadaId}/clasificacion/pilotos`
  );

  if (!res.ok) {
    throw new Error(
      `Error fetching clasificacion pilotos: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export async function getClasificacionConstructores(
  temporadaId: number
): Promise<ClasificacionConstructor[]> {
  const res = await fetch(
    `${getBaseUrl()}/api/v1/public/temporadas/${temporadaId}/clasificacion/constructores`
  );

  if (!res.ok) {
    throw new Error(
      `Error fetching clasificacion constructores: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export async function getGrandesPremios(
  temporadaId: number
): Promise<GranPremio[]> {
  const res = await fetch(
    `${getBaseUrl()}/api/v1/public/temporadas/${temporadaId}/calendario`
  );

  if (!res.ok) {
    throw new Error(
      `Error fetching grandes premios: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export async function getGranPremioById(id: number): Promise<GranPremio> {
  const res = await fetch(`${getBaseUrl()}/api/v1/public/gp/${id}`);

  if (!res.ok) {
    throw new Error(
      `Error fetching gran premio: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export async function getSesionesByGranPremioId(
  id: number
): Promise<SesionConResultados[]> {
  const res = await fetch(`${getBaseUrl()}/api/v1/public/gp/${id}/sesiones`);

  if (!res.ok) {
    throw new Error(
      `Error fetching sesiones: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export async function getPilotos(): Promise<Piloto[]> {
  const res = await fetch(`${getBaseUrl()}/api/v1/public/pilotos`);
  if (!res.ok) {
    throw new Error(`Error fetching pilotos: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getEquipos(): Promise<Equipo[]> {
  const res = await fetch(`${getBaseUrl()}/api/v1/public/equipos`);
  if (!res.ok) {
    throw new Error(`Error fetching equipos: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
