export interface AsignacionVigente {
  id: number;
  piloto_id: number;
  temporada_id: number;
  equipo_id: number | null;
  tipo: "titular" | "reserva";
  orden: number;
}
