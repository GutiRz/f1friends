"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveEquipo } from "./actions";
import type { Equipo } from "@/types/equipo";
import {
  FormSection, Field, SaveButton, FormFeedback,
  adminInputStyle,
} from "@/components/admin/form-components";

export function EquipoEditForm({ equipo }: { equipo: Equipo }) {
  const router = useRouter();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim();
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
    <form onSubmit={handleSubmit}>
      <FormSection title="Datos del equipo">
        <Field label="Nombre *">
          <input name="nombre" type="text" required defaultValue={equipo.nombre} style={adminInputStyle} />
        </Field>
        <Field label="Color (ej. #E8002D)">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {equipo.color && (
              <span style={{ display: "inline-block", width: 32, height: 32, background: equipo.color, borderRadius: 6, border: "1px solid #e2e8f0", flexShrink: 0 }} />
            )}
            <input name="color" type="text" placeholder="#RRGGBB" defaultValue={equipo.color ?? ""} style={{ ...adminInputStyle, width: 140 }} />
          </div>
        </Field>
        <Field label="Logo (URL)">
          <input name="logo" type="url" defaultValue={equipo.logo ?? ""} style={adminInputStyle} />
          {equipo.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={equipo.logo} alt={equipo.nombre} height={40} style={{ marginTop: 8, objectFit: "contain", display: "block" }} />
          )}
        </Field>
      </FormSection>
      <FormFeedback result={result} />
      <SaveButton isPending={isPending} />
    </form>
  );
}
