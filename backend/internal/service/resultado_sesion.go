package service

import (
	"context"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/store"
)

// ResultadoSesionService contiene la lógica de negocio del módulo de resultados.
type ResultadoSesionService struct {
	store            *store.ResultadoSesionStore
	sesionStore      *store.SesionStore
	inscripcionStore *store.InscripcionStore
}

func NewResultadoSesionService(
	s *store.ResultadoSesionStore,
	sesionStore *store.SesionStore,
	inscripcionStore *store.InscripcionStore,
) *ResultadoSesionService {
	return &ResultadoSesionService{
		store:            s,
		sesionStore:      sesionStore,
		inscripcionStore: inscripcionStore,
	}
}

func (s *ResultadoSesionService) GetAllBySesion(ctx context.Context, sesionID int) ([]model.ResultadoSesion, error) {
	return s.store.GetAllBySesion(ctx, sesionID)
}

// Create valida y crea un resultado.
// Si posicion no viene, se iguala a posicion_original.
func (s *ResultadoSesionService) Create(ctx context.Context, r model.ResultadoSesion) (*model.ResultadoSesion, error) {
	if r.SesionID < 1 {
		return nil, &ErrValidation{Msg: "sesion_id es obligatorio"}
	}
	if r.InscripcionID < 1 {
		return nil, &ErrValidation{Msg: "inscripcion_id es obligatorio"}
	}
	if err := validatePosiciones(r); err != nil {
		return nil, err
	}

	// Asegura que la inscripción pertenece al mismo GP que la sesión
	// para evitar inconsistencias de dominio.
	if err := s.validarRelacionGP(ctx, r.SesionID, r.InscripcionID); err != nil {
		return nil, err
	}
	if err := s.validarTipoSesion(ctx, r.SesionID, r); err != nil {
		return nil, err
	}

	if r.Posicion == nil {
		r.Posicion = &r.PosicionOriginal
	}
	return s.store.Create(ctx, r)
}

// Update valida y actualiza un resultado.
// Si posicion no viene, se iguala a posicion_original.
func (s *ResultadoSesionService) Update(ctx context.Context, id int, r model.ResultadoSesion) (*model.ResultadoSesion, error) {
	if err := validatePosiciones(r); err != nil {
		return nil, err
	}

	existing, err := s.store.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := s.validarTipoSesion(ctx, existing.SesionID, r); err != nil {
		return nil, err
	}

	if r.Posicion == nil {
		r.Posicion = &r.PosicionOriginal
	}
	return s.store.Update(ctx, id, r)
}

// validarRelacionGP comprueba que la sesión y la inscripción pertenecen al mismo GP.
func (s *ResultadoSesionService) validarRelacionGP(ctx context.Context, sesionID, inscripcionID int) error {
	sesion, err := s.sesionStore.GetByID(ctx, sesionID)
	if err != nil {
		return err
	}
	inscripcion, err := s.inscripcionStore.GetByID(ctx, inscripcionID)
	if err != nil {
		return err
	}
	if sesion.GranPremioID != inscripcion.GranPremioID {
		return &ErrValidation{Msg: "la inscripción no pertenece al gran premio de la sesión"}
	}
	return nil
}

// validarTipoSesion obtiene el tipo de sesión y valida la coherencia del resultado.
func (s *ResultadoSesionService) validarTipoSesion(ctx context.Context, sesionID int, r model.ResultadoSesion) error {
	sesion, err := s.sesionStore.GetByID(ctx, sesionID)
	if err != nil {
		return err
	}
	return validarSegunTipo(sesion.Tipo, r)
}

// validarSegunTipo aplica las reglas de negocio según el tipo de sesión.
func validarSegunTipo(tipo model.TipoSesion, r model.ResultadoSesion) error {
	switch tipo {
	case model.TipoQualy:
		if r.VueltaRapida {
			return &ErrValidation{Msg: "la vuelta rápida no aplica en sesiones de qualy"}
		}
		if r.Puntos != nil && *r.Puntos != 0 {
			return &ErrValidation{Msg: "no se asignan puntos en sesiones de qualy"}
		}
	case model.TipoSprintQualy:
		if r.Pole {
			return &ErrValidation{Msg: "la pole no aplica en sesiones de sprint qualy"}
		}
		if r.VueltaRapida {
			return &ErrValidation{Msg: "la vuelta rápida no aplica en sesiones de sprint qualy"}
		}
		if r.Puntos != nil && *r.Puntos != 0 {
			return &ErrValidation{Msg: "no se asignan puntos en sesiones de sprint qualy"}
		}
	case model.TipoSprint:
		if r.Pole {
			return &ErrValidation{Msg: "la pole no aplica en sesiones de sprint"}
		}
	case model.TipoCarrera:
		if r.Pole {
			return &ErrValidation{Msg: "la pole no aplica en sesiones de carrera"}
		}
	}
	return nil
}

func validatePosiciones(r model.ResultadoSesion) error {
	if r.PosicionOriginal < 1 {
		return &ErrValidation{Msg: "posicion_original debe ser mayor que cero"}
	}
	if r.Posicion != nil && *r.Posicion < 1 {
		return &ErrValidation{Msg: "posicion debe ser mayor que cero"}
	}
	return nil
}
