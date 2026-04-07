"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveEstadoInscripcion } from "./actions";
import type { InscripcionGP, EstadoInscripcion } from "@/types/inscripcion";

const ESTADOS: EstadoInscripcion[] = ["inscrito", "ausente", "sustituido", "participo"];

const ESTADO_LABEL: Record<EstadoInscripcion, string> = {
  inscrito: "Inscrito",
  ausente: "Ausente",
  sustituido: "Sustituido",
  participo: "Participó",
};

export function InscripcionesTable({ inscripciones }: { inscripciones: InscripcionGP[] }) {
  const router = useRouter();

  if (inscripciones.length === 0) {
    return <p>No hay inscripciones para este Gran Premio.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Piloto ID</th>
          <th style={th}>Equipo ID</th>
          <th style={th}>Estado</th>
          <th style={th}></th>
        </tr>
      </thead>
      <tbody>
        {inscripciones.map((i) => (
          <InscripcionRow key={i.id} inscripcion={i} onSaved={() => router.refresh()} />
        ))}
      </tbody>
    </table>
  );
}

function InscripcionRow({
  inscripcion,
  onSaved,
}: {
  inscripcion: InscripcionGP;
  onSaved: () => void;
}) {
  const [estado, setEstado] = useState<EstadoInscripcion>(inscripcion.estado);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty = estado !== inscripcion.estado;

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await saveEstadoInscripcion(
        inscripcion.id,
        inscripcion.piloto_id,
        inscripcion.equipo_id,
        estado
      );
      if (res.ok) {
        setSaved(true);
        onSaved();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <tr>
      <td style={td}>{inscripcion.piloto_id}</td>
      <td style={td}>{inscripcion.equipo_id}</td>
      <td style={td}>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoInscripcion);
            setSaved(false);
          }}
          disabled={isPending}
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {ESTADO_LABEL[s]}
            </option>
          ))}
        </select>
      </td>
      <td style={td}>
        {dirty && (
          <button onClick={handleSave} disabled={isPending} style={{ marginRight: 8 }}>
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        )}
        {saved && !dirty && <span style={{ color: "green" }}>✓</span>}
        {error && <span style={{ color: "red" }}>{error}</span>}
      </td>
    </tr>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  borderBottom: "2px solid #ccc",
};

const td: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #eee",
};
