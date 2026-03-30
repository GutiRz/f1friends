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
// Los puntos se calculan automáticamente según el tipo de sesión y la posición final.
// Cualquier valor de puntos enviado por el cliente se ignora.
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

	tipo, err := s.validarTipoSesion(ctx, r.SesionID, r)
	if err != nil {
		return nil, err
	}

	if r.Posicion == nil {
		r.Posicion = &r.PosicionOriginal
	}
	r.Puntos = calcularPuntos(tipo, *r.Posicion)
	return s.store.Create(ctx, r)
}

// Update valida y actualiza un resultado.
// Los puntos se recalculan automáticamente; el cliente no puede modificarlos.
func (s *ResultadoSesionService) Update(ctx context.Context, id int, r model.ResultadoSesion) (*model.ResultadoSesion, error) {
	if err := validatePosiciones(r); err != nil {
		return nil, err
	}

	existing, err := s.store.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	tipo, err := s.validarTipoSesion(ctx, existing.SesionID, r)
	if err != nil {
		return nil, err
	}

	if r.Posicion == nil {
		r.Posicion = &r.PosicionOriginal
	}
	r.Puntos = calcularPuntos(tipo, *r.Posicion)
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

// validarTipoSesion obtiene el tipo de sesión, valida la coherencia del resultado
// y devuelve el tipo para que el llamador pueda usarlo sin otra consulta.
func (s *ResultadoSesionService) validarTipoSesion(ctx context.Context, sesionID int, r model.ResultadoSesion) (model.TipoSesion, error) {
	sesion, err := s.sesionStore.GetByID(ctx, sesionID)
	if err != nil {
		return "", err
	}
	if err := validarSegunTipo(sesion.Tipo, r); err != nil {
		return "", err
	}
	return sesion.Tipo, nil
}

// validarSegunTipo aplica las reglas de negocio según el tipo de sesión.
// Los puntos no se validan aquí porque el service los calcula automáticamente.
func validarSegunTipo(tipo model.TipoSesion, r model.ResultadoSesion) error {
	switch tipo {
	case model.TipoQualy:
		if r.VueltaRapida {
			return &ErrValidation{Msg: "la vuelta rápida no aplica en sesiones de qualy"}
		}
	case model.TipoSprintQualy:
		if r.Pole {
			return &ErrValidation{Msg: "la pole no aplica en sesiones de sprint qualy"}
		}
		if r.VueltaRapida {
			return &ErrValidation{Msg: "la vuelta rápida no aplica en sesiones de sprint qualy"}
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

// calcularPuntos devuelve los puntos que corresponden a una posición según el tipo de sesión.
// qualy y sprint_qualy no puntúan (nil). Para sprint y carrera, posiciones fuera de la tabla → 0 puntos.
func calcularPuntos(tipo model.TipoSesion, posicion int) *int {
	var tabla []int
	switch tipo {
	case model.TipoSprint:
		tabla = []int{8, 7, 6, 5, 4, 3, 2, 1}
	case model.TipoCarrera:
		tabla = []int{25, 18, 15, 12, 10, 8, 6, 4, 2, 1}
	default:
		// qualy y sprint_qualy: sin puntos
		return nil
	}
	if posicion >= 1 && posicion <= len(tabla) {
		p := tabla[posicion-1]
		return &p
	}
	cero := 0
	return &cero
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
