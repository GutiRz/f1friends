package model

// Piloto representa un miembro/jugador de la liga.
// No es un piloto real de F1: es un participante con su identidad dentro de la comunidad.
type Piloto struct {
	ID            int     `json:"id"`
	NombrePublico string  `json:"nombre_publico"`          // apodo o nombre de comunidad; obligatorio
	NombreReal    *string `json:"nombre_real,omitempty"`   // nombre real; opcional
	Nacionalidad  *string `json:"nacionalidad,omitempty"`  // opcional
	Numero        *int    `json:"numero,omitempty"`        // dorsal; opcional
	IdPsn         *string `json:"id_psn,omitempty"`        // PlayStation Network
	IdEa          *string `json:"id_ea,omitempty"`         // EA Sports
	IdXbox        *string `json:"id_xbox,omitempty"`       // Xbox / Gamertag
	TwitchUrl     *string `json:"twitch_url,omitempty"`    // canal de Twitch
	YoutubeUrl    *string `json:"youtube_url,omitempty"`   // canal de YouTube
	AvatarUrl     *string `json:"avatar_url,omitempty"`    // foto o avatar
	Activo        bool    `json:"activo"`
}
