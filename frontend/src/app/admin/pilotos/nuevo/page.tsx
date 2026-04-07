"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { crearPiloto } from "./actions";

export default function NuevoPilotoPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement).value.trim();

    const numeroRaw = get("numero");

    startTransition(async () => {
      const res = await crearPiloto({
        nombre_publico: get("nombre_publico"),
        nombre_real: get("nombre_real") || null,
        nacionalidad: get("nacionalidad") || null,
        numero: numeroRaw ? Number(numeroRaw) : null,
        id_psn: get("id_psn") || null,
        id_ea: get("id_ea") || null,
        id_xbox: get("id_xbox") || null,
      });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <main style={{ maxWidth: 560, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/admin/pilotos">← Pilotos</Link>
      </nav>
      <h1>Nuevo piloto</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Nombre público *">
          <input name="nombre_publico" type="text" required style={inputStyle} />
        </Field>
        <Field label="Nombre real">
          <input name="nombre_real" type="text" style={inputStyle} />
        </Field>
        <Field label="Número">
          <input name="numero" type="number" min={1} max={99} style={{ ...inputStyle, width: 80 }} />
        </Field>
        <Field label="Nacionalidad">
          <input name="nacionalidad" type="text" style={inputStyle} />
        </Field>

        <hr style={{ margin: "4px 0" }} />

        <Field label="ID PSN">
          <input name="id_psn" type="text" style={inputStyle} />
        </Field>
        <Field label="ID EA">
          <input name="id_ea" type="text" style={inputStyle} />
        </Field>
        <Field label="ID Xbox">
          <input name="id_xbox" type="text" style={inputStyle} />
        </Field>

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}
        <button type="submit" disabled={isPending} style={{ padding: "8px 16px", alignSelf: "flex-start" }}>
          {isPending ? "Creando..." : "Crear piloto"}
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
