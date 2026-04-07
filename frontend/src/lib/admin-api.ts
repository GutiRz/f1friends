import { cookies } from "next/headers";

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
