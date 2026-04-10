"use client";

import { useState, useTransition } from "react";
import { crearTemporada } from "./actions";
import PageHeader from "@/components/admin/page-header";
import { FormCard, FormSection, Field, FormFeedback, adminInputStyle, adminTextareaStyle } from "@/components/admin/form-components";

export default function NuevaTemporadaPage() {
  const [nombre, setNombre] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [descripcion, setDescripcion] = useState("");
  const [normativa, setNormativa] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await crearTemporada({
        nombre: nombre.trim(),
        anio,
        descripcion: descripcion.trim() || null,
        normativa: normativa.trim() || null,
      });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <PageHeader title="Nueva temporada" backHref="/admin/temporadas" backLabel="Temporadas" />
      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormSection title="Datos generales">
            <Field label="Nombre *">
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={adminInputStyle} />
            </Field>
            <Field label="Año *">
              <input type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} required min={2000} max={2100}
                style={{ ...adminInputStyle, width: 120 }} />
            </Field>
            <Field label="Descripción">
              <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={adminInputStyle} />
            </Field>
            <Field label="Normativa">
              <textarea value={normativa} onChange={(e) => setNormativa(e.target.value)} rows={3} style={adminTextareaStyle} />
            </Field>
          </FormSection>
          {error && <FormFeedback result={{ ok: false, error }} />}
          <button type="submit" disabled={isPending} style={{
            padding: "8px 20px", background: isPending ? "#94a3b8" : "#0f172a",
            color: "#fff", border: "none", borderRadius: 6, fontSize: "0.875rem", fontWeight: 500, cursor: isPending ? "not-allowed" : "pointer",
          }}>
            {isPending ? "Creando..." : "Crear temporada"}
          </button>
        </form>
      </FormCard>
    </div>
  );
}
