package admin

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// InscripcionHandler expone los endpoints de administración del módulo de inscripciones.
type InscripcionHandler struct {
	svc *service.InscripcionService
}

func NewInscripcionHandler(svc *service.InscripcionService) *InscripcionHandler {
	return &InscripcionHandler{svc: svc}
}

type inscripcionRequest struct {
	PilotoID int                     `json:"piloto_id"`
	EquipoID *int                    `json:"equipo_id"`
	Estado   model.EstadoInscripcion `json:"estado"`
}

// GetAll devuelve las inscripciones de un Gran Premio.
// GET /api/v1/admin/gp/{id}/inscripciones
func (h *InscripcionHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	gpID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || gpID < 1 {
		render.Error(w, http.StatusBadRequest, "id de gran premio no válido")
		return
	}

	inscripciones, err := h.svc.GetAllByGP(r.Context(), gpID)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener inscripciones")
		return
	}
	render.JSON(w, http.StatusOK, inscripciones)
}

// Create inscribe un piloto en el Gran Premio indicado por la URL.
// POST /api/v1/admin/gp/{id}/inscripciones
func (h *InscripcionHandler) Create(w http.ResponseWriter, r *http.Request) {
	gpID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || gpID < 1 {
		render.Error(w, http.StatusBadRequest, "id de gran premio no válido")
		return
	}

	var req inscripcionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	i := model.InscripcionGP{
		GranPremioID: gpID,
		PilotoID:     req.PilotoID,
		EquipoID:     req.EquipoID,
		Estado:       req.Estado,
	}

	created, err := h.svc.Create(r.Context(), i)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "el piloto ya está inscrito en este gran premio")
		case errors.Is(err, store.ErrForeignKey):
			render.Error(w, http.StatusUnprocessableEntity, "piloto o equipo no encontrado")
		default:
			render.Error(w, http.StatusInternalServerError, "error al crear la inscripción")
		}
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

// Update actualiza piloto, equipo y estado de una inscripción.
// PUT /api/v1/admin/inscripciones/{id}
func (h *InscripcionHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req inscripcionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	i := model.InscripcionGP{
		PilotoID: req.PilotoID,
		EquipoID: req.EquipoID,
		Estado:   req.Estado,
	}

	updated, err := h.svc.Update(r.Context(), id, i)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "inscripción no encontrada")
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "el piloto ya está inscrito en este gran premio")
		case errors.Is(err, store.ErrForeignKey):
			render.Error(w, http.StatusUnprocessableEntity, "piloto o equipo no encontrado")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar la inscripción")
		}
		return
	}

	render.JSON(w, http.StatusOK, updated)
}
