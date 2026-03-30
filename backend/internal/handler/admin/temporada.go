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

// TemporadaHandler expone los endpoints de administración del módulo de temporadas.
type TemporadaHandler struct {
	svc *service.TemporadaService
}

func NewTemporadaHandler(svc *service.TemporadaService) *TemporadaHandler {
	return &TemporadaHandler{svc: svc}
}

type temporadaRequest struct {
	Nombre      string  `json:"nombre"`
	Anio        int     `json:"anio"`
	Descripcion *string `json:"descripcion"`
	Normativa   *string `json:"normativa"`
}

func (req *temporadaRequest) toModel() model.Temporada {
	return model.Temporada{
		Nombre:      req.Nombre,
		Anio:        req.Anio,
		Descripcion: req.Descripcion,
		Normativa:   req.Normativa,
	}
}

// GetAll devuelve todas las temporadas.
// GET /api/v1/admin/temporadas
func (h *TemporadaHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	temporadas, err := h.svc.GetAll(r.Context())
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener temporadas")
		return
	}
	render.JSON(w, http.StatusOK, temporadas)
}

// Create crea una nueva temporada. Siempre se crea como inactiva.
// POST /api/v1/admin/temporadas
func (h *TemporadaHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req temporadaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	created, err := h.svc.Create(r.Context(), req.toModel())
	if err != nil {
		var valErr *service.ErrValidation
		if errors.As(err, &valErr) {
			render.Error(w, http.StatusBadRequest, valErr.Msg)
			return
		}
		render.Error(w, http.StatusInternalServerError, "error al crear la temporada")
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

// Update actualiza una temporada existente (nombre, año, descripción, normativa).
// No modifica el campo activa; para eso usar Activar.
// PUT /api/v1/admin/temporadas/{id}
func (h *TemporadaHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req temporadaRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	updated, err := h.svc.Update(r.Context(), id, req.toModel())
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "temporada no encontrada")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar la temporada")
		}
		return
	}

	render.JSON(w, http.StatusOK, updated)
}

// Activar desactiva cualquier temporada activa y activa la elegida.
// PATCH /api/v1/admin/temporadas/{id}/activar
func (h *TemporadaHandler) Activar(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	updated, err := h.svc.Activar(r.Context(), id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			render.Error(w, http.StatusNotFound, "temporada no encontrada")
			return
		}
		render.Error(w, http.StatusInternalServerError, "error al activar la temporada")
		return
	}

	render.JSON(w, http.StatusOK, updated)
}
