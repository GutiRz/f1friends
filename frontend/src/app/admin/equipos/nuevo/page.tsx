"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { crearEquipo } from "./actions";

export default function NuevoEquipoPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement).value.trim();

    startTransition(async () => {
      const res = await crearEquipo({
        nombre: get("nombre"),
        color: get("color") || null,
        logo: get("logo") || null,
      });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/admin/equipos">← Equipos</Link>
      </nav>
      <h1>Nuevo equipo</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Nombre *">
          <input name="nombre" type="text" required style={inputStyle} />
        </Field>
        <Field label="Color (ej. #E8002D)">
          <input name="color" type="text" placeholder="#RRGGBB" style={{ ...inputStyle, width: 140 }} />
        </Field>
        <Field label="Logo (URL)">
          <input name="logo" type="url" style={inputStyle} />
        </Field>
        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={isPending} style={{ padding: "8px 16px", alignSelf: "flex-start" }}>
          {isPending ? "Creando..." : "Crear equipo"}
        </button>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontWeight: "bold" }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  width: "100%",
  boxSizing: "border-box",
};
