package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// AsignacionStore gestiona el acceso a la tabla asignaciones_piloto.
type AsignacionStore struct {
	db *pgxpool.Pool
}

func NewAsignacionStore(db *pgxpool.Pool) *AsignacionStore {
	return &AsignacionStore{db: db}
}

// GetVigentesByTemporada devuelve las asignaciones activas de una temporada
// (aquellas con fecha_hasta IS NULL), ordenadas por tipo y piloto_id.
func (s *AsignacionStore) GetVigentesByTemporada(ctx context.Context, temporadaID int) ([]model.AsignacionVigente, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, piloto_id, temporada_id, equipo_id, tipo
		 FROM asignaciones_piloto
		 WHERE temporada_id = $1 AND fecha_hasta IS NULL
		 ORDER BY tipo, piloto_id`,
		temporadaID,
	)
	if err != nil {
		return nil, fmt.Errorf("asignaciones GetVigentesByTemporada: %w", err)
	}
	defer rows.Close()

	asignaciones := make([]model.AsignacionVigente, 0)
	for rows.Next() {
		var a model.AsignacionVigente
		if err := rows.Scan(&a.ID, &a.PilotoID, &a.TemporadaID, &a.EquipoID, &a.Tipo); err != nil {
			return nil, fmt.Errorf("asignaciones GetVigentesByTemporada scan: %w", err)
		}
		asignaciones = append(asignaciones, a)
	}
	return asignaciones, rows.Err()
}

// GetPilotosDeTemporada devuelve los pilotos asignados a una temporada con nombre y tipo,
// ordenados por tipo y nombre_publico.
func (s *AsignacionStore) GetPilotosDeTemporada(ctx context.Context, temporadaID int) ([]model.PilotoDeTemporada, error) {
	rows, err := s.db.Query(ctx,
		`SELECT p.id, p.nombre_publico, p.numero, a.tipo, a.equipo_id
		 FROM asignaciones_piloto a
		 JOIN pilotos p ON p.id = a.piloto_id
		 WHERE a.temporada_id = $1 AND a.fecha_hasta IS NULL
		 ORDER BY a.tipo, p.nombre_publico`,
		temporadaID,
	)
	if err != nil {
		return nil, fmt.Errorf("asignaciones GetPilotosDeTemporada: %w", err)
	}
	defer rows.Close()

	result := make([]model.PilotoDeTemporada, 0)
	for rows.Next() {
		var p model.PilotoDeTemporada
		if err := rows.Scan(&p.PilotoID, &p.NombrePublico, &p.Numero, &p.Tipo, &p.EquipoID); err != nil {
			return nil, fmt.Errorf("asignaciones GetPilotosDeTemporada scan: %w", err)
		}
		result = append(result, p)
	}
	return result, rows.Err()
}

// Create inserta una nueva asignación vigente (fecha_hasta = NULL, fecha_desde = hoy).
// Devuelve ErrDuplicate si el piloto ya tiene una asignación vigente en esa temporada.
func (s *AsignacionStore) Create(ctx context.Context, a model.AsignacionVigente) (*model.AsignacionVigente, error) {
	var exists bool
	err := s.db.QueryRow(ctx,
		`SELECT EXISTS (
			SELECT 1 FROM asignaciones_piloto
			WHERE piloto_id = $1 AND temporada_id = $2 AND fecha_hasta IS NULL
		)`,
		a.PilotoID, a.TemporadaID,
	).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("asignaciones Create (check): %w", err)
	}
	if exists {
		return nil, ErrDuplicate
	}

	err = s.db.QueryRow(ctx,
		`INSERT INTO asignaciones_piloto (piloto_id, temporada_id, equipo_id, tipo, fecha_desde)
		 VALUES ($1, $2, $3, $4, CURRENT_DATE)
		 RETURNING id, piloto_id, temporada_id, equipo_id, tipo`,
		a.PilotoID, a.TemporadaID, a.EquipoID, a.Tipo,
	).Scan(&a.ID, &a.PilotoID, &a.TemporadaID, &a.EquipoID, &a.Tipo)
	if err != nil {
		if isForeignKeyViolation(err) {
			return nil, ErrForeignKey
		}
		return nil, fmt.Errorf("asignaciones Create: %w", err)
	}
	return &a, nil
}
