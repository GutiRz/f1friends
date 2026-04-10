"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePiloto } from "./actions";
import type { Piloto } from "@/types/piloto";
import {
  FormSection, Field, SaveButton, FormFeedback, FormDivider,
  adminInputStyle,
} from "@/components/admin/form-components";

export function PilotoEditForm({ piloto }: { piloto: Piloto }) {
  const router = useRouter();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value.trim();
    const numeroRaw = get("numero");
    startTransition(async () => {
      const res = await savePiloto(piloto.id, {
        nombre_publico: get("nombre_publico"),
        nombre_real: get("nombre_real") || null,
        nacionalidad: get("nacionalidad") || null,
        numero: numeroRaw ? Number(numeroRaw) : null,
        id_psn: get("id_psn") || null,
        id_ea: get("id_ea") || null,
        id_xbox: get("id_xbox") || null,
        twitch_url: get("twitch_url") || null,
        youtube_url: get("youtube_url") || null,
        avatar_url: get("avatar_url") || null,
        activo: (form.elements.namedItem("activo") as HTMLInputElement).checked,
      });
      setResult(res);
      if (res.ok) router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <FormSection title="Datos generales">
        <Field label="Nombre público *">
          <input name="nombre_publico" type="text" required defaultValue={piloto.nombre_publico} style={adminInputStyle} />
        </Field>
        <Field label="Nombre real">
          <input name="nombre_real" type="text" defaultValue={piloto.nombre_real ?? ""} style={adminInputStyle} />
        </Field>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: "0 0 120px" }}>
            <Field label="Número">
              <input name="numero" type="number" min={1} max={99} defaultValue={piloto.numero ?? ""} style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Nacionalidad">
              <input name="nacionalidad" type="text" defaultValue={piloto.nacionalidad ?? ""} style={adminInputStyle} />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormDivider />

      <FormSection title="IDs de plataforma">
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <Field label="ID PSN">
              <input name="id_psn" type="text" defaultValue={piloto.id_psn ?? ""} style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="ID EA">
              <input name="id_ea" type="text" defaultValue={piloto.id_ea ?? ""} style={adminInputStyle} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="ID Xbox">
              <input name="id_xbox" type="text" defaultValue={piloto.id_xbox ?? ""} style={adminInputStyle} />
            </Field>
          </div>
        </div>
      </FormSection>

      <FormDivider />

      <FormSection title="Redes sociales">
        <Field label="Twitch URL">
          <input name="twitch_url" type="url" defaultValue={piloto.twitch_url ?? ""} style={adminInputStyle} />
        </Field>
        <Field label="YouTube URL">
          <input name="youtube_url" type="url" defaultValue={piloto.youtube_url ?? ""} style={adminInputStyle} />
        </Field>
        <Field label="Avatar URL">
          <input name="avatar_url" type="url" defaultValue={piloto.avatar_url ?? ""} style={adminInputStyle} />
        </Field>
      </FormSection>

      <FormDivider />

      <div style={{ padding: "16px 0" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input name="activo" type="checkbox" defaultChecked={piloto.activo} style={{ width: 16, height: 16, accentColor: "#0f172a" }} />
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Piloto activo</span>
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <FormFeedback result={result} />
        <SaveButton isPending={isPending} />
      </div>
    </form>
  );
}
