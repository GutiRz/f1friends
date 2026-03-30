package service

import (
	"context"
	"strings"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// PilotoService contiene la lógica de negocio del módulo de pilotos.
type PilotoService struct {
	store *store.PilotoStore
}

func NewPilotoService(s *store.PilotoStore) *PilotoService {
	return &PilotoService{store: s}
}

// GetAllActivos devuelve solo los pilotos activos. Usado por la ruta pública.
func (s *PilotoService) GetAllActivos(ctx context.Context) ([]model.Piloto, error) {
	return s.store.GetAll(ctx, true)
}

// GetAll devuelve todos los pilotos sin filtrar. Usado por la ruta de administración.
func (s *PilotoService) GetAll(ctx context.Context) ([]model.Piloto, error) {
	return s.store.GetAll(ctx, false)
}

func (s *PilotoService) GetByID(ctx context.Context, id int) (*model.Piloto, error) {
	return s.store.GetByID(ctx, id)
}

// Create valida y crea un piloto. Siempre lo crea como activo.
func (s *PilotoService) Create(ctx context.Context, p model.Piloto) (*model.Piloto, error) {
	p.NombrePublico = strings.TrimSpace(p.NombrePublico)
	if err := validatePiloto(p); err != nil {
		return nil, err
	}
	p.Activo = true
	return s.store.Create(ctx, p)
}

// Update valida y actualiza un piloto. El campo Activo se actualiza según lo que envíe el admin.
func (s *PilotoService) Update(ctx context.Context, id int, p model.Piloto) (*model.Piloto, error) {
	p.NombrePublico = strings.TrimSpace(p.NombrePublico)
	if err := validatePiloto(p); err != nil {
		return nil, err
	}
	return s.store.Update(ctx, id, p)
}

func validatePiloto(p model.Piloto) error {
	if p.NombrePublico == "" {
		return &ErrValidation{Msg: "el nombre público es obligatorio"}
	}
	if p.Numero != nil && *p.Numero < 1 {
		return &ErrValidation{Msg: "el número de dorsal debe ser mayor que cero"}
	}
	return nil
}
