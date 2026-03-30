package model

// ResultadoSesion representa el resultado de una inscripción en una sesión concreta.
// posicion puede ser NULL si el piloto fue descalificado.
// puntos puede ser NULL en sesiones que no puntúan (qualy).
type ResultadoSesion struct {
	ID               int   `json:"id"`
	SesionID         int   `json:"sesion_id"`
	InscripcionID    int   `json:"inscripcion_id"`
	PosicionOriginal int   `json:"posicion_original"`
	Posicion         *int  `json:"posicion,omitempty"`
	Puntos           *int  `json:"puntos,omitempty"`
	Pole             bool  `json:"pole"`
	VueltaRapida     bool  `json:"vuelta_rapida"`
}
