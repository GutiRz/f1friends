import type { ClasificacionPiloto } from "@/types/clasificacion";

type Props = {
  pilotos: ClasificacionPiloto[];
};

export default function TablaClasificacionPilotos({ pilotos }: Props) {
  return (
    <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Piloto</th>
            <th>Puntos</th>
            <th>V</th>
            <th>2º</th>
            <th>3º</th>
          </tr>
        </thead>
        <tbody>
          {pilotos.map((piloto, index) => (
            <tr key={piloto.piloto_id}>
              <td>{index + 1}</td>
              <td>{piloto.nombre_publico}</td>
              <td>
                <strong>{piloto.puntos_totales}</strong>
              </td>
              <td>{piloto.pos1}</td>
              <td>{piloto.pos2}</td>
              <td>{piloto.pos3}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
