"use client";

import { useState, useTransition } from "react";
import { crearGranPremio } from "./actions";

export function NuevoGranPremioForm({ temporadaId }: { temporadaId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement).value;

    const nombre = get("nombre").trim();
    const circuito = get("circuito").trim() || null;
    const pais = get("pais").trim() || null;
    const fechaRaw = get("fecha");
    const fecha = fechaRaw ? `${fechaRaw}T00:00:00Z` : null;
    const tiene_sprint = (form.elements.namedItem("tiene_sprint") as HTMLInputElement).checked;
    const orden = Number(get("orden"));

    startTransition(async () => {
      const res = await crearGranPremio(temporadaId, {
        nombre,
        circuito,
        pais,
        fecha,
        tiene_sprint,
        orden,
      });
      // Si llega aquí, es un error (el éxito hace redirect en el servidor).
      setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <Field label="Nombre *">
        <input name="nombre" type="text" required style={inputStyle} />
      </Field>

      <Field label="Circuito">
        <input name="circuito" type="text" style={inputStyle} />
      </Field>

      <Field label="País">
        <input name="pais" type="text" style={inputStyle} />
      </Field>

      <Field label="Fecha">
        <input name="fecha" type="date" style={inputStyle} />
      </Field>

      <Field label="Orden *">
        <input
          name="orden"
          type="number"
          min={1}
          required
          defaultValue={1}
          style={{ ...inputStyle, width: 80 }}
        />
      </Field>

      <Field label="Sprint">
        <input name="tiene_sprint" type="checkbox" />
      </Field>

      <div style={{ marginTop: 20 }}>
        {error && <p style={{ color: "red", margin: "0 0 8px" }}>{error}</p>}
        <button type="submit" disabled={isPending} style={{ padding: "8px 20px" }}>
          {isPending ? "Creando..." : "Crear Gran Premio"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", marginBottom: 4, fontWeight: "bold" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  boxSizing: "border-box",
};
