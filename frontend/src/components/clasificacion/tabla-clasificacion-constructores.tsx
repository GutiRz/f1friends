import type { ClasificacionConstructor } from "@/types/clasificacion";
import type { Equipo } from "@/types/equipo";
import { EquipoNombre } from "@/components/equipos/equipo-nombre";

type Props = {
  constructores: ClasificacionConstructor[];
  equipoMap?: Map<number, Equipo>;
};

export default function TablaClasificacionConstructores({ constructores, equipoMap }: Props) {
  return (
    <div style={{ marginTop: "1rem", overflowX: "auto", width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr>
            <th style={th}>POS</th>
            <th style={th}>EQUIPO</th>
            <th style={{ ...th, textAlign: "right" }}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {constructores.map((constructor, index) => {
            const equipo = equipoMap?.get(constructor.equipo_id);
            return (
              <tr key={constructor.equipo_id} style={{ borderBottom: "1px solid #2e2e3a" }}>
                <td style={{ ...td, color: "#9ca3af", width: 48 }}>{index + 1}</td>
                <td style={{ ...td, fontWeight: 600 }}>
                  {equipo ? (
                    <EquipoNombre equipo={equipo} logoHeight={16} circulo />
                  ) : (
                    constructor.nombre_equipo
                  )}
                </td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>
                  {constructor.puntos_totales}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 12px",
  borderBottom: "1px solid #2e2e3a",
  color: "#6b7280",
  fontWeight: 600,
  fontSize: "0.75rem",
  letterSpacing: "0.05em",
  background: "transparent",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
};
