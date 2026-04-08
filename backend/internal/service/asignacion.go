package service

import (
	"context"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// AsignacionService contiene la lógica de negocio del módulo de asignaciones de piloto.
type AsignacionService struct {
	store *store.AsignacionStore
}

func NewAsignacionService(s *store.AsignacionStore) *AsignacionService {
	return &AsignacionService{store: s}
}

func (s *AsignacionService) GetVigentesByTemporada(ctx context.Context, temporadaID int) ([]model.AsignacionVigente, error) {
	return s.store.GetVigentesByTemporada(ctx, temporadaID)
}

func (s *AsignacionService) GetPilotosDeTemporada(ctx context.Context, temporadaID int) ([]model.PilotoDeTemporada, error) {
	return s.store.GetPilotosDeTemporada(ctx, temporadaID)
}

// Create valida y crea una asignación vigente.
// Reglas: titular requiere equipo_id; reserva no debe tener equipo_id.
func (s *AsignacionService) Create(ctx context.Context, a model.AsignacionVigente) (*model.AsignacionVigente, error) {
	if a.PilotoID < 1 {
		return nil, &ErrValidation{Msg: "piloto_id es obligatorio"}
	}
	if a.TemporadaID < 1 {
		return nil, &ErrValidation{Msg: "temporada_id es obligatorio"}
	}
	switch a.Tipo {
	case "titular":
		if a.EquipoID == nil {
			return nil, &ErrValidation{Msg: "un titular debe tener equipo asignado"}
		}
	case "reserva":
		if a.EquipoID != nil {
			return nil, &ErrValidation{Msg: "una reserva no debe tener equipo asignado"}
		}
	default:
		return nil, &ErrValidation{Msg: "tipo debe ser 'titular' o 'reserva'"}
	}
	return s.store.Create(ctx, a)
}
