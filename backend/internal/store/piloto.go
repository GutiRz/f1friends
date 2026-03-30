package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// PilotoStore gestiona el acceso a la tabla pilotos.
type PilotoStore struct {
	db *pgxpool.Pool
}

func NewPilotoStore(db *pgxpool.Pool) *PilotoStore {
	return &PilotoStore{db: db}
}

// columnas seleccionadas en todas las consultas de pilotos.
const pilotoCols = `
	id, nombre_publico, nombre_real, nacionalidad, numero,
	id_psn, id_ea, id_xbox, twitch_url, youtube_url, avatar_url, activo
	`

// scanPiloto centraliza el escaneo de una fila de piloto para no repetirlo en cada método.
func scanPiloto(row interface{ Scan(...any) error }, p *model.Piloto) error {
	return row.Scan(
		&p.ID, &p.NombrePublico, &p.NombreReal, &p.Nacionalidad, &p.Numero,
		&p.IdPsn, &p.IdEa, &p.IdXbox, &p.TwitchUrl, &p.YoutubeUrl, &p.AvatarUrl, &p.Activo,
	)
}

// GetAll devuelve pilotos ordenados por nombre_publico.
// Si soloActivos es true, filtra los que tienen activo = false.
func (s *PilotoStore) GetAll(ctx context.Context, soloActivos bool) ([]model.Piloto, error) {
	query := `SELECT ` + pilotoCols + ` FROM pilotos`
	if soloActivos {
		query += ` WHERE activo = true`
	}
	query += ` ORDER BY nombre_publico`

	rows, err := s.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("pilotos GetAll: %w", err)
	}
	defer rows.Close()

	pilotos := make([]model.Piloto, 0)
	for rows.Next() {
		var p model.Piloto
		if err := scanPiloto(rows, &p); err != nil {
			return nil, fmt.Errorf("pilotos GetAll scan: %w", err)
		}
		pilotos = append(pilotos, p)
	}
	return pilotos, rows.Err()
}

// GetByID devuelve el piloto con el id dado o ErrNotFound si no existe.
func (s *PilotoStore) GetByID(ctx context.Context, id int) (*model.Piloto, error) {
	var p model.Piloto
	err := scanPiloto(
		s.db.QueryRow(ctx, `SELECT `+pilotoCols+` FROM pilotos WHERE id = $1`, id),
		&p,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("pilotos GetByID: %w", err)
	}
	return &p, nil
}

// Create inserta un piloto nuevo y devuelve el registro creado con su id asignado.
func (s *PilotoStore) Create(ctx context.Context, p model.Piloto) (*model.Piloto, error) {
	var created model.Piloto
	err := scanPiloto(
		s.db.QueryRow(ctx,
			`INSERT INTO pilotos
				(nombre_publico, nombre_real, nacionalidad, numero,
				 id_psn, id_ea, id_xbox, twitch_url, youtube_url, avatar_url, activo)
			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			 RETURNING `+pilotoCols,
			p.NombrePublico, p.NombreReal, p.Nacionalidad, p.Numero,
			p.IdPsn, p.IdEa, p.IdXbox, p.TwitchUrl, p.YoutubeUrl, p.AvatarUrl, p.Activo,
		),
		&created,
	)
	if err != nil {
		return nil, fmt.Errorf("pilotos Create: %w", err)
	}
	return &created, nil
}

// Update modifica el piloto con el id dado y devuelve el registro actualizado.
// Devuelve ErrNotFound si el piloto no existe.
func (s *PilotoStore) Update(ctx context.Context, id int, p model.Piloto) (*model.Piloto, error) {
	var updated model.Piloto
	err := scanPiloto(
		s.db.QueryRow(ctx,
			`UPDATE pilotos SET
				nombre_publico = $1, nombre_real = $2, nacionalidad = $3, numero = $4,
				id_psn = $5, id_ea = $6, id_xbox = $7,
				twitch_url = $8, youtube_url = $9, avatar_url = $10, activo = $11
			 WHERE id = $12
			 RETURNING `+pilotoCols,
			p.NombrePublico, p.NombreReal, p.Nacionalidad, p.Numero,
			p.IdPsn, p.IdEa, p.IdXbox, p.TwitchUrl, p.YoutubeUrl, p.AvatarUrl, p.Activo,
			id,
		),
		&updated,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("pilotos Update: %w", err)
	}
	return &updated, nil
}
