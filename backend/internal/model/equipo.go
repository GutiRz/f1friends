package model

// Equipo representa una escudería participante en la liga.
type Equipo struct {
	ID     int     `json:"id"`
	Nombre string  `json:"nombre"`
	Color  *string `json:"color,omitempty"` // color hex #RRGGBB; nil si no definido
	Logo   *string `json:"logo,omitempty"`  // URL o ruta del logo; nil si no definido
}
