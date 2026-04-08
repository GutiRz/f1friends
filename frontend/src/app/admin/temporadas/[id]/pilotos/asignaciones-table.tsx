"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { editarAsignacion } from "./actions";
import type { AsignacionVigente } from "@/types/asignacion";
import type { Equipo } from "@/types/equipo";

interface Props {
  temporadaId: number;
  asignaciones: AsignacionVigente[];
  pilotoMap: Record<number, string>;
  equipos: Equipo[];
}

export function AsignacionesTable({ temporadaId, asignaciones, pilotoMap, equipos }: Props) {
  const router = useRouter();

  if (asignaciones.length === 0) {
    return <p style={{ color: "#666" }}>No hay pilotos asignados.</p>;
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Piloto</th>
          <th style={th}>Tipo</th>
          <th style={th}>Equipo</th>
          <th style={th}></th>
        </tr>
      </thead>
      <tbody>
        {asignaciones.map((a) => (
          <AsignacionRow
            key={a.id}
            temporadaId={temporadaId}
            asignacion={a}
            pilotoNombre={pilotoMap[a.piloto_id] ?? `#${a.piloto_id}`}
            equipos={equipos}
            onSaved={() => router.refresh()}
          />
        ))}
      </tbody>
    </table>
  );
}

function AsignacionRow({
  temporadaId,
  asignacion,
  pilotoNombre,
  equipos,
  onSaved,
}: {
  temporadaId: number;
  asignacion: AsignacionVigente;
  pilotoNombre: string;
  equipos: Equipo[];
  onSaved: () => void;
}) {
  const [tipo, setTipo] = useState<"titular" | "reserva">(asignacion.tipo);
  const [equipoId, setEquipoId] = useState<number | null>(asignacion.equipo_id);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty =
    tipo !== asignacion.tipo ||
    equipoId !== asignacion.equipo_id;

  function handleTipoChange(next: "titular" | "reserva") {
    setTipo(next);
    if (next === "reserva") setEquipoId(null);
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await editarAsignacion(temporadaId, asignacion.piloto_id, {
        tipo,
        equipo_id: equipoId,
      });
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
      <td style={td}>{pilotoNombre}</td>
      <td style={td}>
        <select
          value={tipo}
          onChange={(e) => handleTipoChange(e.target.value as "titular" | "reserva")}
          disabled={isPending}
          style={{ padding: "4px 6px" }}
        >
          <option value="titular">Titular</option>
          <option value="reserva">Reserva</option>
        </select>
      </td>
      <td style={td}>
        {tipo === "titular" ? (
          <select
            value={equipoId ?? ""}
            onChange={(e) => { setEquipoId(Number(e.target.value) || null); setSaved(false); }}
            disabled={isPending}
            style={{ padding: "4px 6px" }}
          >
            <option value="">— selecciona —</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.nombre}</option>
            ))}
          </select>
        ) : (
          <span style={{ color: "#999" }}>—</span>
        )}
      </td>
      <td style={td}>
        {dirty && (
          <button onClick={handleSave} disabled={isPending} style={{ marginRight: 8 }}>
            {isPending ? "Guardando..." : "Guardar"}
          </button>
        )}
        {saved && !dirty && <span style={{ color: "green" }}>✓</span>}
        {error && <span style={{ color: "red", fontSize: 13 }}>{error}</span>}
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
