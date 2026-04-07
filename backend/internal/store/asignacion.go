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
		`SELECT piloto_id, equipo_id, tipo
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
		if err := rows.Scan(&a.PilotoID, &a.EquipoID, &a.Tipo); err != nil {
			return nil, fmt.Errorf("asignaciones GetVigentesByTemporada scan: %w", err)
		}
		asignaciones = append(asignaciones, a)
	}
	return asignaciones, rows.Err()
}
