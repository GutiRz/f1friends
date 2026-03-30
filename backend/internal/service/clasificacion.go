package service

import (
	"context"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// ClasificacionService expone las clasificaciones del campeonato.
type ClasificacionService struct {
	store *store.ClasificacionStore
}

func NewClasificacionService(s *store.ClasificacionStore) *ClasificacionService {
	return &ClasificacionService{store: s}
}

func (s *ClasificacionService) GetPilotos(ctx context.Context, temporadaID int) ([]model.ClasificacionPilotoRow, error) {
	return s.store.GetPilotos(ctx, temporadaID)
}

func (s *ClasificacionService) GetConstructores(ctx context.Context, temporadaID int) ([]model.ClasificacionConstructorRow, error) {
	return s.store.GetConstructores(ctx, temporadaID)
}
