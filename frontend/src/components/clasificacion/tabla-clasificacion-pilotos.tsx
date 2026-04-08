import type { ClasificacionPiloto } from "@/types/clasificacion";
import type { Equipo } from "@/types/equipo";
import { EquipoNombre } from "@/components/equipos/equipo-nombre";

type Props = {
  pilotos: ClasificacionPiloto[];
  pilotoEquipoMap?: Map<number, Equipo>;
};

export default function TablaClasificacionPilotos({ pilotos, pilotoEquipoMap }: Props) {
  return (
    <div style={{ marginTop: "1rem", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr>
            <th style={th}>POS</th>
            <th style={th}>PILOTO</th>
            <th style={th}>EQUIPO</th>
            <th style={{ ...th, textAlign: "right" }}>PTS</th>
            <th style={{ ...th, textAlign: "right" }}>1º</th>
            <th style={{ ...th, textAlign: "right" }}>2º</th>
            <th style={{ ...th, textAlign: "right" }}>3º</th>
          </tr>
        </thead>
        <tbody>
          {pilotos.map((piloto, index) => {
            const equipo = pilotoEquipoMap?.get(piloto.piloto_id);
            return (
              <tr key={piloto.piloto_id} style={{ borderBottom: "1px solid #2e2e3a" }}>
                <td style={{ ...td, color: "#9ca3af", width: 48 }}>{index + 1}</td>
                <td style={{ ...td, fontWeight: 600 }}>{piloto.nombre_publico}</td>
                <td style={td}>
                  {equipo ? <EquipoNombre equipo={equipo} logoHeight={16} circulo /> : "—"}
                </td>
                <td style={{ ...td, textAlign: "right", fontWeight: 700 }}>{piloto.puntos_totales}</td>
                <td style={{ ...td, textAlign: "right", color: "#9ca3af" }}>{piloto.pos1}</td>
                <td style={{ ...td, textAlign: "right", color: "#9ca3af" }}>{piloto.pos2}</td>
                <td style={{ ...td, textAlign: "right", color: "#9ca3af" }}>{piloto.pos3}</td>
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
