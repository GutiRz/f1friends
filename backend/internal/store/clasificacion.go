package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// ClasificacionStore resuelve las consultas de clasificación del campeonato.
// Solo lectura: no tiene operaciones de escritura.
type ClasificacionStore struct {
	db *pgxpool.Pool
}

func NewClasificacionStore(db *pgxpool.Pool) *ClasificacionStore {
	return &ClasificacionStore{db: db}
}

// GetPilotos devuelve la clasificación de pilotos de una temporada.
//
// Incluye todos los pilotos con al menos una inscripción en cualquier GP
// de la temporada, aunque aún no tengan resultados (aparecen con 0 puntos).
//
// Solo cuentan sesiones de tipo sprint o carrera con estado = 'completada'.
//
// Desempate en orden: puntos → pos1 → pos2 → … → pos10 → nombre.
func (s *ClasificacionStore) GetPilotos(ctx context.Context, temporadaID int) ([]model.ClasificacionPilotoRow, error) {
	rows, err := s.db.Query(ctx, `
		WITH pilotos_temporada AS (
			-- Todos los pilotos asignados a la temporada (vigentes).
			SELECT a.piloto_id, p.nombre_publico
			FROM asignaciones_piloto a
			JOIN pilotos p ON p.id = a.piloto_id
			WHERE a.temporada_id = $1 AND a.fecha_hasta IS NULL
		),
		scoring AS (
			-- Resultados de sesiones puntuables ya completadas de esta temporada.
			SELECT r.puntos, r.posicion, i.piloto_id
			FROM gran_premios gp
			JOIN sesiones ses
				ON ses.gran_premio_id = gp.id
				AND ses.tipo   IN ('sprint', 'carrera')
				AND ses.estado = 'completada'
			JOIN resultados_sesion r ON r.sesion_id     = ses.id
			JOIN inscripciones_gp i  ON i.id            = r.inscripcion_id
			WHERE gp.temporada_id = $1
		)
		SELECT
			pt.piloto_id,
			pt.nombre_publico,
			COALESCE(SUM(sc.puntos),   0)::int                           AS puntos_totales,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 1)::int       AS pos1,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 2)::int       AS pos2,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 3)::int       AS pos3,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 4)::int       AS pos4,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 5)::int       AS pos5,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 6)::int       AS pos6,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 7)::int       AS pos7,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 8)::int       AS pos8,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 9)::int       AS pos9,
			COUNT(sc.posicion) FILTER (WHERE sc.posicion = 10)::int      AS pos10
		FROM pilotos_temporada pt
		LEFT JOIN scoring sc ON sc.piloto_id = pt.piloto_id
		GROUP BY pt.piloto_id, pt.nombre_publico
		ORDER BY
			puntos_totales DESC,
			pos1 DESC, pos2 DESC, pos3 DESC, pos4 DESC, pos5 DESC,
			pos6 DESC, pos7 DESC, pos8 DESC, pos9 DESC, pos10 DESC,
			pt.nombre_publico ASC
	`, temporadaID)
	if err != nil {
		return nil, fmt.Errorf("clasificacion GetPilotos: %w", err)
	}
	defer rows.Close()

	clasificacion := make([]model.ClasificacionPilotoRow, 0)
	for rows.Next() {
		var row model.ClasificacionPilotoRow
		if err := rows.Scan(
			&row.PilotoID, &row.NombrePublico, &row.PuntosTotales,
			&row.Pos1, &row.Pos2, &row.Pos3, &row.Pos4, &row.Pos5,
			&row.Pos6, &row.Pos7, &row.Pos8, &row.Pos9, &row.Pos10,
		); err != nil {
			return nil, fmt.Errorf("clasificacion GetPilotos scan: %w", err)
		}
		clasificacion = append(clasificacion, row)
	}
	return clasificacion, rows.Err()
}

// GetConstructores devuelve la clasificación de constructores de una temporada.
//
// Incluye todos los equipos con al menos una inscripción en cualquier GP
// de la temporada, aunque aún no tengan resultados (aparecen con 0 puntos).
//
// Se usa el equipo_id de inscripciones_gp, que refleja el equipo real del GP
// independientemente de la asignación base del piloto en la temporada.
//
// Solo cuentan sesiones de tipo sprint o carrera con estado = 'completada'.
func (s *ClasificacionStore) GetConstructores(ctx context.Context, temporadaID int) ([]model.ClasificacionConstructorRow, error) {
	rows, err := s.db.Query(ctx, `
		WITH equipos_temporada AS (
			-- Todos los equipos con al menos un titular asignado a la temporada (vigente).
			SELECT DISTINCT a.equipo_id, e.nombre AS nombre_equipo
			FROM asignaciones_piloto a
			JOIN equipos e ON e.id = a.equipo_id
			WHERE a.temporada_id = $1 AND a.fecha_hasta IS NULL AND a.equipo_id IS NOT NULL
		),
		scoring AS (
			-- Resultados de sesiones puntuables ya completadas de esta temporada.
			SELECT r.puntos, i.equipo_id
			FROM gran_premios gp
			JOIN sesiones ses
				ON ses.gran_premio_id = gp.id
				AND ses.tipo   IN ('sprint', 'carrera')
				AND ses.estado = 'completada'
			JOIN resultados_sesion r ON r.sesion_id     = ses.id
			JOIN inscripciones_gp i  ON i.id            = r.inscripcion_id
			WHERE gp.temporada_id = $1
		)
		SELECT
			et.equipo_id,
			et.nombre_equipo,
			COALESCE(SUM(sc.puntos), 0)::int AS puntos_totales
		FROM equipos_temporada et
		LEFT JOIN scoring sc ON sc.equipo_id = et.equipo_id
		GROUP BY et.equipo_id, et.nombre_equipo
		ORDER BY puntos_totales DESC, et.nombre_equipo ASC
	`, temporadaID)
	if err != nil {
		return nil, fmt.Errorf("clasificacion GetConstructores: %w", err)
	}
	defer rows.Close()

	clasificacion := make([]model.ClasificacionConstructorRow, 0)
	for rows.Next() {
		var row model.ClasificacionConstructorRow
		if err := rows.Scan(&row.EquipoID, &row.NombreEquipo, &row.PuntosTotales); err != nil {
			return nil, fmt.Errorf("clasificacion GetConstructores scan: %w", err)
		}
		clasificacion = append(clasificacion, row)
	}
	return clasificacion, rows.Err()
}
