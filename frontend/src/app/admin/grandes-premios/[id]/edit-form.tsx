"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveGranPremio } from "./actions";
import type { GranPremio } from "@/types/gran-premio";

export function GranPremioEditForm({ gp }: { gp: GranPremio }) {
  const router = useRouter();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);

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
    const estado = get("estado") as GranPremio["estado"];

    startTransition(async () => {
      const res = await saveGranPremio(gp.id, {
        nombre,
        circuito,
        pais,
        fecha,
        tiene_sprint,
        orden,
        estado,
      });
      setResult(res);
      if (res.ok) {
        router.refresh();
      }
    });
  }

  const fechaInicial = gp.fecha ? gp.fecha.slice(0, 10) : "";

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <Field label="Nombre *">
        <input
          name="nombre"
          type="text"
          required
          defaultValue={gp.nombre}
          style={inputStyle}
        />
      </Field>

      <Field label="Circuito">
        <input
          name="circuito"
          type="text"
          defaultValue={gp.circuito ?? ""}
          style={inputStyle}
        />
      </Field>

      <Field label="País">
        <input
          name="pais"
          type="text"
          defaultValue={gp.pais ?? ""}
          style={inputStyle}
        />
      </Field>

      <Field label="Fecha">
        <input
          name="fecha"
          type="date"
          defaultValue={fechaInicial}
          style={inputStyle}
        />
      </Field>

      <Field label="Orden *">
        <input
          name="orden"
          type="number"
          min={1}
          required
          defaultValue={gp.orden}
          style={{ ...inputStyle, width: 80 }}
        />
      </Field>

      <Field label="Estado">
        <select name="estado" defaultValue={gp.estado} style={inputStyle}>
          <option value="pendiente">Pendiente</option>
          <option value="en_curso">En curso</option>
          <option value="completado">Completado</option>
        </select>
      </Field>

      <Field label="Sprint">
        <input
          name="tiene_sprint"
          type="checkbox"
          defaultChecked={gp.tiene_sprint}
        />
      </Field>

      <div style={{ marginTop: 20 }}>
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
