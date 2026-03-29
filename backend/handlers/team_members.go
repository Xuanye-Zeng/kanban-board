package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"kanban-board-api/middleware"
	"kanban-board-api/models"

	"github.com/go-chi/chi/v5"
)

type TeamMemberHandler struct {
	sb *SupabaseClient
}

func NewTeamMemberHandler(sb *SupabaseClient) *TeamMemberHandler {
	return &TeamMemberHandler{sb: sb}
}

// GET /api/team-members
func (h *TeamMemberHandler) List(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	data, statusCode, err := h.sb.Get("team_members?select=*&order=created_at.asc", token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch team members")
		return
	}
	writeJSON(w, statusCode, data)
}

// POST /api/team-members
func (h *TeamMemberHandler) Create(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)

	var req models.CreateTeamMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Color == "" {
		req.Color = "#6366f1"
	}

	data, statusCode, err := h.sb.Post("team_members", token, map[string]interface{}{
		"name":  req.Name,
		"color": req.Color,
	}, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create team member")
		return
	}
	writeJSON(w, statusCode, data)
}

// PATCH /api/team-members/{id}
func (h *TeamMemberHandler) Update(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	id := chi.URLParam(r, "id")

	var req models.CreateTeamMemberRequest
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

	data, statusCode, err := h.sb.Patch(fmt.Sprintf("team_members?id=eq.%s", id), token, body, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update team member")
		return
	}
	writeJSON(w, statusCode, data)
}

// DELETE /api/team-members/{id}
func (h *TeamMemberHandler) Delete(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	id := chi.URLParam(r, "id")

	data, statusCode, err := h.sb.Delete(fmt.Sprintf("team_members?id=eq.%s", id), token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete team member")
		return
	}
	writeJSON(w, statusCode, data)
}
