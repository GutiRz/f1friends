"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { crearTemporada } from "./actions";

export default function NuevaTemporadaPage() {
  const [nombre, setNombre] = useState("");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [descripcion, setDescripcion] = useState("");
  const [normativa, setNormativa] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await crearTemporada({
        nombre: nombre.trim(),
        anio,
        descripcion: descripcion.trim() || null,
        normativa: normativa.trim() || null,
      });
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", padding: "0 16px" }}>
      <nav style={{ marginBottom: 16 }}>
        <Link href="/admin/temporadas">← Temporadas</Link>
      </nav>
      <h1>Nueva temporada</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label>
          Nombre *
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            style={inputStyle}
          />
        </label>
        <label>
          Año *
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            required
            min={2000}
            max={2100}
            style={inputStyle}
          />
        </label>
        <label>
          Descripción
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Normativa
          <textarea
            value={normativa}
            onChange={(e) => setNormativa(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </label>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isPending} style={{ padding: "8px 16px", alignSelf: "flex-start" }}>
          {isPending ? "Creando..." : "Crear temporada"}
        </button>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "6px 8px",
  boxSizing: "border-box",
};
