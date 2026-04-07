export type EstadoInscripcion = "inscrito" | "ausente" | "sustituido" | "participo";

export interface InscripcionGP {
  id: number;
  gran_premio_id: number;
  piloto_id: number;
  equipo_id: number;
  estado: EstadoInscripcion;
}
