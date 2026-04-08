import type { ClasificacionConstructor } from "@/types/clasificacion";
import type { Equipo } from "@/types/equipo";
import { EquipoNombre } from "@/components/equipos/equipo-nombre";

type Props = {
  constructores: ClasificacionConstructor[];
  equipoMap?: Map<number, Equipo>;
};

export default function TablaClasificacionConstructores({ constructores, equipoMap }: Props) {
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
          {constructores.map((constructor, index) => {
            const equipo = equipoMap?.get(constructor.equipo_id);
            return (
              <tr key={constructor.equipo_id}>
                <td>{index + 1}</td>
                <td>
                  {equipo ? (
                    <EquipoNombre equipo={equipo} />
                  ) : (
                    constructor.nombre_equipo
                  )}
                </td>
                <td>
                  <strong>{constructor.puntos_totales}</strong>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
