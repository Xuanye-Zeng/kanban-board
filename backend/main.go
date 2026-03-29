package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"kanban-board-api/handlers"
	"kanban-board-api/middleware"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	sb := handlers.NewSupabaseClient()
	taskH := handlers.NewTaskHandler(sb)
	teamH := handlers.NewTeamMemberHandler(sb)
	labelH := handlers.NewLabelHandler(sb)
	commentH := handlers.NewCommentHandler(sb)
	activityH := handlers.NewActivityLogHandler(sb)

	r := chi.NewRouter()

	// Middleware
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(chimw.RealIP)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*", os.Getenv("FRONTEND_URL")},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Protected API routes
	r.Route("/api", func(r chi.Router) {
		r.Use(middleware.Auth)

		// Tasks
		r.Get("/tasks", taskH.List)
		r.Post("/tasks", taskH.Create)
		r.Patch("/tasks/{id}", taskH.Update)
		r.Delete("/tasks/{id}", taskH.Delete)
		r.Put("/tasks/{id}/assignees", taskH.UpdateAssignees)
		r.Put("/tasks/{id}/labels", taskH.UpdateLabels)
		r.Get("/tasks/{id}/assignees", taskH.GetAssignees)
		r.Get("/tasks/{id}/labels", taskH.GetLabels)

		// Comments & Activity (nested under tasks)
		r.Get("/tasks/{taskId}/comments", commentH.List)
		r.Post("/tasks/{taskId}/comments", commentH.Create)
		r.Delete("/tasks/{taskId}/comments/{id}", commentH.Delete)
		r.Get("/tasks/{taskId}/activity", activityH.List)

		// Team members
		r.Get("/team-members", teamH.List)
		r.Post("/team-members", teamH.Create)
		r.Patch("/team-members/{id}", teamH.Update)
		r.Delete("/team-members/{id}", teamH.Delete)

		// Labels
		r.Get("/labels", labelH.List)
		r.Post("/labels", labelH.Create)
		r.Patch("/labels/{id}", labelH.Update)
		r.Delete("/labels/{id}", labelH.Delete)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server running on :%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
