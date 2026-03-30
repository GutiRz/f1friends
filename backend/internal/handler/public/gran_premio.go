package public

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
	"f1friends/backend/internal/store"
)

// GranPremioHandler expone los endpoints públicos del módulo de grandes premios.
type GranPremioHandler struct {
	svc *service.GranPremioService
}

func NewGranPremioHandler(svc *service.GranPremioService) *GranPremioHandler {
	return &GranPremioHandler{svc: svc}
}

// GetCalendario devuelve los GPs de una temporada ordenados por su orden en el calendario.
// GET /api/v1/public/temporadas/{id}/calendario
func (h *GranPremioHandler) GetCalendario(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	gps, err := h.svc.GetAllByTemporada(r.Context(), id)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener el calendario")
		return
	}
	render.JSON(w, http.StatusOK, gps)
}

// GetByID devuelve la información básica de un GP.
// GET /api/v1/public/gp/{id}
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
