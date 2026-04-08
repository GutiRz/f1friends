"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveEquipo } from "./actions";
import type { Equipo } from "@/types/equipo";

export function EquipoEditForm({ equipo }: { equipo: Equipo }) {
  const router = useRouter();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement).value.trim();

    startTransition(async () => {
      const res = await saveEquipo(equipo.id, {
        nombre: get("nombre"),
        color: get("color") || null,
        logo: get("logo") || null,
      });
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Nombre *">
        <input name="nombre" type="text" required defaultValue={equipo.nombre} style={inputStyle} />
      </Field>
      <Field label="Color (ej. #E8002D)">
        <input name="color" type="text" placeholder="#RRGGBB" defaultValue={equipo.color ?? ""} style={{ ...inputStyle, width: 140 }} />
      </Field>
      <Field label="Logo (URL)">
        <input name="logo" type="url" defaultValue={equipo.logo ?? ""} style={inputStyle} />
      </Field>
      <div style={{ marginTop: 4 }}>
        {result?.ok === true && (
          <p style={{ color: "green", margin: "0 0 8px" }}>Guardado correctamente.</p>
        )}
        {result?.ok === false && (
          <p style={{ color: "red", margin: "0 0 8px" }}>{result.error}</p>
        )}
        <button type="submit" disabled={isPending} style={{ padding: "8px 20px" }}>
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
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
