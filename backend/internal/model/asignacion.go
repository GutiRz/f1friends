package model

// AsignacionVigente representa la asignación activa de un piloto a una temporada.
// Solo se usa para leer las asignaciones vigentes (fecha_hasta IS NULL).
type AsignacionVigente struct {
	PilotoID int
	EquipoID *int   // nil si el piloto es reserva sin equipo fijo
	Tipo     string // "titular" | "reserva"
}
