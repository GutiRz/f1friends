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

// PilotoHandler expone los endpoints de administración del módulo de pilotos.
type PilotoHandler struct {
	svc *service.PilotoService
}

func NewPilotoHandler(svc *service.PilotoService) *PilotoHandler {
	return &PilotoHandler{svc: svc}
}

// pilotoRequest es el cuerpo esperado en las peticiones de creación y actualización.
// NombrePublico es obligatorio; el resto son opcionales.
// Activo solo se usa en Update: permite activar o desactivar un piloto.
type pilotoRequest struct {
	NombrePublico string  `json:"nombre_publico"`
	NombreReal    *string `json:"nombre_real"`
	Nacionalidad  *string `json:"nacionalidad"`
	Numero        *int    `json:"numero"`
	IdPsn         *string `json:"id_psn"`
	IdEa          *string `json:"id_ea"`
	IdXbox        *string `json:"id_xbox"`
	TwitchUrl     *string `json:"twitch_url"`
	YoutubeUrl    *string `json:"youtube_url"`
	AvatarUrl     *string `json:"avatar_url"`
	Activo        bool    `json:"activo"`
}

func (req *pilotoRequest) toModel() model.Piloto {
	return model.Piloto{
		NombrePublico: req.NombrePublico,
		NombreReal:    req.NombreReal,
		Nacionalidad:  req.Nacionalidad,
		Numero:        req.Numero,
		IdPsn:         req.IdPsn,
		IdEa:          req.IdEa,
		IdXbox:        req.IdXbox,
		TwitchUrl:     req.TwitchUrl,
		YoutubeUrl:    req.YoutubeUrl,
		AvatarUrl:     req.AvatarUrl,
		Activo:        req.Activo,
	}
}

// GetAll devuelve todos los pilotos (activos e inactivos).
// GET /api/v1/admin/pilotos
func (h *PilotoHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	pilotos, err := h.svc.GetAll(r.Context())
	if err != nil {
		render.Error(w, http.StatusInternalServerError, "error al obtener pilotos")
		return
	}
	render.JSON(w, http.StatusOK, pilotos)
}

// Create crea un nuevo piloto. Siempre se crea como activo.
// POST /api/v1/admin/pilotos
func (h *PilotoHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req pilotoRequest
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
		render.Error(w, http.StatusInternalServerError, "error al crear el piloto")
		return
	}

	render.JSON(w, http.StatusCreated, created)
}

// Update actualiza un piloto existente, incluido su estado activo/inactivo.
// PUT /api/v1/admin/pilotos/{id}
func (h *PilotoHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil || id < 1 {
		render.Error(w, http.StatusBadRequest, "id no válido")
		return
	}

	var req pilotoRequest
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
			render.Error(w, http.StatusNotFound, "piloto no encontrado")
		default:
			render.Error(w, http.StatusInternalServerError, "error al actualizar el piloto")
		}
		return
	}

	render.JSON(w, http.StatusOK, updated)
}
