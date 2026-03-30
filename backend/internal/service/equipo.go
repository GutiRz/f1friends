package service

import (
	"context"
	"fmt"
	"regexp"
	"strings"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

var colorRegex = regexp.MustCompile(`^#[0-9A-Fa-f]{6}$`)

// ErrValidation se devuelve cuando la entrada no supera las validaciones de negocio.
// El campo Msg contiene un mensaje legible para mostrar al usuario.
type ErrValidation struct {
	Msg string
}

func (e *ErrValidation) Error() string { return e.Msg }

// EquipoService contiene la lógica de negocio del módulo de equipos.
type EquipoService struct {
	store *store.EquipoStore
}

func NewEquipoService(s *store.EquipoStore) *EquipoService {
	return &EquipoService{store: s}
}

func (s *EquipoService) GetAll(ctx context.Context) ([]model.Equipo, error) {
	return s.store.GetAll(ctx)
}

func (s *EquipoService) GetByID(ctx context.Context, id int) (*model.Equipo, error) {
	return s.store.GetByID(ctx, id)
}

func (s *EquipoService) Create(ctx context.Context, e model.Equipo) (*model.Equipo, error) {
	e.Nombre = strings.TrimSpace(e.Nombre)
	if err := validateEquipo(e); err != nil {
		return nil, err
	}
	return s.store.Create(ctx, e)
}

func (s *EquipoService) Update(ctx context.Context, id int, e model.Equipo) (*model.Equipo, error) {
	e.Nombre = strings.TrimSpace(e.Nombre)
	if err := validateEquipo(e); err != nil {
		return nil, err
	}
	return s.store.Update(ctx, id, e)
}

func validateEquipo(e model.Equipo) error {
	if e.Nombre == "" {
		return &ErrValidation{Msg: "el nombre es obligatorio"}
	}
	if e.Color != nil && !colorRegex.MatchString(*e.Color) {
		return &ErrValidation{Msg: fmt.Sprintf("color %q no válido, debe tener formato #RRGGBB", *e.Color)}
	}
	return nil
}
