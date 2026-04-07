package model

// EstadoInscripcion representa el estado de participación de un piloto en un GP.
type EstadoInscripcion string

const (
	EstadoInscripcionPendiente  EstadoInscripcion = "pendiente"  // reserva sin participación confirmada
	EstadoInscrito              EstadoInscripcion = "inscrito"
	EstadoAusente               EstadoInscripcion = "ausente"
	EstadoSustituido            EstadoInscripcion = "sustituido"
	EstadoParticipo             EstadoInscripcion = "participo"
)

// InscripcionGP representa la participación de un piloto en un Gran Premio concreto.
// EquipoID es nil para reservas que no tienen equipo asignado en este GP.
// Los resultados de inscripciones con EquipoID nil no computan en constructores.
type InscripcionGP struct {
	ID           int               `json:"id"`
	GranPremioID int               `json:"gran_premio_id"`
	PilotoID     int               `json:"piloto_id"`
	EquipoID     *int              `json:"equipo_id"`
	Estado       EstadoInscripcion `json:"estado"`
}
