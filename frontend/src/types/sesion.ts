export type TipoSesion = "qualy" | "sprint_qualy" | "sprint" | "carrera";
export type EstadoSesion = "pendiente" | "completada";

export interface InscripcionPublica {
  piloto_id: number;
  nombre_piloto: string;
  equipo_id: number;
  nombre_equipo: string;
}

export interface ResultadoPublico {
  id: number;
  posicion: number | null;
  puntos: number | null;
  vuelta_rapida: boolean;
  inscripcion: InscripcionPublica;
}

export interface SesionConResultados {
  id: number;
  tipo: TipoSesion;
  estado: EstadoSesion;
  resultados: ResultadoPublico[];
}
