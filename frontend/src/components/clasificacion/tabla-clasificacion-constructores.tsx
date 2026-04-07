import type { ClasificacionConstructor } from "@/types/clasificacion";

type Props = {
  constructores: ClasificacionConstructor[];
};

export default function TablaClasificacionConstructores({ constructores }: Props) {
  return (
    <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Equipo</th>
            <th>Puntos</th>
          </tr>
        </thead>
        <tbody>
          {constructores.map((constructor, index) => (
            <tr key={constructor.equipo_id}>
              <td>{index + 1}</td>
              <td>{constructor.nombre_equipo}</td>
              <td>
                <strong>{constructor.puntos_totales}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
