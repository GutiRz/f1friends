package public

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"f1friends/backend/internal/render"
	"f1friends/backend/internal/service"
)

// AsignacionHandler expone los endpoints públicos de pilotos por temporada.
type AsignacionHandler struct {
	svc *service.AsignacionService
}

func NewAsignacionHandler(svc *service.AsignacionService) *AsignacionHandler {
	return &AsignacionHandler{svc: svc}
}

// GetPilotosDeTemporada devuelve los pilotos asignados a una temporada con nombre y tipo.
// GET /api/v1/public/temporadas/{id}/pilotos
func (h *AsignacionHandler) GetPilotosDeTemporada(w http.ResponseWriter, r *http.Request) {
	temporadaID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || temporadaID < 1 {
		render.Error(w, http.StatusBadRequest, "id de temporada no válido")
		return
	}

	pilotos, err := h.svc.GetPilotosDeTemporada(r.Context(), temporadaID)
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener pilotos de la temporada")
		return
	}
	render.JSON(w, http.StatusOK, pilotos)
}
