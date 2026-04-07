import type { SesionConResultados, TipoSesion } from "@/types/sesion";

type Props = {
  sesiones: SesionConResultados[];
};

const TIPO_LABEL: Record<TipoSesion, string> = {
  qualy: "Qualy",
  sprint_qualy: "Sprint Qualy",
  sprint: "Sprint",
  carrera: "Carrera",
};

const ESTADO_LABEL: Record<SesionConResultados["estado"], string> = {
  pendiente: "Pendiente",
  completada: "Completada",
};

function tienePuntos(tipo: TipoSesion): boolean {
  return tipo === "sprint" || tipo === "carrera";
}

const SESIONES_VISIBLES: TipoSesion[] = ["sprint", "carrera"];

export default function SesionesGranPremio({ sesiones }: Props) {
  const visibles = sesiones.filter((s) => SESIONES_VISIBLES.includes(s.tipo));

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2>Sesiones</h2>

      {visibles.length === 0 ? (
        <p style={{ marginTop: "1rem", color: "#666" }}>
          No hay sesiones de carrera o sprint disponibles.
        </p>
      ) : (
        visibles.map((sesion) => {
          const conPuntos = tienePuntos(sesion.tipo);
          return (
            <div key={sesion.id} style={{ marginTop: "1.5rem" }}>
              <h3 style={{ display: "flex", gap: "0.75rem", alignItems: "baseline" }}>
                {TIPO_LABEL[sesion.tipo]}
                <span style={{ fontWeight: "normal", fontSize: "0.85rem", color: "#666" }}>
                  {ESTADO_LABEL[sesion.estado]}
                </span>
              </h3>

              {sesion.resultados.length === 0 ? (
                <p style={{ marginTop: "0.5rem", color: "#666", fontSize: "0.9rem" }}>
                  No hay resultados disponibles.
                </p>
              ) : (
                <div style={{ marginTop: "0.75rem", overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Pos.</th>
                        <th>Piloto</th>
                        <th>Equipo</th>
                        {conPuntos && <th>Puntos</th>}
                        <th>VR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sesion.resultados.map((r) => (
                        <tr key={r.id}>
                          <td>{r.posicion ?? "—"}</td>
                          <td>{r.inscripcion.nombre_piloto}</td>
                          <td>{r.inscripcion.nombre_equipo}</td>
                          {conPuntos && <td>{r.puntos ?? "—"}</td>}
                          <td>{r.vuelta_rapida ? "Sí" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
