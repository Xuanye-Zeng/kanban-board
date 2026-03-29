package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"kanban-board-api/middleware"
	"kanban-board-api/models"

	"github.com/go-chi/chi/v5"
)

type LabelHandler struct {
	sb *SupabaseClient
}

func NewLabelHandler(sb *SupabaseClient) *LabelHandler {
	return &LabelHandler{sb: sb}
}

// GET /api/labels
func (h *LabelHandler) List(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	data, statusCode, err := h.sb.Get("labels?select=*&order=created_at.asc", token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch labels")
		return
	}
	writeJSON(w, statusCode, data)
}

// POST /api/labels
func (h *LabelHandler) Create(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)

	var req models.CreateLabelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Color == "" {
		req.Color = "#8b5cf6"
	}

	data, statusCode, err := h.sb.Post("labels", token, map[string]interface{}{
		"name":  req.Name,
		"color": req.Color,
	}, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create label")
		return
	}
	writeJSON(w, statusCode, data)
}

// PATCH /api/labels/{id}
func (h *LabelHandler) Update(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	id := chi.URLParam(r, "id")

	var req models.CreateLabelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	body := make(map[string]interface{})
	if req.Name != "" {
		body["name"] = req.Name
	}
	if req.Color != "" {
		body["color"] = req.Color
	}

	data, statusCode, err := h.sb.Patch(fmt.Sprintf("labels?id=eq.%s", id), token, body, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update label")
		return
	}
	writeJSON(w, statusCode, data)
}

// DELETE /api/labels/{id}
func (h *LabelHandler) Delete(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	id := chi.URLParam(r, "id")

	data, statusCode, err := h.sb.Delete(fmt.Sprintf("labels?id=eq.%s", id), token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete label")
		return
	}
	writeJSON(w, statusCode, data)
}
