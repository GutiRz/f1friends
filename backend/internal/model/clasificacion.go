package model

// ClasificacionPilotoRow representa una fila en la clasificación de pilotos.
// Pos1-Pos10 contienen cuántas veces el piloto acabó en esa posición
// en sesiones puntuables (sprint y carrera) ya completadas.
// Se usan también como criterio de desempate en ese orden.
type ClasificacionPilotoRow struct {
	PilotoID      int    `json:"piloto_id"`
	NombrePublico string `json:"nombre_publico"`
	PuntosTotales int    `json:"puntos_totales"`
	Pos1          int    `json:"pos1"`
	Pos2          int    `json:"pos2"`
	Pos3          int    `json:"pos3"`
	Pos4          int    `json:"pos4"`
	Pos5          int    `json:"pos5"`
	Pos6          int    `json:"pos6"`
	Pos7          int    `json:"pos7"`
	Pos8          int    `json:"pos8"`
	Pos9          int    `json:"pos9"`
	Pos10         int    `json:"pos10"`
}

// ClasificacionConstructorRow representa una fila en la clasificación de constructores.
type ClasificacionConstructorRow struct {
	EquipoID      int    `json:"equipo_id"`
	NombreEquipo  string `json:"nombre_equipo"`
	PuntosTotales int    `json:"puntos_totales"`
}
