"use client";

import { useState, useTransition } from "react";
import { crearGranPremio } from "./actions";
import { FormSection, Field, FormFeedback, adminInputStyle } from "@/components/admin/form-components";

export function NuevoGranPremioForm({ temporadaId }: { temporadaId: number }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value;
    const fechaRaw = get("fecha");
    startTransition(async () => {
      const res = await crearGranPremio(temporadaId, {
        nombre: get("nombre").trim(),
        circuito: get("circuito").trim() || null,
        pais: get("pais").trim() || null,
        fecha: fechaRaw ? `${fechaRaw}T00:00:00Z` : null,
        tiene_sprint: (form.elements.namedItem("tiene_sprint") as HTMLInputElement).checked,
        orden: Number(get("orden")),
      });
      setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Datos del gran premio">
        <Field label="Nombre *">
          <input name="nombre" type="text" required style={adminInputStyle} />
        </Field>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Field label="País">
              <input name="pais" type="text" style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Circuito">
              <input name="circuito" type="text" style={adminInputStyle} />
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: "0 0 160px" }}>
            <Field label="Fecha">
              <input name="fecha" type="date" style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <Field label="Orden *">
              <input name="orden" type="number" min={1} required defaultValue={1} style={adminInputStyle} />
            </Field>
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input name="tiene_sprint" type="checkbox" style={{ width: 16, height: 16, accentColor: "#0f172a" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Tiene Sprint</span>
        </label>
      </FormSection>
      {error && <FormFeedback result={{ ok: false, error }} />}
      <button type="submit" disabled={isPending} style={{
        padding: "8px 20px", background: isPending ? "#94a3b8" : "#0f172a",
        color: "#fff", border: "none", borderRadius: 6, fontSize: "0.875rem", fontWeight: 500, cursor: isPending ? "not-allowed" : "pointer",
      }}>
        {isPending ? "Creando..." : "Crear Gran Premio"}
      </button>
    </form>
  );
}
