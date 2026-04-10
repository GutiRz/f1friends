"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTemporada, activarTemporada } from "./actions";
import type { Temporada } from "@/types/temporada";
import {
  FormCard, FormSection, Field, SaveButton, ActionButton, FormFeedback, FormDivider,
  adminInputStyle, adminTextareaStyle,
} from "@/components/admin/form-components";

export function TemporadaEditForm({ temporada }: { temporada: Temporada }) {
  const router = useRouter();
  const [saveResult, setSaveResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [activarResult, setActivarResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isActivating, startActivar] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveResult(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value;
    startSave(async () => {
      const res = await saveTemporada(temporada.id, {
        nombre: get("nombre").trim(),
        anio: Number(get("anio")),
        descripcion: get("descripcion").trim() || null,
        normativa: get("normativa").trim() || null,
      });
      setSaveResult(res);
      if (res.ok) router.refresh();
    });
  }

  function handleActivar() {
    setActivarResult(null);
    startActivar(async () => {
      const res = await activarTemporada(temporada.id);
      setActivarResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <FormCard>
        <form onSubmit={handleSubmit}>
          <FormSection title="Datos generales">
            <Field label="Nombre *">
              <input name="nombre" type="text" required defaultValue={temporada.nombre} style={adminInputStyle} />
            </Field>
            <Field label="Año *">
              <input name="anio" type="number" required min={2000} max={2100} defaultValue={temporada.anio}
                style={{ ...adminInputStyle, width: 120 }} />
            </Field>
            <Field label="Descripción">
              <input name="descripcion" type="text" defaultValue={temporada.descripcion ?? ""} style={adminInputStyle} />
            </Field>
            <Field label="Normativa">
              <textarea name="normativa" rows={4} defaultValue={temporada.normativa ?? ""} style={adminTextareaStyle} />
            </Field>
          </FormSection>
          <FormFeedback result={saveResult} />
          <SaveButton isPending={isSaving} />
        </form>
      </FormCard>

      <FormCard>
        <FormSection title="Estado de temporada">
          <div>
            <p style={{ margin: "0 0 12px", fontSize: "0.875rem", color: "#374151" }}>
              Estado actual:{" "}
              <span style={{
                display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 500,
                background: temporada.activa ? "#dcfce7" : "#f1f5f9",
                color: temporada.activa ? "#16a34a" : "#64748b",
              }}>
                {temporada.activa ? "Activa" : "Inactiva"}
              </span>
            </p>
            {temporada.activa ? (
              <p style={{ fontSize: "0.875rem", color: "#16a34a" }}>Esta es la temporada activa actualmente.</p>
            ) : (
              <>
                <FormFeedback result={activarResult} />
                <ActionButton
                  onClick={handleActivar}
                  isPending={isActivating}
                  label="Activar esta temporada"
                  pendingLabel="Activando..."
                  variant="success"
                />
                <p style={{ marginTop: 8, fontSize: "0.8rem", color: "#94a3b8" }}>
                  La temporada activa actualmente quedará inactiva.
                </p>
              </>
            )}
          </div>
        </FormSection>
      </FormCard>
    </div>
  );
}
