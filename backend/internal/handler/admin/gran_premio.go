package admin

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"f1friends/backend/internal/model"
	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// GranPremioHandler expone los endpoints de administración del módulo de grandes premios.
type GranPremioHandler struct {
	svc *service.GranPremioService
}

func NewGranPremioHandler(svc *service.GranPremioService) *GranPremioHandler {
	return &GranPremioHandler{svc: svc}
}

type granPremioRequest struct {
	Nombre      string     `json:"nombre"`
	Circuito    *string    `json:"circuito"`
	Pais        *string    `json:"pais"`
	Fecha       *time.Time `json:"fecha"`
	TieneSprint bool       `json:"tiene_sprint"`
	Orden       int        `json:"orden"`
}

func (req *granPremioRequest) toModel(temporadaID int) model.GranPremio {
	return model.GranPremio{
		TemporadaID: temporadaID,
		Nombre:      req.Nombre,
		Circuito:    req.Circuito,
		Pais:        req.Pais,
		Fecha:       req.Fecha,
		TieneSprint: req.TieneSprint,
		Orden:       req.Orden,
	}
}

type estadoRequest struct {
	Estado model.EstadoGP `json:"estado"`
}

// GetAll devuelve los GPs de una temporada.
// GET /api/v1/admin/temporadas/{id}/gp
func (h *GranPremioHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	temporadaID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || temporadaID < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	gps, err := h.svc.GetAllByTemporada(r.Context(), temporadaID)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener los grandes premios")
		return
	}
	render.JSON(w, http.StatusOK, gps)
}

// Create crea un GP en la temporada indicada. El estado inicial es "pendiente".
// POST /api/v1/admin/temporadas/{id}/gp
func (h *GranPremioHandler) Create(w http.ResponseWriter, r *http.Request) {
	temporadaID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || temporadaID < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	var req granPremioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	created, err := h.svc.Create(r.Context(), req.toModel(temporadaID))
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrForeignKey):
			render.Error(w, http.StatusUnprocessableEntity, "la temporada indicada no existe")
		default:
			render.Error(w, http.StatusInternalServerError, "error al crear el gran premio")
		}
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

// GetByID devuelve un GP por su id.
// GET /api/v1/admin/gp/{id}
func (h *GranPremioHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	gp, err := h.svc.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, store.ErrNotFound) {
			render.Error(w, http.StatusNotFound, "gran premio no encontrado")
			return
		}
		render.Error(w, http.StatusInternalServerError, "error al obtener el gran premio")
		return
	}
	render.JSON(w, http.StatusOK, gp)
}

// Update actualiza los datos de un GP (sin cambiar su estado ni temporada).
// PUT /api/v1/admin/gp/{id}
func (h *GranPremioHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req granPremioRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		render.Error(w, http.StatusBadRequest, "cuerpo de la petición no válido")
		return
	}

	gp := req.toModel(0) // temporadaID no se modifica en Update
	updated, err := h.svc.Update(r.Context(), id, gp)
	if err != nil {
		var valErr *service.ErrValidation
		switch {
		case errors.As(err, &valErr):
			render.Error(w, http.StatusBadRequest, valErr.Msg)
		case errors.Is(err, store.ErrNotFound):
			render.Error(w, http.StatusNotFound, "gran premio no encontrado")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar el gran premio")
		}
		return
	}
	render.JSON(w, http.StatusOK, updated)
}

// UpdateEstado cambia el estado de un GP.
// PATCH /api/v1/admin/gp/{id}/estado
func (h *GranPremioHandler) UpdateEstado(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req estadoRequest
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
			render.Error(w, http.StatusNotFound, "gran premio no encontrado")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar el estado")
		}
		return
	}
	render.JSON(w, http.StatusOK, updated)
}
