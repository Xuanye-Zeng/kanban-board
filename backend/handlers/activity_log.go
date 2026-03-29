package handlers

import (
	"fmt"
	"net/http"

	"kanban-board-api/middleware"

	"github.com/go-chi/chi/v5"
)

type ActivityLogHandler struct {
	sb *SupabaseClient
}

func NewActivityLogHandler(sb *SupabaseClient) *ActivityLogHandler {
	return &ActivityLogHandler{sb: sb}
}

// GET /api/tasks/{taskId}/activity
func (h *ActivityLogHandler) List(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "taskId")

	query := fmt.Sprintf("activity_log?task_id=eq.%s&order=created_at.desc", taskID)
	data, statusCode, err := h.sb.Get(query, token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch activity log")
		return
	}
	writeJSON(w, statusCode, data)
}
