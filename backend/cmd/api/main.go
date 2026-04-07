package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"

	"f1friends/backend/internal/config"
	"f1friends/backend/internal/db"
	"f1friends/backend/internal/router"
)

func main() {
	// Carga .env si existe (entorno de desarrollo). En producción las variables
	// ya están definidas en el entorno del proceso y godotenv simplemente las ignora.
	if err := godotenv.Load(); err != nil && !os.IsNotExist(err) {
		log.Printf("aviso: no se pudo cargar .env: %v", err)
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("error de configuración: %v", err)
	}

	pool, err := db.Connect(cfg.DB.DSN())
	if err != nil {
		log.Fatalf("error conectando a la base de datos: %v", err)
	}
	defer pool.Close()
	log.Println("conexión a la base de datos establecida")

	r := router.New(pool, cfg.JWTSecret)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Arranca el servidor en una goroutine para poder escuchar señales de parada.
	serverErr := make(chan error, 1)
	go func() {
		log.Printf("servidor escuchando en :%d", cfg.Port)
		serverErr <- srv.ListenAndServe()
	}()

	// Espera una señal de terminación (Ctrl+C, kill) o un error del servidor.
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case err := <-serverErr:
		if !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("error del servidor: %v", err)
		}
	case sig := <-quit:
		log.Printf("señal recibida: %s. Apagando servidor...", sig)
	}

	// Graceful shutdown: da 15 segundos para que las peticiones activas terminen.
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("error durante el apagado: %v", err)
	}
	log.Println("servidor detenido correctamente")
}
