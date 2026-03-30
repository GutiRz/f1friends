package model

// EstadoInscripcion representa el estado de participación de un piloto en un GP.
type EstadoInscripcion string

const (
	EstadoInscrito   EstadoInscripcion = "inscrito"
	EstadoAusente    EstadoInscripcion = "ausente"
	EstadoSustituido EstadoInscripcion = "sustituido"
	EstadoParticipo  EstadoInscripcion = "participo"
)

// InscripcionGP representa la participación de un piloto en un Gran Premio concreto.
// El equipo_id aquí es el que computa en constructores, independientemente
// de la asignación base del piloto en la temporada.
type InscripcionGP struct {
	ID           int               `json:"id"`
	GranPremioID int               `json:"gran_premio_id"`
	PilotoID     int               `json:"piloto_id"`
	EquipoID     int               `json:"equipo_id"`
	Estado       EstadoInscripcion `json:"estado"`
}
