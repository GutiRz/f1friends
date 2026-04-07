package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// EquipoStore gestiona el acceso a la tabla equipos.
type EquipoStore struct {
	db *pgxpool.Pool
}

func NewEquipoStore(db *pgxpool.Pool) *EquipoStore {
	return &EquipoStore{db: db}
}

// GetAll devuelve todos los equipos ordenados por nombre.
func (s *EquipoStore) GetAll(ctx context.Context) ([]model.Equipo, error) {
	rows, err := s.db.Query(ctx,
		`SELECT id, nombre, color, logo FROM equipos ORDER BY nombre`,
	)
	if err != nil {
		return nil, fmt.Errorf("equipos GetAll: %w", err)
	}
	defer rows.Close()

	// Inicializamos con slice vacío para que la respuesta JSON sea [] en lugar de null.
	equipos := make([]model.Equipo, 0)
	for rows.Next() {
		var e model.Equipo
		if err := rows.Scan(&e.ID, &e.Nombre, &e.Color, &e.Logo); err != nil {
			return nil, fmt.Errorf("equipos GetAll scan: %w", err)
		}
		equipos = append(equipos, e)
	}
	return equipos, rows.Err()
}

// GetByID devuelve el equipo con el id dado o ErrNotFound si no existe.
func (s *EquipoStore) GetByID(ctx context.Context, id int) (*model.Equipo, error) {
	var e model.Equipo
	err := s.db.QueryRow(ctx,
		`SELECT id, nombre, color, logo FROM equipos WHERE id = $1`, id,
	).Scan(&e.ID, &e.Nombre, &e.Color, &e.Logo)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("equipos GetByID: %w", err)
	}
	return &e, nil
}

// Create inserta un equipo nuevo y devuelve el registro creado con su id asignado.
func (s *EquipoStore) Create(ctx context.Context, e model.Equipo) (*model.Equipo, error) {
	var created model.Equipo
	err := s.db.QueryRow(ctx,
		`INSERT INTO equipos (nombre, color, logo)
		 VALUES ($1, $2, $3)
		 RETURNING id, nombre, color, logo`,
		e.Nombre, e.Color, e.Logo,
	).Scan(&created.ID, &created.Nombre, &created.Color, &created.Logo)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDuplicate
		}
		return nil, fmt.Errorf("equipos Create: %w", err)
	}
	return &created, nil
}

// Update modifica el equipo con el id dado y devuelve el registro actualizado.
// Devuelve ErrNotFound si el equipo no existe.
func (s *EquipoStore) Update(ctx context.Context, id int, e model.Equipo) (*model.Equipo, error) {
	var updated model.Equipo
	err := s.db.QueryRow(ctx,
		`UPDATE equipos SET nombre = $1, color = $2, logo = $3
		 WHERE id = $4
		 RETURNING id, nombre, color, logo`,
		e.Nombre, e.Color, e.Logo, id,
	).Scan(&updated.ID, &updated.Nombre, &updated.Color, &updated.Logo)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrDuplicate
		}
		return nil, fmt.Errorf("equipos Update: %w", err)
	}
	return &updated, nil
}
