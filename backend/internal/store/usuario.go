package store

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"f1friends/backend/internal/model"
)

// UsuarioStore gestiona el acceso a la tabla usuarios.
type UsuarioStore struct {
	db *pgxpool.Pool
}

func NewUsuarioStore(db *pgxpool.Pool) *UsuarioStore {
	return &UsuarioStore{db: db}
}

// GetByEmail devuelve el usuario con el email dado, incluyendo el hash de contraseña.
// Devuelve ErrNotFound si no existe.
func (s *UsuarioStore) GetByEmail(ctx context.Context, email string) (*model.Usuario, error) {
	var u model.Usuario
	err := s.db.QueryRow(ctx,
		`SELECT id, nombre, email, password_hash FROM usuarios WHERE email = $1`,
		email,
	).Scan(&u.ID, &u.Nombre, &u.Email, &u.PasswordHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("usuarios GetByEmail: %w", err)
	}
	return &u, nil
}
