"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearAsignacion } from "./actions";
import type { Piloto } from "@/types/piloto";
import type { Equipo } from "@/types/equipo";

interface Props {
  temporadaId: number;
  pilotos: Piloto[];
  equipos: Equipo[];
  pilotosAsignados: Set<number>;
}

export function NuevaAsignacionForm({ temporadaId, pilotos, equipos, pilotosAsignados }: Props) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"titular" | "reserva">("titular");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pilotosDisponibles = pilotos.filter((p) => p.activo && !pilotosAsignados.has(p.id));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const pilotoId = Number((form.elements.namedItem("piloto_id") as HTMLSelectElement).value);
    const equipoRaw = (form.elements.namedItem("equipo_id") as HTMLSelectElement)?.value;
    const equipoId = tipo === "titular" && equipoRaw ? Number(equipoRaw) : null;

    const ordenRaw = (form.elements.namedItem("orden") as HTMLInputElement)?.value;
    const orden = Math.max(1, Number(ordenRaw) || 1);

    startTransition(async () => {
      const res = await crearAsignacion(temporadaId, {
        piloto_id: pilotoId,
        equipo_id: equipoId,
        tipo,
        orden,
      });
      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        setTipo("titular");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginBottom: 24 }}>
      <label style={labelStyle}>
        Piloto *
        <select name="piloto_id" required style={selectStyle}>
          <option value="">— selecciona —</option>
          {pilotosDisponibles.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre_publico}</option>
          ))}
        </select>
      </label>

      <label style={labelStyle}>
        Tipo *
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "titular" | "reserva")}
          style={selectStyle}
        >
          <option value="titular">Titular</option>
          <option value="reserva">Reserva</option>
        </select>
      </label>

      {tipo === "titular" && (
        <label style={labelStyle}>
          Equipo *
          <select name="equipo_id" required style={selectStyle}>
            <option value="">— selecciona —</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.nombre}</option>
            ))}
          </select>
        </label>
      )}

      <label style={labelStyle}>
        Orden
        <input
          name="orden"
          type="number"
          min={1}
          defaultValue={1}
          style={{ ...selectStyle, width: 70 }}
        />
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {error && <span style={{ color: "red", fontSize: 13 }}>{error}</span>}
        <button type="submit" disabled={isPending} style={{ padding: "6px 14px" }}>
          {isPending ? "Añadiendo..." : "Añadir"}
        </button>
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontWeight: "bold",
  fontSize: 14,
};

const selectStyle: React.CSSProperties = {
  padding: "6px 8px",
  minWidth: 160,
};
