import Link from "next/link";
import type { GranPremio } from "@/types/gran-premio";

type Props = {
  grandesPremios: GranPremio[];
  temporadaId: number;
};

const ESTADO_LABEL: Record<GranPremio["estado"], string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  completado: "Completado",
};

export default function TablaGrandesPremios({ grandesPremios, temporadaId }: Props) {
  return (
    <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>GP</th>
            <th>Circuito</th>
            <th>País</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Sprint</th>
          </tr>
        </thead>
        <tbody>
          {grandesPremios.map((gp) => (
            <tr key={gp.id}>
              <td>{gp.orden}</td>
              <td>
                <Link href={`/grandes-premios/${gp.id}?temporada=${temporadaId}`}>
                  {gp.nombre}
                </Link>
              </td>
              <td>{gp.circuito ?? "—"}</td>
              <td>{gp.pais ?? "—"}</td>
              <td>
                {gp.fecha
                  ? new Date(gp.fecha).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </td>
              <td>{ESTADO_LABEL[gp.estado]}</td>
              <td>{gp.tiene_sprint ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
