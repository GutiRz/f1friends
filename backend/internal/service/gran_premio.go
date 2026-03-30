package service

import (
	"context"
	"strings"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// GranPremioService contiene la lógica de negocio del módulo de grandes premios.
type GranPremioService struct {
	store *store.GranPremioStore
}

func NewGranPremioService(s *store.GranPremioStore) *GranPremioService {
	return &GranPremioService{store: s}
}

func (s *GranPremioService) GetAllByTemporada(ctx context.Context, temporadaID int) ([]model.GranPremio, error) {
	return s.store.GetAllByTemporada(ctx, temporadaID)
}

func (s *GranPremioService) GetByID(ctx context.Context, id int) (*model.GranPremio, error) {
	return s.store.GetByID(ctx, id)
}

// Create valida y crea un GP junto con sus sesiones base en una transacción.
// Las sesiones se determinan automáticamente según tiene_sprint.
func (s *GranPremioService) Create(ctx context.Context, gp model.GranPremio) (*model.GranPremio, error) {
	gp.Nombre = strings.TrimSpace(gp.Nombre)
	if err := validateGranPremio(gp); err != nil {
		return nil, err
	}
	gp.Estado = model.EstadoPendiente
	return s.store.CreateConSesiones(ctx, gp, sesionesBase(gp.TieneSprint))
}

// sesionesBase devuelve los tipos de sesión que se crean automáticamente al crear un GP.
func sesionesBase(tieneSprint bool) []model.TipoSesion {
	if tieneSprint {
		return []model.TipoSesion{
			model.TipoQualy,
			model.TipoSprintQualy,
			model.TipoSprint,
			model.TipoCarrera,
		}
	}
	return []model.TipoSesion{model.TipoQualy, model.TipoCarrera}
}

// Update valida y actualiza los campos editables de un GP.
// No modifica el estado ni el temporada_id; para eso usar UpdateEstado.
func (s *GranPremioService) Update(ctx context.Context, id int, gp model.GranPremio) (*model.GranPremio, error) {
	gp.Nombre = strings.TrimSpace(gp.Nombre)
	if err := validateGranPremioUpdate(gp); err != nil {
		return nil, err
	}
	return s.store.Update(ctx, id, gp)
}

// UpdateEstado valida el estado y lo aplica al GP.
func (s *GranPremioService) UpdateEstado(ctx context.Context, id int, estado model.EstadoGP) (*model.GranPremio, error) {
	if err := validateEstado(estado); err != nil {
		return nil, err
	}
	return s.store.UpdateEstado(ctx, id, estado)
}

func validateGranPremio(gp model.GranPremio) error {
	if gp.Nombre == "" {
		return &ErrValidation{Msg: "el nombre es obligatorio"}
	}
	if gp.TemporadaID < 1 {
		return &ErrValidation{Msg: "temporada_id es obligatorio"}
	}
	if gp.Orden < 1 {
		return &ErrValidation{Msg: "el orden debe ser mayor que cero"}
	}
	return nil
}

// validateGranPremioUpdate valida solo los campos editables (sin temporada_id).
func validateGranPremioUpdate(gp model.GranPremio) error {
	if gp.Nombre == "" {
		return &ErrValidation{Msg: "el nombre es obligatorio"}
	}
	if gp.Orden < 1 {
		return &ErrValidation{Msg: "el orden debe ser mayor que cero"}
	}
	return nil
}

func validateEstado(estado model.EstadoGP) error {
	switch estado {
	case model.EstadoPendiente, model.EstadoEnCurso, model.EstadoCompletado:
		return nil
	default:
		return &ErrValidation{Msg: "estado no válido: use pendiente, en_curso o completado"}
	}
}
