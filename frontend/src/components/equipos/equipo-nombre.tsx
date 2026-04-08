import type { Equipo } from "@/types/equipo";

interface Props {
  equipo: Equipo;
  logoHeight?: number;
  circulo?: boolean; // muestra el logo sobre un círculo del color del equipo
}

export function EquipoNombre({ equipo, logoHeight = 24, circulo = false }: Props) {
  const logoEl = equipo.logo ? (
    circulo ? (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: logoHeight * 1.75,
          height: logoHeight * 1.75,
          borderRadius: "50%",
          background: equipo.color ?? "#555",
          flexShrink: 0,
        }}
      >
        <img
          src={equipo.logo}
          alt={equipo.nombre}
          height={logoHeight}
          style={{ objectFit: "contain" }}
        />
      </span>
    ) : (
      <img
        src={equipo.logo}
        alt={equipo.nombre}
        height={logoHeight}
        style={{ objectFit: "contain" }}
      />
    )
  ) : equipo.color ? (
    <span
      style={{
        display: "inline-block",
        width: logoHeight * 1.5,
        height: logoHeight,
        background: equipo.color,
        borderRadius: 3,
      }}
    />
  ) : null;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {logoEl}
      {equipo.nombre}
    </span>
  );
}
