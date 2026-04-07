import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL;
const COOKIE_NAME = "f1friends_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 horas

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend no configurado" },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo no válido" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  const backendRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!backendRes.ok) {
    const status = backendRes.status === 401 ? 401 : 500;
    return NextResponse.json(
      { error: "Credenciales no válidas" },
      { status }
    );
  }

  const data: { token: string } = await backendRes.json();

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
