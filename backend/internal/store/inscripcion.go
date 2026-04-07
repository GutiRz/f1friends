package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// InscripcionStore gestiona el acceso a la tabla inscripciones_gp.
type InscripcionStore struct {
	db *pgxpool.Pool
}

func NewInscripcionStore(db *pgxpool.Pool) *InscripcionStore {
	return &InscripcionStore{db: db}
}

const inscripcionCols = `id, gran_premio_id, piloto_id, equipo_id, estado`

func scanInscripcion(row interface{ Scan(...any) error }, i *model.InscripcionGP) error {
	return row.Scan(&i.ID, &i.GranPremioID, &i.PilotoID, &i.EquipoID, &i.Estado)
}

// GetAllByGP devuelve las inscripciones de un Gran Premio ordenadas por piloto_id.
func (s *InscripcionStore) GetAllByGP(ctx context.Context, granPremioID int) ([]model.InscripcionGP, error) {
	rows, err := s.db.Query(ctx,
		`SELECT `+inscripcionCols+` FROM inscripciones_gp WHERE gran_premio_id = $1 ORDER BY piloto_id`,
		granPremioID,
	)
	if err != nil {
		return nil, fmt.Errorf("inscripciones GetAllByGP: %w", err)
	}
	defer rows.Close()

	inscripciones := make([]model.InscripcionGP, 0)
	for rows.Next() {
		var i model.InscripcionGP
		if err := scanInscripcion(rows, &i); err != nil {
			return nil, fmt.Errorf("inscripciones GetAllByGP scan: %w", err)
		}
		inscripciones = append(inscripciones, i)
	}
	return inscripciones, rows.Err()
}

// GetByID devuelve la inscripción con el id dado o ErrNotFound si no existe.
func (s *InscripcionStore) GetByID(ctx context.Context, id int) (*model.InscripcionGP, error) {
	var i model.InscripcionGP
	err := scanInscripcion(
		s.db.QueryRow(ctx,
			`SELECT `+inscripcionCols+` FROM inscripciones_gp WHERE id = $1`, id,
		),
		&i,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("inscripciones GetByID: %w", err)
	}
	return &i, nil
}

// Create inserta una inscripción nueva y devuelve el registro creado.
// EquipoID puede ser nil (reservas sin equipo asignado).
// Devuelve ErrDuplicate si el piloto ya está inscrito en ese GP.
// Devuelve ErrForeignKey si gran_premio_id, piloto_id o equipo_id no existen.
func (s *InscripcionStore) Create(ctx context.Context, i model.InscripcionGP) (*model.InscripcionGP, error) {
	var created model.InscripcionGP
	err := scanInscripcion(
		s.db.QueryRow(ctx,
			`INSERT INTO inscripciones_gp (gran_premio_id, piloto_id, equipo_id, estado)
			 VALUES ($1, $2, $3, $4)
			 RETURNING `+inscripcionCols,
			i.GranPremioID, i.PilotoID, i.EquipoID, i.Estado,
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
		return nil, fmt.Errorf("inscripciones Create: %w", err)
	}
	return &created, nil
}

// Update modifica piloto_id, equipo_id y estado de una inscripción existente.
// EquipoID puede ser nil (reservas sin equipo asignado).
// Devuelve ErrNotFound si la inscripción no existe.
// Devuelve ErrDuplicate si el nuevo piloto_id ya tiene inscripción en ese GP.
// Devuelve ErrForeignKey si piloto_id o equipo_id no existen.
func (s *InscripcionStore) Update(ctx context.Context, id int, i model.InscripcionGP) (*model.InscripcionGP, error) {
	var updated model.InscripcionGP
	err := scanInscripcion(
		s.db.QueryRow(ctx,
			`UPDATE inscripciones_gp SET piloto_id = $1, equipo_id = $2, estado = $3
			 WHERE id = $4
			 RETURNING `+inscripcionCols,
			i.PilotoID, i.EquipoID, i.Estado, id,
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
		if isForeignKeyViolation(err) {
			return nil, ErrForeignKey
		}
		return nil, fmt.Errorf("inscripciones Update: %w", err)
	}
	return &updated, nil
}
