package model

// AsignacionVigente representa la asignación activa de un piloto a una temporada.
// Solo se usa para leer las asignaciones vigentes (fecha_hasta IS NULL).
type AsignacionVigente struct {
	ID          int    `json:"id"`
	PilotoID    int    `json:"piloto_id"`
	TemporadaID int    `json:"temporada_id"`
	EquipoID    *int   `json:"equipo_id"` // nil si el piloto es reserva sin equipo fijo
	Tipo        string `json:"tipo"`      // "titular" | "reserva"
	Orden       int    `json:"orden"`     // 1 = primer piloto/reserva prioritario
}

// PilotoDeTemporada combina datos del piloto con su asignación vigente a una temporada.
// Usado por la vista pública de pilotos de temporada.
type PilotoDeTemporada struct {
	PilotoID      int    `json:"piloto_id"`
	NombrePublico string `json:"nombre_publico"`
	Numero        *int   `json:"numero,omitempty"`
	Tipo          string `json:"tipo"`      // "titular" | "reserva"
	EquipoID      *int   `json:"equipo_id"` // nil para reservas
	Orden         int    `json:"orden"`     // 1 = primer piloto/reserva prioritario
}
