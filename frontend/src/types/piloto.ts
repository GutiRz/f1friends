export interface Piloto {
  id: number;
  nombre_publico: string;
  nombre_real?: string | null;
  nacionalidad?: string | null;
  numero?: number | null;
  id_psn?: string | null;
  id_ea?: string | null;
  id_xbox?: string | null;
  twitch_url?: string | null;
  youtube_url?: string | null;
  avatar_url?: string | null;
  activo: boolean;
}
