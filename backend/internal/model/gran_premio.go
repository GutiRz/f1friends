package model

import "time"

// EstadoGP representa el estado de un Gran Premio.
type EstadoGP string

const (
	EstadoPendiente  EstadoGP = "pendiente"
	EstadoEnCurso    EstadoGP = "en_curso"
	EstadoCompletado EstadoGP = "completado"
)

// GranPremio representa un GP del calendario de una temporada.
type GranPremio struct {
	ID          int       `json:"id"`
	TemporadaID int       `json:"temporada_id"`
	Nombre      string    `json:"nombre"`
	Circuito    *string   `json:"circuito,omitempty"`
	Pais        *string   `json:"pais,omitempty"`
	Fecha       *time.Time `json:"fecha,omitempty"`
	TieneSprint bool      `json:"tiene_sprint"`
	Estado      EstadoGP  `json:"estado"`
	Orden       int       `json:"orden"`
}
