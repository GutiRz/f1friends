import type { ClasificacionPiloto } from "@/types/clasificacion";
import type { Equipo } from "@/types/equipo";
import { EquipoNombre } from "@/components/equipos/equipo-nombre";

type Props = {
  pilotos: ClasificacionPiloto[];
  pilotoEquipoMap?: Map<number, Equipo>;
};

export default function TablaClasificacionPilotos({ pilotos, pilotoEquipoMap }: Props) {
  return (
    <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Piloto</th>
            <th>Equipo</th>
            <th>Puntos</th>
            <th>1º</th>
            <th>2º</th>
            <th>3º</th>
          </tr>
        </thead>
        <tbody>
          {pilotos.map((piloto, index) => {
            const equipo = pilotoEquipoMap?.get(piloto.piloto_id);
            return (
              <tr key={piloto.piloto_id}>
                <td>{index + 1}</td>
                <td>{piloto.nombre_publico}</td>
                <td>
                  {equipo ? <EquipoNombre equipo={equipo} /> : "—"}
                </td>
                <td>
                  <strong>{piloto.puntos_totales}</strong>
                </td>
                <td>{piloto.pos1}</td>
                <td>{piloto.pos2}</td>
                <td>{piloto.pos3}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
