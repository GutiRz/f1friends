package store

import (
	"errors"

	"github.com/jackc/pgx/v5/pgconn"
)

// Errores de store usados por los handlers para mapear respuestas HTTP.
var (
	ErrNotFound   = errors.New("recurso no encontrado")
	ErrDuplicate  = errors.New("valor duplicado")
	ErrForeignKey = errors.New("referencia a recurso inexistente")
	ErrConflict   = errors.New("datos dependientes impiden el cambio")
)

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23503"
}
