"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePiloto } from "./actions";
import type { Piloto } from "@/types/piloto";

export function PilotoEditForm({ piloto }: { piloto: Piloto }) {
  const router = useRouter();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult(null);

    const form = e.currentTarget;
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement).value.trim();

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
    <form onSubmit={handleSubmit} style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
      <Field label="Nombre público *">
        <input name="nombre_publico" type="text" required defaultValue={piloto.nombre_publico} style={inputStyle} />
      </Field>
      <Field label="Nombre real">
        <input name="nombre_real" type="text" defaultValue={piloto.nombre_real ?? ""} style={inputStyle} />
      </Field>
      <Field label="Número">
        <input name="numero" type="number" min={1} max={99} defaultValue={piloto.numero ?? ""} style={{ ...inputStyle, width: 80 }} />
      </Field>
      <Field label="Nacionalidad">
        <input name="nacionalidad" type="text" defaultValue={piloto.nacionalidad ?? ""} style={inputStyle} />
      </Field>

      <hr style={{ margin: "4px 0" }} />

      <Field label="ID PSN">
        <input name="id_psn" type="text" defaultValue={piloto.id_psn ?? ""} style={inputStyle} />
      </Field>
      <Field label="ID EA">
        <input name="id_ea" type="text" defaultValue={piloto.id_ea ?? ""} style={inputStyle} />
      </Field>
      <Field label="ID Xbox">
        <input name="id_xbox" type="text" defaultValue={piloto.id_xbox ?? ""} style={inputStyle} />
      </Field>

      <hr style={{ margin: "4px 0" }} />

      <Field label="Twitch URL">
        <input name="twitch_url" type="url" defaultValue={piloto.twitch_url ?? ""} style={inputStyle} />
      </Field>
      <Field label="YouTube URL">
        <input name="youtube_url" type="url" defaultValue={piloto.youtube_url ?? ""} style={inputStyle} />
      </Field>
      <Field label="Avatar URL">
        <input name="avatar_url" type="url" defaultValue={piloto.avatar_url ?? ""} style={inputStyle} />
      </Field>

      <hr style={{ margin: "4px 0" }} />

      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input name="activo" type="checkbox" defaultChecked={piloto.activo} />
        <span style={{ fontWeight: "bold" }}>Activo</span>
      </label>

      <div style={{ marginTop: 8 }}>
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
