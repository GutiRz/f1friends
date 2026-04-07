export type EstadoInscripcion =
  | "pendiente"
  | "inscrito"
  | "ausente"
  | "sustituido"
  | "participo";

export interface InscripcionGP {
  id: number;
  gran_premio_id: number;
  piloto_id: number;
  equipo_id: number | null; // null para reservas sin equipo asignado
  estado: EstadoInscripcion;
}
