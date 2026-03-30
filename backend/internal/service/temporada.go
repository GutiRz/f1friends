package service

import (
	"context"
	"strings"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// TemporadaService contiene la lógica de negocio del módulo de temporadas.
type TemporadaService struct {
	store *store.TemporadaStore
}

func NewTemporadaService(s *store.TemporadaStore) *TemporadaService {
	return &TemporadaService{store: s}
}

func (s *TemporadaService) GetAll(ctx context.Context) ([]model.Temporada, error) {
	return s.store.GetAll(ctx)
}

func (s *TemporadaService) GetActiva(ctx context.Context) (*model.Temporada, error) {
	return s.store.GetActiva(ctx)
}

func (s *TemporadaService) GetByID(ctx context.Context, id int) (*model.Temporada, error) {
	return s.store.GetByID(ctx, id)
}

// Create valida y crea una temporada. Siempre se crea como inactiva.
func (s *TemporadaService) Create(ctx context.Context, t model.Temporada) (*model.Temporada, error) {
	t.Nombre = strings.TrimSpace(t.Nombre)
	if err := validateTemporada(t); err != nil {
		return nil, err
	}
	t.Activa = false
	return s.store.Create(ctx, t)
}

// Update valida y actualiza una temporada. No modifica el campo activa.
func (s *TemporadaService) Update(ctx context.Context, id int, t model.Temporada) (*model.Temporada, error) {
	t.Nombre = strings.TrimSpace(t.Nombre)
	if err := validateTemporada(t); err != nil {
		return nil, err
	}
	return s.store.Update(ctx, id, t)
}

// Activar activa la temporada elegida y desactiva cualquier otra activa.
func (s *TemporadaService) Activar(ctx context.Context, id int) (*model.Temporada, error) {
	return s.store.Activar(ctx, id)
}

func validateTemporada(t model.Temporada) error {
	if t.Nombre == "" {
		return &ErrValidation{Msg: "el nombre es obligatorio"}
	}
	if t.Anio < 1 {
		return &ErrValidation{Msg: "el año debe ser mayor que cero"}
	}
	return nil
}
