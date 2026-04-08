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

export function AsignacionesTable({
  temporadaId,
  asignaciones: initialAsignaciones,
  pilotoMap,
  equipos,
}: Props) {
  const router = useRouter();
  const [asignaciones, setAsignaciones] = useState(initialAsignaciones);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Grupos: un bloque por equipo + bloque de reservas
  const grupos = [
    ...equipos.map((eq) => ({
      key: String(eq.id),
      label: eq.nombre,
      color: eq.color ?? "#ccc",
      logo: eq.logo,
      pilotos: asignaciones.filter(
        (a) => a.tipo === "titular" && a.equipo_id === eq.id
      ),
    })),
    {
      key: "reservas",
      label: "Reservas",
      color: "#e0e0e0",
      logo: null as string | null | undefined,
      pilotos: asignaciones.filter((a) => a.tipo === "reserva"),
    },
  ];

  const dragging = draggingId !== null
    ? asignaciones.find((a) => a.id === draggingId) ?? null
    : null;

  function handleDragStart(e: React.DragEvent, a: AsignacionVigente) {
    setDraggingId(a.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, key: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverKey(key);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Solo limpia si salimos del grupo, no de un hijo
    const related = e.relatedTarget as Node | null;
    if (!(e.currentTarget as HTMLElement).contains(related)) {
      setDragOverKey(null);
    }
  }

  function handleOrdenChange(a: AsignacionVigente, newOrden: number) {
    if (newOrden < 1 || newOrden === a.orden) return;
    setAsignaciones((prev) =>
      prev.map((x) => (x.id === a.id ? { ...x, orden: newOrden } : x))
    );
    startTransition(async () => {
      const res = await editarAsignacion(temporadaId, a.piloto_id, {
        tipo: a.tipo,
        equipo_id: a.equipo_id,
        orden: newOrden,
      });
      if (!res.ok) {
        setError(res.error);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  function handleDrop(e: React.DragEvent, key: string) {
    e.preventDefault();
    setDragOverKey(null);
    if (!dragging) return;

    const isReservas = key === "reservas";
    const newTipo = isReservas ? ("reserva" as const) : ("titular" as const);
    const newEquipoId = isReservas ? null : Number(key);

    // Sin cambio real
    if (newTipo === dragging.tipo && newEquipoId === dragging.equipo_id) {
      setDraggingId(null);
      return;
    }

    // Al cambiar de grupo, el orden pasa a ser el último del nuevo grupo + 1
    const newGrupoCount = asignaciones.filter((a) =>
      isReservas
        ? a.tipo === "reserva"
        : a.tipo === "titular" && a.equipo_id === newEquipoId
    ).length;
    const newOrden = newGrupoCount + 1;

    // Actualización optimista
    setAsignaciones((prev) =>
      prev.map((a) =>
        a.id === dragging.id
          ? { ...a, tipo: newTipo, equipo_id: newEquipoId, orden: newOrden }
          : a
      )
    );
    const savedPilotoId = dragging.piloto_id;
    setDraggingId(null);

    startTransition(async () => {
      const res = await editarAsignacion(temporadaId, savedPilotoId, {
        tipo: newTipo,
        equipo_id: newEquipoId,
        orden: newOrden,
      });
      if (res.ok) {
        router.refresh(); // sincroniza nuevos IDs del servidor
      } else {
        setError(res.error);
        router.refresh(); // revierte al estado del servidor
      }
    });
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverKey(null);
  }

  return (
    <div>
      {error && (
        <p style={{ color: "red", marginBottom: 12 }}>
          {error}{" "}
          <button onClick={() => setError(null)} style={{ marginLeft: 8 }}>×</button>
        </p>
      )}
      {isPending && (
        <p style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>Guardando...</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {grupos.map(({ key, label, color, logo, pilotos }) => {
          const isOver = dragOverKey === key;

          return (
            <div
              key={key}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, key)}
              style={{
                border: isOver ? "2px dashed #555" : "1px solid #ddd",
                borderRadius: 6,
                overflow: "hidden",
                background: isOver ? "#f0f7ff" : "#fff",
                transition: "background 0.1s, border-color 0.1s",
              }}
            >
              {/* Cabecera del grupo */}
              <div
                style={{
                  padding: "6px 12px",
                  background: color,
                  color: key === "reservas" ? "#333" : "#fff",
                  fontWeight: "bold",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {logo && (
                  <img
                    src={logo}
                    alt={label}
                    height={16}
                    style={{ objectFit: "contain" }}
                  />
                )}
                {label}
                <span style={{ marginLeft: "auto", fontWeight: "normal", opacity: 0.8 }}>
                  {pilotos.length}
                </span>
              </div>

              {/* Pilotos del grupo */}
              <div style={{ minHeight: 36 }}>
                {pilotos.length === 0 ? (
                  <p style={{ margin: 0, padding: "8px 12px", color: "#bbb", fontSize: 13 }}>
                    {draggingId ? "Soltar aquí" : "—"}
                  </p>
                ) : (
                  pilotos.map((a) => (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, a)}
                      onDragEnd={handleDragEnd}
                      style={{
                        padding: "7px 12px",
                        borderBottom: "1px solid #f0f0f0",
                        cursor: "grab",
                        userSelect: "none",
                        opacity: draggingId === a.id ? 0.35 : 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#fff",
                      }}
                    >
                      <span style={{ color: "#ccc", fontSize: 14, lineHeight: 1 }}>⠿</span>
                      <span style={{ flex: 1 }}>{pilotoMap[a.piloto_id] ?? `#${a.piloto_id}`}</span>
                      <input
                        type="number"
                        min={1}
                        value={a.orden}
                        title="Orden"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => handleOrdenChange(a, Number(e.target.value))}
                        style={{
                          width: 46,
                          padding: "2px 4px",
                          fontSize: 12,
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          textAlign: "center",
                          cursor: "auto",
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
