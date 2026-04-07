package service

import (
	"context"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// InscripcionService contiene la lógica de negocio del módulo de inscripciones.
type InscripcionService struct {
	store *store.InscripcionStore
}

func NewInscripcionService(s *store.InscripcionStore) *InscripcionService {
	return &InscripcionService{store: s}
}

func (s *InscripcionService) GetAllByGP(ctx context.Context, granPremioID int) ([]model.InscripcionGP, error) {
	return s.store.GetAllByGP(ctx, granPremioID)
}

// Create valida y crea una inscripción. Si no se especifica estado, se usa "inscrito".
// equipo_id es opcional: nil es válido para reservas.
func (s *InscripcionService) Create(ctx context.Context, i model.InscripcionGP) (*model.InscripcionGP, error) {
	if err := validateInscripcionCreate(i); err != nil {
		return nil, err
	}
	if i.Estado == "" {
		i.Estado = model.EstadoInscrito
	}
	return s.store.Create(ctx, i)
}

// Update valida y actualiza una inscripción existente.
// equipo_id es opcional: nil es válido para reservas.
func (s *InscripcionService) Update(ctx context.Context, id int, i model.InscripcionGP) (*model.InscripcionGP, error) {
	if err := validateInscripcionUpdate(i); err != nil {
		return nil, err
	}
	return s.store.Update(ctx, id, i)
}

func validateInscripcionCreate(i model.InscripcionGP) error {
	if i.GranPremioID < 1 {
		return &ErrValidation{Msg: "gran_premio_id es obligatorio"}
	}
	if i.PilotoID < 1 {
		return &ErrValidation{Msg: "piloto_id es obligatorio"}
	}
	// equipo_id es opcional (nil para reservas)
	if i.EquipoID != nil && *i.EquipoID < 1 {
		return &ErrValidation{Msg: "equipo_id no válido"}
	}
	if i.Estado != "" {
		return validateEstadoInscripcion(i.Estado)
	}
	return nil
}

func validateInscripcionUpdate(i model.InscripcionGP) error {
	if i.PilotoID < 1 {
		return &ErrValidation{Msg: "piloto_id es obligatorio"}
	}
	// equipo_id es opcional (nil para reservas)
	if i.EquipoID != nil && *i.EquipoID < 1 {
		return &ErrValidation{Msg: "equipo_id no válido"}
	}
	return validateEstadoInscripcion(i.Estado)
}

func validateEstadoInscripcion(estado model.EstadoInscripcion) error {
	switch estado {
	case model.EstadoInscripcionPendiente, model.EstadoInscrito,
		model.EstadoAusente, model.EstadoSustituido, model.EstadoParticipo:
		return nil
	default:
		return &ErrValidation{Msg: "estado no válido: use pendiente, inscrito, ausente, sustituido o participo"}
	}
}
