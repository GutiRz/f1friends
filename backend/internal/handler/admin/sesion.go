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

// SesionHandler expone los endpoints de administración del módulo de sesiones.
type SesionHandler struct {
	svc *service.SesionService
}

func NewSesionHandler(svc *service.SesionService) *SesionHandler {
	return &SesionHandler{svc: svc}
}

type sesionCreateRequest struct {
	Tipo model.TipoSesion `json:"tipo"`
}

type sesionEstadoRequest struct {
	Estado model.EstadoSesion `json:"estado"`
}

// GetAll devuelve las sesiones de un Gran Premio.
// GET /api/v1/admin/gp/{id}/sesiones
func (h *SesionHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	gpID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || gpID < 1 {
		render.Error(w, http.StatusBadRequest, "id de gran premio no válido")
		return
	}

	sesiones, err := h.svc.GetAllByGP(r.Context(), gpID)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener sesiones")
		return
	}
	render.JSON(w, http.StatusOK, sesiones)
}

// Create crea una sesión en el Gran Premio indicado por la URL.
// POST /api/v1/admin/gp/{id}/sesiones
func (h *SesionHandler) Create(w http.ResponseWriter, r *http.Request) {
	gpID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || gpID < 1 {
		render.Error(w, http.StatusBadRequest, "id de gran premio no válido")
		return
	}

	var req sesionCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	ses := model.Sesion{
		GranPremioID: gpID,
		Tipo:         req.Tipo,
	}

	created, err := h.svc.Create(r.Context(), ses)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "ya existe una sesión de ese tipo para este gran premio")
		case errors.Is(err, store.ErrForeignKey):
			render.Error(w, http.StatusUnprocessableEntity, "el gran premio indicado no existe")
		default:
			render.Error(w, http.StatusInternalServerError, "error al crear la sesión")
		}
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

// UpdateEstado cambia el estado de una sesión.
// PATCH /api/v1/admin/sesiones/{id}/estado
func (h *SesionHandler) UpdateEstado(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req sesionEstadoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	updated, err := h.svc.UpdateEstado(r.Context(), id, req.Estado)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "sesión no encontrada")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar el estado")
		}
		return
	}

	render.JSON(w, http.StatusOK, updated)
}
