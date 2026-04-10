"use client";

import { useState, useTransition } from "react";
import { crearEquipo } from "./actions";
import PageHeader from "@/components/admin/page-header";
import { FormCard, FormSection, Field, FormFeedback, adminInputStyle } from "@/components/admin/form-components";

export default function NuevoEquipoPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim();
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
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <PageHeader title="Nuevo equipo" backHref="/admin/equipos" backLabel="Equipos" />
      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormSection title="Datos del equipo">
            <Field label="Nombre *">
              <input name="nombre" type="text" required style={adminInputStyle} />
            </Field>
            <Field label="Color (ej. #E8002D)">
              <input name="color" type="text" placeholder="#RRGGBB" style={{ ...adminInputStyle, width: 140 }} />
            </Field>
            <Field label="Logo (URL)">
              <input name="logo" type="url" style={adminInputStyle} />
            </Field>
          </FormSection>
          {error && <FormFeedback result={{ ok: false, error }} />}
          <button type="submit" disabled={isPending} style={{
            padding: "8px 20px", background: isPending ? "#94a3b8" : "#0f172a",
            color: "#fff", border: "none", borderRadius: 6, fontSize: "0.875rem", fontWeight: 500, cursor: isPending ? "not-allowed" : "pointer",
          }}>
            {isPending ? "Creando..." : "Crear equipo"}
          </button>
        </form>
      </FormCard>
    </div>
  );
}
