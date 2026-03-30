package render

import (
	"encoding/json"
	"log"
	"net/http"
)

// JSON escribe v como JSON con el código de estado dado.
func JSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("render.JSON: %v", err)
	}
}

// Error escribe una respuesta de error JSON con el mensaje dado.
func Error(w http.ResponseWriter, status int, msg string) {
	JSON(w, status, struct {
		Error string `json:"error"`
	}{Error: msg})
}
