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

// ResultadoHandler expone los endpoints de administración del módulo de resultados.
type ResultadoHandler struct {
	svc *service.ResultadoSesionService
}

func NewResultadoHandler(svc *service.ResultadoSesionService) *ResultadoHandler {
	return &ResultadoHandler{svc: svc}
}

type resultadoCreateRequest struct {
	InscripcionID    int  `json:"inscripcion_id"`
	PosicionOriginal int  `json:"posicion_original"`
	Posicion         *int `json:"posicion"`
	Puntos           *int `json:"puntos"`
	Pole             bool `json:"pole"`
	VueltaRapida     bool `json:"vuelta_rapida"`
}

type resultadoUpdateRequest struct {
	PosicionOriginal int  `json:"posicion_original"`
	Posicion         *int `json:"posicion"`
	Puntos           *int `json:"puntos"`
	Pole             bool `json:"pole"`
	VueltaRapida     bool `json:"vuelta_rapida"`
}

// GetAll devuelve los resultados de una sesión.
// GET /api/v1/admin/sesiones/{id}/resultados
func (h *ResultadoHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	sesionID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || sesionID < 1 {
		render.Error(w, http.StatusBadRequest, "id de sesión no válido")
		return
	}

	resultados, err := h.svc.GetAllBySesion(r.Context(), sesionID)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener resultados")
		return
	}
	render.JSON(w, http.StatusOK, resultados)
}

// Create registra el resultado de una inscripción en la sesión indicada por la URL.
// POST /api/v1/admin/sesiones/{id}/resultados
func (h *ResultadoHandler) Create(w http.ResponseWriter, r *http.Request) {
	sesionID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || sesionID < 1 {
		render.Error(w, http.StatusBadRequest, "id de sesión no válido")
		return
	}

	var req resultadoCreateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	res := model.ResultadoSesion{
		SesionID:         sesionID,
		InscripcionID:    req.InscripcionID,
		PosicionOriginal: req.PosicionOriginal,
		Posicion:         req.Posicion,
		Puntos:           req.Puntos,
		Pole:             req.Pole,
		VueltaRapida:     req.VueltaRapida,
	}

	created, err := h.svc.Create(r.Context(), res)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "sesión o inscripción no encontrada")
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "la inscripción ya tiene resultado o esa posición ya está ocupada en esta sesión")
		case errors.Is(err, store.ErrForeignKey):
			render.Error(w, http.StatusUnprocessableEntity, "sesión o inscripción no encontrada")
		default:
			render.Error(w, http.StatusInternalServerError, "error al crear el resultado")
		}
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

// Update actualiza un resultado existente.
// PUT /api/v1/admin/resultados/{id}
func (h *ResultadoHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req resultadoUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	res := model.ResultadoSesion{
		PosicionOriginal: req.PosicionOriginal,
		Posicion:         req.Posicion,
		Puntos:           req.Puntos,
		Pole:             req.Pole,
		VueltaRapida:     req.VueltaRapida,
	}

	updated, err := h.svc.Update(r.Context(), id, res)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "resultado no encontrado")
		case errors.Is(err, store.ErrDuplicate):
			render.Error(w, http.StatusConflict, "esa posición ya está ocupada en esta sesión")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar el resultado")
		}
		return
	}

	render.JSON(w, http.StatusOK, updated)
}
