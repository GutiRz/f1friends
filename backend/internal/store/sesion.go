package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// SesionStore gestiona el acceso a la tabla sesiones.
type SesionStore struct {
	db *pgxpool.Pool
}

func NewSesionStore(db *pgxpool.Pool) *SesionStore {
	return &SesionStore{db: db}
}

const sesionCols = `id, gran_premio_id, tipo, estado`

func scanSesion(row interface{ Scan(...any) error }, s *model.Sesion) error {
	return row.Scan(&s.ID, &s.GranPremioID, &s.Tipo, &s.Estado)
}

// GetAllByGP devuelve las sesiones de un Gran Premio ordenadas por tipo.
func (s *SesionStore) GetAllByGP(ctx context.Context, granPremioID int) ([]model.Sesion, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+sesionCols+` FROM sesiones WHERE gran_premio_id = $1
		 ORDER BY CASE tipo
		     WHEN 'qualy'        THEN 1
		     WHEN 'sprint_qualy' THEN 2
		     WHEN 'sprint'       THEN 3
		     WHEN 'carrera'      THEN 4
		 END`,
		granPremioID,
	)
	if err != nil {
		return nil, fmt.Errorf("sesiones GetAllByGP: %w", err)
	}
	defer rows.Close()

	sesiones := make([]model.Sesion, 0)
	for rows.Next() {
		var ses model.Sesion
		if err := scanSesion(rows, &ses); err != nil {
			return nil, fmt.Errorf("sesiones GetAllByGP scan: %w", err)
		}
		sesiones = append(sesiones, ses)
	}
	return sesiones, rows.Err()
}

// Create inserta una sesión nueva y devuelve el registro creado.
// Devuelve ErrDuplicate si ya existe una sesión del mismo tipo para ese GP.
// Devuelve ErrForeignKey si el gran_premio_id no existe.
func (s *SesionStore) Create(ctx context.Context, ses model.Sesion) (*model.Sesion, error) {
	var created model.Sesion
	err := scanSesion(
		s.db.QueryRow(ctx,
			`INSERT INTO sesiones (gran_premio_id, tipo, estado)
			 VALUES ($1, $2, $3)
			 RETURNING `+sesionCols,
			ses.GranPremioID, ses.Tipo, ses.Estado,
		),
		&created,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDuplicate
		}
		if isForeignKeyViolation(err) {
			return nil, ErrForeignKey
		}
		return nil, fmt.Errorf("sesiones Create: %w", err)
	}
	return &created, nil
}

// UpdateEstado cambia el estado de una sesión y devuelve el registro actualizado.
// Devuelve ErrNotFound si la sesión no existe.
func (s *SesionStore) UpdateEstado(ctx context.Context, id int, estado model.EstadoSesion) (*model.Sesion, error) {
	var updated model.Sesion
	err := scanSesion(
		s.db.QueryRow(ctx,
			`UPDATE sesiones SET estado = $1 WHERE id = $2 RETURNING `+sesionCols,
			estado, id,
		),
		&updated,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("sesiones UpdateEstado: %w", err)
	}
	return &updated, nil
}
