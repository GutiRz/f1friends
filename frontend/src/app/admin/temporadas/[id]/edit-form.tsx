"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTemporada, activarTemporada } from "./actions";
import type { Temporada } from "@/types/temporada";

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
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement).value;

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
    <div style={{ maxWidth: 480 }}>
      <form onSubmit={handleSubmit}>
        <Field label="Nombre *">
          <input name="nombre" type="text" required defaultValue={temporada.nombre} style={inputStyle} />
        </Field>
        <Field label="Año *">
          <input
            name="anio"
            type="number"
            required
            min={2000}
            max={2100}
            defaultValue={temporada.anio}
            style={{ ...inputStyle, width: 100 }}
          />
        </Field>
        <Field label="Descripción">
          <input name="descripcion" type="text" defaultValue={temporada.descripcion ?? ""} style={inputStyle} />
        </Field>
        <Field label="Normativa">
          <textarea
            name="normativa"
            rows={4}
            defaultValue={temporada.normativa ?? ""}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </Field>
        <div style={{ marginTop: 20 }}>
          {saveResult?.ok === true && (
            <p style={{ color: "green", margin: "0 0 8px" }}>Guardado correctamente.</p>
          )}
          {saveResult?.ok === false && (
            <p style={{ color: "red", margin: "0 0 8px" }}>{saveResult.error}</p>
          )}
          <button type="submit" disabled={isSaving} style={{ padding: "8px 20px" }}>
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>

      <hr style={{ margin: "32px 0" }} />

      <section>
        <h2 style={{ marginTop: 0 }}>Temporada activa</h2>
        <p style={{ marginBottom: 12 }}>
          Estado actual:{" "}
          <strong>{temporada.activa ? "Activa" : "Inactiva"}</strong>
        </p>
        {!temporada.activa && (
          <>
            {activarResult?.ok === false && (
              <p style={{ color: "red", margin: "0 0 8px" }}>{activarResult.error}</p>
            )}
            <button
              onClick={handleActivar}
              disabled={isActivating}
              style={{ padding: "8px 20px" }}
            >
              {isActivating ? "Activando..." : "Activar esta temporada"}
            </button>
            <p style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
              La temporada activa actualmente quedará inactiva.
            </p>
          </>
        )}
        {temporada.activa && (
          <p style={{ color: "green" }}>Esta es la temporada activa actualmente.</p>
        )}
      </section>
    </div>
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
