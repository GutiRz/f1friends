package model

// ResultadoPublico es el payload de un resultado dentro de una sesión pública.
// Incluye nombre de piloto y equipo para evitar lookups adicionales en el cliente.
type ResultadoPublico struct {
	ID           int                `json:"id"`
	Posicion     *int               `json:"posicion"`
	Puntos       *int               `json:"puntos"`
	VueltaRapida bool               `json:"vuelta_rapida"`
	Inscripcion  InscripcionPublica `json:"inscripcion"`
}

// InscripcionPublica identifica al piloto y equipo dentro de un resultado público.
type InscripcionPublica struct {
	PilotoID     int    `json:"piloto_id"`
	NombrePiloto string `json:"nombre_piloto"`
	EquipoID     int    `json:"equipo_id"`
	NombreEquipo string `json:"nombre_equipo"`
}

// SesionConResultados es el payload de una sesión pública con sus resultados embebidos.
type SesionConResultados struct {
	ID         int               `json:"id"`
	Tipo       TipoSesion        `json:"tipo"`
	Estado     EstadoSesion      `json:"estado"`
	Resultados []ResultadoPublico `json:"resultados"`
}
