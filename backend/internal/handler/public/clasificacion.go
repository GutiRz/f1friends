package public

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
)

// ClasificacionHandler expone los endpoints públicos de clasificaciones del campeonato.
type ClasificacionHandler struct {
	svc *service.ClasificacionService
}

func NewClasificacionHandler(svc *service.ClasificacionService) *ClasificacionHandler {
	return &ClasificacionHandler{svc: svc}
}

// GetPilotos devuelve la clasificación de pilotos de una temporada.
// GET /api/v1/public/temporadas/{id}/clasificacion/pilotos
func (h *ClasificacionHandler) GetPilotos(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	clasificacion, err := h.svc.GetPilotos(r.Context(), id)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener la clasificación de pilotos")
		return
	}
	render.JSON(w, http.StatusOK, clasificacion)
}

// GetConstructores devuelve la clasificación de constructores de una temporada.
// GET /api/v1/public/temporadas/{id}/clasificacion/constructores
func (h *ClasificacionHandler) GetConstructores(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	clasificacion, err := h.svc.GetConstructores(r.Context(), id)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener la clasificación de constructores")
		return
	}
	render.JSON(w, http.StatusOK, clasificacion)
}
