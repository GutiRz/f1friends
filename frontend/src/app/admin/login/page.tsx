"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "80px auto", padding: "0 16px" }}>
      <h1>Acceso administración</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <br />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            style={{ width: "100%", padding: "6px 8px", marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">Contraseña</label>
          <br />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={{ width: "100%", padding: "6px 8px", marginTop: 4 }}
          />
        </div>
        {error && (
          <p style={{ color: "red", marginBottom: 12 }}>{error}</p>
        )}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "8px" }}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
