"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveGranPremio } from "./actions";
import type { GranPremio } from "@/types/gran-premio";
import {
  FormSection, Field, SaveButton, FormFeedback,
  adminInputStyle,
} from "@/components/admin/form-components";

export function GranPremioEditForm({ gp }: { gp: GranPremio }) {
  const router = useRouter();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value;
    const fechaRaw = get("fecha");
    startTransition(async () => {
      const res = await saveGranPremio(gp.id, {
        nombre: get("nombre").trim(),
        circuito: get("circuito").trim() || null,
        pais: get("pais").trim() || null,
        fecha: fechaRaw ? `${fechaRaw}T00:00:00Z` : null,
        tiene_sprint: (form.elements.namedItem("tiene_sprint") as HTMLInputElement).checked,
        orden: Number(get("orden")),
        estado: get("estado") as GranPremio["estado"],
      });
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  const fechaInicial = gp.fecha ? gp.fecha.slice(0, 10) : "";

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title="Datos del gran premio">
        <Field label="Nombre *">
          <input name="nombre" type="text" required defaultValue={gp.nombre} style={adminInputStyle} />
        </Field>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Field label="País">
              <input name="pais" type="text" defaultValue={gp.pais ?? ""} style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Circuito">
              <input name="circuito" type="text" defaultValue={gp.circuito ?? ""} style={adminInputStyle} />
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: "0 0 160px" }}>
            <Field label="Fecha">
              <input name="fecha" type="date" defaultValue={fechaInicial} style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: "0 0 100px" }}>
            <Field label="Orden *">
              <input name="orden" type="number" min={1} required defaultValue={gp.orden} style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Estado">
              <select name="estado" defaultValue={gp.estado} style={adminInputStyle}>
                <option value="pendiente">Pendiente</option>
                <option value="en_curso">En curso</option>
                <option value="completado">Completado</option>
              </select>
            </Field>
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input name="tiene_sprint" type="checkbox" defaultChecked={gp.tiene_sprint} style={{ width: 16, height: 16, accentColor: "#0f172a" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Tiene Sprint</span>
        </label>
      </FormSection>
      <FormFeedback result={result} />
      <SaveButton isPending={isPending} />
    </form>
  );
}
