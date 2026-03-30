package model

// Temporada representa una temporada de la liga.
type Temporada struct {
	ID          int     `json:"id"`
	Nombre      string  `json:"nombre"`
	Anio        int     `json:"anio"`
	Descripcion *string `json:"descripcion,omitempty"`
	Activa      bool    `json:"activa"`
	Normativa   *string `json:"normativa,omitempty"`
}
