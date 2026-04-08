import type { Equipo } from "@/types/equipo";

interface Props {
  equipo: Equipo;
  logoHeight?: number;
}

export function EquipoNombre({ equipo, logoHeight = 24 }: Props) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {equipo.logo ? (
        <img
          src={equipo.logo}
          alt={equipo.nombre}
          height={logoHeight}
          style={{ objectFit: "contain" }}
        />
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
      ) : null}
      {equipo.nombre}
    </span>
  );
}
