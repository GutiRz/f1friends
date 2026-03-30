package service

import (
	"context"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// SesionService contiene la lógica de negocio del módulo de sesiones.
type SesionService struct {
	store   *store.SesionStore
	gpStore *store.GranPremioStore
}

func NewSesionService(s *store.SesionStore, gp *store.GranPremioStore) *SesionService {
	return &SesionService{store: s, gpStore: gp}
}

func (s *SesionService) GetAllByGP(ctx context.Context, granPremioID int) ([]model.Sesion, error) {
	return s.store.GetAllByGP(ctx, granPremioID)
}

// Create valida y crea una sesión. El estado inicial siempre es "pendiente".
// Si el tipo es "sprint", verifica que el GP tenga tiene_sprint = true.
func (s *SesionService) Create(ctx context.Context, ses model.Sesion) (*model.Sesion, error) {
	if ses.GranPremioID < 1 {
		return nil, &ErrValidation{Msg: "gran_premio_id es obligatorio"}
	}
	if err := validateTipoSesion(ses.Tipo); err != nil {
		return nil, err
	}
	if ses.Tipo == model.TipoSprint || ses.Tipo == model.TipoSprintQualy {
		gp, err := s.gpStore.GetByID(ctx, ses.GranPremioID)
		if err != nil {
			return nil, err
		}
		if !gp.TieneSprint {
			return nil, &ErrValidation{Msg: "este gran premio no tiene sesión sprint"}
		}
	}
	ses.Estado = model.EstadoSesionPendiente
	return s.store.Create(ctx, ses)
}

// UpdateEstado valida el estado y lo aplica a la sesión.
func (s *SesionService) UpdateEstado(ctx context.Context, id int, estado model.EstadoSesion) (*model.Sesion, error) {
	if err := validateEstadoSesion(estado); err != nil {
		return nil, err
	}
	return s.store.UpdateEstado(ctx, id, estado)
}

func validateTipoSesion(tipo model.TipoSesion) error {
	switch tipo {
	case model.TipoQualy, model.TipoSprintQualy, model.TipoSprint, model.TipoCarrera:
		return nil
	default:
		return &ErrValidation{Msg: "tipo no válido: use qualy, sprint_qualy, sprint o carrera"}
	}
}

func validateEstadoSesion(estado model.EstadoSesion) error {
	switch estado {
	case model.EstadoSesionPendiente, model.EstadoSesionCompletada:
		return nil
	default:
		return &ErrValidation{Msg: "estado no válido: use pendiente o completada"}
	}
}
