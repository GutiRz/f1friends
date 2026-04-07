export type EstadoGP = "pendiente" | "en_curso" | "completado";

export interface GranPremio {
  id: number;
  temporada_id: number;
  nombre: string;
  circuito?: string;
  pais?: string;
  fecha?: string;
  tiene_sprint: boolean;
  estado: EstadoGP;
  orden: number;
}
