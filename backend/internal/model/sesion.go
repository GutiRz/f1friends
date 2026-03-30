package model

// TipoSesion representa el tipo de sesión dentro de un Gran Premio.
type TipoSesion string

const (
	TipoQualy       TipoSesion = "qualy"
	TipoSprintQualy TipoSesion = "sprint_qualy"
	TipoSprint      TipoSesion = "sprint"
	TipoCarrera     TipoSesion = "carrera"
)

// EstadoSesion representa el estado de una sesión.
type EstadoSesion string

const (
	EstadoSesionPendiente  EstadoSesion = "pendiente"
	EstadoSesionCompletada EstadoSesion = "completada"
)

// Sesion representa una sesión (qualy, sprint o carrera) de un Gran Premio.
type Sesion struct {
	ID           int          `json:"id"`
	GranPremioID int          `json:"gran_premio_id"`
	Tipo         TipoSesion   `json:"tipo"`
	Estado       EstadoSesion `json:"estado"`
}
