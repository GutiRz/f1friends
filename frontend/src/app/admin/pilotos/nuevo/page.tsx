"use client";

import { useState, useTransition } from "react";
import { crearPiloto } from "./actions";
import PageHeader from "@/components/admin/page-header";
import { FormCard, FormSection, Field, FormFeedback, adminInputStyle } from "@/components/admin/form-components";

export default function NuevoPilotoPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim();
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
    <div style={{ maxWidth: 560 }}>
      <PageHeader title="Nuevo piloto" backHref="/admin/pilotos" backLabel="Pilotos" />
      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormSection title="Datos generales">
            <Field label="Nombre público *">
              <input name="nombre_publico" type="text" required style={adminInputStyle} />
            </Field>
            <Field label="Nombre real">
              <input name="nombre_real" type="text" style={adminInputStyle} />
            </Field>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: "0 0 120px" }}>
                <Field label="Número">
                  <input name="numero" type="number" min={1} max={99} style={adminInputStyle} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Nacionalidad">
                  <input name="nacionalidad" type="text" style={adminInputStyle} />
                </Field>
              </div>
            </div>
          </FormSection>
          <FormSection title="IDs de plataforma">
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Field label="ID PSN"><input name="id_psn" type="text" style={adminInputStyle} /></Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="ID EA"><input name="id_ea" type="text" style={adminInputStyle} /></Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="ID Xbox"><input name="id_xbox" type="text" style={adminInputStyle} /></Field>
              </div>
            </div>
          </FormSection>
          {error && <FormFeedback result={{ ok: false, error }} />}
          <button type="submit" disabled={isPending} style={{
            padding: "8px 20px", background: isPending ? "#94a3b8" : "#0f172a",
            color: "#fff", border: "none", borderRadius: 6, fontSize: "0.875rem", fontWeight: 500, cursor: isPending ? "not-allowed" : "pointer",
          }}>
            {isPending ? "Creando..." : "Crear piloto"}
          </button>
        </form>
      </FormCard>
    </div>
  );
}
