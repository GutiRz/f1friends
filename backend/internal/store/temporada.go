package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// TemporadaStore gestiona el acceso a la tabla temporadas.
type TemporadaStore struct {
	db *pgxpool.Pool
}

func NewTemporadaStore(db *pgxpool.Pool) *TemporadaStore {
	return &TemporadaStore{db: db}
}

const temporadaCols = `id, nombre, anio, descripcion, activa, normativa`

func scanTemporada(row interface{ Scan(...any) error }, t *model.Temporada) error {
	return row.Scan(&t.ID, &t.Nombre, &t.Anio, &t.Descripcion, &t.Activa, &t.Normativa)
}

// GetAll devuelve todas las temporadas ordenadas por anio descendente.
func (s *TemporadaStore) GetAll(ctx context.Context) ([]model.Temporada, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+temporadaCols+` FROM temporadas ORDER BY anio DESC`,
	)
	if err != nil {
		return nil, fmt.Errorf("temporadas GetAll: %w", err)
	}
	defer rows.Close()

	temporadas := make([]model.Temporada, 0)
	for rows.Next() {
		var t model.Temporada
		if err := scanTemporada(rows, &t); err != nil {
			return nil, fmt.Errorf("temporadas GetAll scan: %w", err)
		}
		temporadas = append(temporadas, t)
	}
	return temporadas, rows.Err()
}

// GetActiva devuelve la temporada activa o ErrNotFound si no hay ninguna.
func (s *TemporadaStore) GetActiva(ctx context.Context) (*model.Temporada, error) {
	var t model.Temporada
	err := scanTemporada(
		s.db.QueryRow(ctx,
			`SELECT `+temporadaCols+` FROM temporadas WHERE activa = true LIMIT 1`,
		),
		&t,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("temporadas GetActiva: %w", err)
	}
	return &t, nil
}

// GetByID devuelve la temporada con el id dado o ErrNotFound si no existe.
func (s *TemporadaStore) GetByID(ctx context.Context, id int) (*model.Temporada, error) {
	var t model.Temporada
	err := scanTemporada(
		s.db.QueryRow(ctx,
			`SELECT `+temporadaCols+` FROM temporadas WHERE id = $1`, id,
		),
		&t,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("temporadas GetByID: %w", err)
	}
	return &t, nil
}

// Create inserta una temporada nueva y devuelve el registro creado.
func (s *TemporadaStore) Create(ctx context.Context, t model.Temporada) (*model.Temporada, error) {
	var created model.Temporada
	err := scanTemporada(
		s.db.QueryRow(ctx,
			`INSERT INTO temporadas (nombre, anio, descripcion, activa, normativa)
			 VALUES ($1, $2, $3, $4, $5)
			 RETURNING `+temporadaCols,
			t.Nombre, t.Anio, t.Descripcion, t.Activa, t.Normativa,
		),
		&created,
	)
	if err != nil {
		return nil, fmt.Errorf("temporadas Create: %w", err)
	}
	return &created, nil
}

// Update modifica la temporada con el id dado y devuelve el registro actualizado.
// Devuelve ErrNotFound si la temporada no existe.
func (s *TemporadaStore) Update(ctx context.Context, id int, t model.Temporada) (*model.Temporada, error) {
	var updated model.Temporada
	err := scanTemporada(
		s.db.QueryRow(ctx,
			`UPDATE temporadas SET
				nombre = $1, anio = $2, descripcion = $3, normativa = $4
			 WHERE id = $5
			 RETURNING `+temporadaCols,
			t.Nombre, t.Anio, t.Descripcion, t.Normativa, id,
		),
		&updated,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("temporadas Update: %w", err)
	}
	return &updated, nil
}

// Activar desactiva cualquier temporada activa y activa la elegida, en una transacción.
// Devuelve ErrNotFound si la temporada con el id dado no existe.
func (s *TemporadaStore) Activar(ctx context.Context, id int) (*model.Temporada, error) {
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("temporadas Activar begin: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// Desactivar todas las temporadas activas (puede haber como máximo una por el índice parcial).
	_, err = tx.Exec(ctx, `UPDATE temporadas SET activa = false WHERE activa = true`)
	if err != nil {
		return nil, fmt.Errorf("temporadas Activar desactivar: %w", err)
	}

	// Activar la temporada elegida y devolver el registro actualizado.
	var updated model.Temporada
	err = scanTemporada(
		tx.QueryRow(ctx,
			`UPDATE temporadas SET activa = true WHERE id = $1 RETURNING `+temporadaCols,
			id,
		),
		&updated,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("temporadas Activar activar: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("temporadas Activar commit: %w", err)
	}
	return &updated, nil
}
