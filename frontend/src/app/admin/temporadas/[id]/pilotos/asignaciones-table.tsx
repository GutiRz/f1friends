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

export function AsignacionesTable({ temporadaId, asignaciones: initialAsignaciones, pilotoMap, equipos }: Props) {
  const router = useRouter();
  const [asignaciones, setAsignaciones] = useState(initialAsignaciones);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverPilotId, setDragOverPilotId] = useState<number | null>(null);
  const [dragOverGroupKey, setDragOverGroupKey] = useState<string | null>(null);
  const [insertBefore, setInsertBefore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const grupos = [
    ...equipos.map((eq) => ({
      key: String(eq.id),
      label: eq.nombre,
      color: eq.color ?? "#ccc",
      logo: eq.logo,
      pilotos: [...asignaciones.filter((a) => a.tipo === "titular" && a.equipo_id === eq.id)]
        .sort((a, b) => a.orden - b.orden),
    })),
    {
      key: "reservas",
      label: "Reservas",
      color: "#e0e0e0",
      logo: null as string | null | undefined,
      pilotos: [...asignaciones.filter((a) => a.tipo === "reserva")]
        .sort((a, b) => a.orden - b.orden),
    },
  ];

  const dragging = draggingId !== null ? asignaciones.find((a) => a.id === draggingId) ?? null : null;

  function handleDragStart(e: React.DragEvent, a: AsignacionVigente) {
    setDraggingId(a.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverPilotId(null);
    setDragOverGroupKey(null);
  }

  // Drag over a pilot row — determine insert before/after based on mouse Y position
  function handleDragOverPilot(e: React.DragEvent, targetId: number) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setInsertBefore(e.clientY < rect.top + rect.height / 2);
    setDragOverPilotId(targetId);
    setDragOverGroupKey(null);
  }

  // Drag over a group container (empty group or outside pilot rows)
  function handleDragOverGroup(e: React.DragEvent, key: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverGroupKey(key);
    setDragOverPilotId(null);
  }

  function handleDragLeaveGroup(e: React.DragEvent) {
    const related = e.relatedTarget as Node | null;
    if (!(e.currentTarget as HTMLElement).contains(related)) {
      setDragOverGroupKey(null);
    }
  }

  // Drop on a pilot row
  function handleDropOnPilot(e: React.DragEvent, target: AsignacionVigente) {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPilotId(null);
    setDragOverGroupKey(null);
    if (!dragging || dragging.id === target.id) { setDraggingId(null); return; }

    const sameTipo = dragging.tipo === target.tipo;
    const sameEquipo = dragging.equipo_id === target.equipo_id;
    const sameGroup = sameTipo && sameEquipo;

    if (sameGroup) {
      // Reorder within group
      const grupo = asignaciones
        .filter((a) => a.tipo === dragging.tipo && a.equipo_id === dragging.equipo_id)
        .sort((a, b) => a.orden - b.orden);

      const fromIdx = grupo.findIndex((a) => a.id === dragging.id);
      const toIdx = grupo.findIndex((a) => a.id === target.id);
      if (fromIdx === -1 || toIdx === -1) { setDraggingId(null); return; }

      const reordered = [...grupo];
      reordered.splice(fromIdx, 1);
      const insertAt = insertBefore ? toIdx : toIdx + 1;
      reordered.splice(Math.max(0, fromIdx < toIdx ? insertAt - 1 : insertAt), 0, dragging);

      const withNewOrdenes = reordered.map((a, i) => ({ ...a, orden: i + 1 }));
      const changed = withNewOrdenes.filter((a) => {
        const orig = asignaciones.find((x) => x.id === a.id);
        return orig && orig.orden !== a.orden;
      });

      setAsignaciones((prev) => prev.map((a) => withNewOrdenes.find((x) => x.id === a.id) ?? a));
      setDraggingId(null);

      startTransition(async () => {
        for (const a of changed) {
          const res = await editarAsignacion(temporadaId, a.piloto_id, { tipo: a.tipo, equipo_id: a.equipo_id, orden: a.orden });
          if (!res.ok) { setError(res.error); router.refresh(); return; }
        }
        router.refresh();
      });
    } else {
      // Move to target's group, insert at target's position
      const isReservas = target.tipo === "reserva";
      const newTipo = isReservas ? ("reserva" as const) : ("titular" as const);
      const newEquipoId = isReservas ? null : target.equipo_id;
      const newOrden = insertBefore ? target.orden : target.orden + 1;

      setAsignaciones((prev) =>
        prev.map((a) => a.id === dragging.id ? { ...a, tipo: newTipo, equipo_id: newEquipoId, orden: newOrden } : a)
      );
      setDraggingId(null);

      startTransition(async () => {
        const res = await editarAsignacion(temporadaId, dragging.piloto_id, { tipo: newTipo, equipo_id: newEquipoId, orden: newOrden });
        if (!res.ok) { setError(res.error); }
        router.refresh();
      });
    }
  }

  // Drop on group container (empty group or bottom area)
  function handleDropOnGroup(e: React.DragEvent, key: string) {
    e.preventDefault();
    setDragOverGroupKey(null);
    if (!dragging) return;

    const isReservas = key === "reservas";
    const newTipo = isReservas ? ("reserva" as const) : ("titular" as const);
    const newEquipoId = isReservas ? null : Number(key);

    if (newTipo === dragging.tipo && newEquipoId === dragging.equipo_id) { setDraggingId(null); return; }

    const newOrden = asignaciones.filter((a) =>
      isReservas ? a.tipo === "reserva" : a.tipo === "titular" && a.equipo_id === newEquipoId
    ).length + 1;

    setAsignaciones((prev) =>
      prev.map((a) => a.id === dragging.id ? { ...a, tipo: newTipo, equipo_id: newEquipoId, orden: newOrden } : a)
    );
    setDraggingId(null);

    startTransition(async () => {
      const res = await editarAsignacion(temporadaId, dragging.piloto_id, { tipo: newTipo, equipo_id: newEquipoId, orden: newOrden });
      if (!res.ok) { setError(res.error); }
      router.refresh();
    });
  }

  return (
    <div>
      {error && (
        <p style={{ color: "#dc2626", marginBottom: 12, fontSize: "0.875rem" }}>
          {error}{" "}
          <button onClick={() => setError(null)} style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>×</button>
        </p>
      )}
      {isPending && (
        <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: 8 }}>Guardando...</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {grupos.map(({ key, label, color, logo, pilotos }) => {
          const isGroupOver = dragOverGroupKey === key;

          return (
            <div
              key={key}
              onDragOver={(e) => handleDragOverGroup(e, key)}
              onDragLeave={handleDragLeaveGroup}
              onDrop={(e) => handleDropOnGroup(e, key)}
              style={{
                border: isGroupOver ? "2px dashed #94a3b8" : "1px solid #e2e8f0",
                borderRadius: 8,
                overflow: "hidden",
                background: isGroupOver ? "#f0f7ff" : "#fff",
                transition: "background 0.1s, border-color 0.1s",
              }}
            >
              {/* Cabecera */}
              <div style={{
                padding: "5px 10px", background: color,
                color: key === "reservas" ? "#333" : "#fff",
                fontWeight: 600, fontSize: 12,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                {logo && <img src={logo} alt={label} height={13} style={{ objectFit: "contain" }} />}
                {label}
              </div>

              {/* Pilotos */}
              <div style={{ minHeight: 36 }}>
                {pilotos.length === 0 ? (
                  <p style={{ margin: 0, padding: "8px 12px", color: "#cbd5e1", fontSize: "0.8rem" }}>
                    {draggingId ? "Soltar aquí" : "—"}
                  </p>
                ) : (
                  pilotos.map((a) => {
                    const isOver = dragOverPilotId === a.id;
                    const isDragging = draggingId === a.id;
                    return (
                      <div key={a.id}>
                        {/* Indicador de inserción antes */}
                        {isOver && insertBefore && (
                          <div style={{ height: 2, background: "#3b82f6", margin: "0 10px" }} />
                        )}
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, a)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOverPilot(e, a.id)}
                          onDrop={(e) => handleDropOnPilot(e, a)}
                          style={{
                            padding: "8px 12px",
                            borderBottom: "1px solid #f1f5f9",
                            cursor: "grab",
                            userSelect: "none",
                            opacity: isDragging ? 0.3 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: isOver ? "#f8fafc" : "#fff",
                            transition: "background 0.1s",
                          }}
                        >
                          <span style={{ color: "#cbd5e1", fontSize: 14, cursor: "grab" }}>⠿</span>
                          <span style={{ flex: 1, fontSize: "0.875rem", color: "#0f172a" }}>
                            {pilotoMap[a.piloto_id] ?? `#${a.piloto_id}`}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                            #{a.orden}
                          </span>
                        </div>
                        {/* Indicador de inserción después */}
                        {isOver && !insertBefore && (
                          <div style={{ height: 2, background: "#3b82f6", margin: "0 10px" }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
