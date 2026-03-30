package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// ResultadoSesionStore gestiona el acceso a la tabla resultados_sesion.
type ResultadoSesionStore struct {
	db *pgxpool.Pool
}

func NewResultadoSesionStore(db *pgxpool.Pool) *ResultadoSesionStore {
	return &ResultadoSesionStore{db: db}
}

const resultadoCols = `id, sesion_id, inscripcion_id, posicion_original, posicion, puntos, pole, vuelta_rapida`

func scanResultado(row interface{ Scan(...any) error }, r *model.ResultadoSesion) error {
	return row.Scan(
		&r.ID, &r.SesionID, &r.InscripcionID,
		&r.PosicionOriginal, &r.Posicion, &r.Puntos,
		&r.Pole, &r.VueltaRapida,
	)
}

// GetAllBySesion devuelve los resultados de una sesión ordenados por posicion_original.
func (s *ResultadoSesionStore) GetAllBySesion(ctx context.Context, sesionID int) ([]model.ResultadoSesion, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+resultadoCols+` FROM resultados_sesion WHERE sesion_id = $1 ORDER BY posicion_original`,
		sesionID,
	)
	if err != nil {
		return nil, fmt.Errorf("resultados GetAllBySesion: %w", err)
	}
	defer rows.Close()

	resultados := make([]model.ResultadoSesion, 0)
	for rows.Next() {
		var r model.ResultadoSesion
		if err := scanResultado(rows, &r); err != nil {
			return nil, fmt.Errorf("resultados GetAllBySesion scan: %w", err)
		}
		resultados = append(resultados, r)
	}
	return resultados, rows.Err()
}

// GetByID devuelve el resultado con el id dado o ErrNotFound si no existe.
func (s *ResultadoSesionStore) GetByID(ctx context.Context, id int) (*model.ResultadoSesion, error) {
	var r model.ResultadoSesion
	err := scanResultado(
		s.db.QueryRow(ctx, `SELECT `+resultadoCols+` FROM resultados_sesion WHERE id = $1`, id),
		&r,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("resultados GetByID: %w", err)
	}
	return &r, nil
}

// Create inserta un resultado nuevo y devuelve el registro creado.
// Devuelve ErrDuplicate si la inscripción ya tiene resultado o la posición ya está ocupada.
// Devuelve ErrForeignKey si sesion_id o inscripcion_id no existen.
func (s *ResultadoSesionStore) Create(ctx context.Context, r model.ResultadoSesion) (*model.ResultadoSesion, error) {
	var created model.ResultadoSesion
	err := scanResultado(
		s.db.QueryRow(ctx,
			`INSERT INTO resultados_sesion
				(sesion_id, inscripcion_id, posicion_original, posicion, puntos, pole, vuelta_rapida)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)
			 RETURNING `+resultadoCols,
			r.SesionID, r.InscripcionID, r.PosicionOriginal, r.Posicion, r.Puntos, r.Pole, r.VueltaRapida,
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
		return nil, fmt.Errorf("resultados Create: %w", err)
	}
	return &created, nil
}

// Update modifica posicion_original, posicion, puntos, pole y vuelta_rapida de un resultado.
// Devuelve ErrNotFound si el resultado no existe.
// Devuelve ErrDuplicate si la nueva posicion_original ya está ocupada en esa sesión.
func (s *ResultadoSesionStore) Update(ctx context.Context, id int, r model.ResultadoSesion) (*model.ResultadoSesion, error) {
	var updated model.ResultadoSesion
	err := scanResultado(
		s.db.QueryRow(ctx,
			`UPDATE resultados_sesion SET
				posicion_original = $1, posicion = $2, puntos = $3,
				pole = $4, vuelta_rapida = $5
			 WHERE id = $6
			 RETURNING `+resultadoCols,
			r.PosicionOriginal, r.Posicion, r.Puntos, r.Pole, r.VueltaRapida, id,
		),
		&updated,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrDuplicate
		}
		return nil, fmt.Errorf("resultados Update: %w", err)
	}
	return &updated, nil
}
