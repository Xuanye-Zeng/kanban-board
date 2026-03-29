package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"kanban-board-api/middleware"
	"kanban-board-api/models"

	"github.com/go-chi/chi/v5"
)

type CommentHandler struct {
	sb *SupabaseClient
}

func NewCommentHandler(sb *SupabaseClient) *CommentHandler {
	return &CommentHandler{sb: sb}
}

// GET /api/tasks/{taskId}/comments
func (h *CommentHandler) List(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "taskId")

	query := fmt.Sprintf("comments?task_id=eq.%s&order=created_at.asc", taskID)
	data, statusCode, err := h.sb.Get(query, token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch comments")
		return
	}
	writeJSON(w, statusCode, data)
}

// POST /api/tasks/{taskId}/comments
func (h *CommentHandler) Create(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "taskId")

	var req models.CreateCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Content == "" {
		writeError(w, http.StatusBadRequest, "content is required")
		return
	}

	data, statusCode, err := h.sb.Post("comments", token, map[string]interface{}{
		"task_id": taskID,
		"content": req.Content,
	}, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create comment")
		return
	}

	// Log activity
	h.sb.Post("activity_log", token, map[string]interface{}{
		"task_id": taskID,
		"action":  "comment_added",
		"details": map[string]interface{}{},
	}, nil)

	writeJSON(w, statusCode, data)
}

// DELETE /api/tasks/{taskId}/comments/{id}
func (h *CommentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	id := chi.URLParam(r, "id")

	data, statusCode, err := h.sb.Delete(fmt.Sprintf("comments?id=eq.%s", id), token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete comment")
		return
	}
	writeJSON(w, statusCode, data)
}
