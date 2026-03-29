package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"

	"kanban-board-api/middleware"
	"kanban-board-api/models"

	"github.com/go-chi/chi/v5"
)

type TaskHandler struct {
	sb *SupabaseClient
}

func NewTaskHandler(sb *SupabaseClient) *TaskHandler {
	return &TaskHandler{sb: sb}
}

// GET /api/tasks
func (h *TaskHandler) List(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)

	query := "tasks?select=*&order=position.asc"

	// Optional status filter
	if status := r.URL.Query().Get("status"); status != "" {
		query += "&status=eq." + url.QueryEscape(status)
	}

	data, status, err := h.sb.Get(query, token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch tasks")
		return
	}
	writeJSON(w, status, data)
}

// POST /api/tasks
func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)

	var req models.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Title == "" {
		writeError(w, http.StatusBadRequest, "title is required")
		return
	}
	if req.Status == "" {
		req.Status = "todo"
	}
	if req.Priority == "" {
		req.Priority = "medium"
	}

	taskBody := map[string]interface{}{
		"title":       req.Title,
		"description": req.Description,
		"status":      req.Status,
		"priority":    req.Priority,
		"position":    req.Position,
	}
	if req.DueDate != nil {
		taskBody["due_date"] = *req.DueDate
	}

	data, statusCode, err := h.sb.Post("tasks", token, taskBody, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create task")
		return
	}

	if statusCode >= 400 {
		writeJSON(w, statusCode, data)
		return
	}

	// Parse created task to get ID for assignees/labels/activity
	var tasks []models.Task
	if err := json.Unmarshal(data, &tasks); err != nil || len(tasks) == 0 {
		writeJSON(w, statusCode, data)
		return
	}
	task := tasks[0]

	// Insert assignees
	if len(req.AssigneeIDs) > 0 {
		var assignees []map[string]interface{}
		for _, memberID := range req.AssigneeIDs {
			assignees = append(assignees, map[string]interface{}{
				"task_id":        task.ID,
				"team_member_id": memberID,
			})
		}
		h.sb.Post("task_assignees", token, assignees, nil)
	}

	// Insert labels
	if len(req.LabelIDs) > 0 {
		var labels []map[string]interface{}
		for _, labelID := range req.LabelIDs {
			labels = append(labels, map[string]interface{}{
				"task_id":  task.ID,
				"label_id": labelID,
			})
		}
		h.sb.Post("task_labels", token, labels, nil)
	}

	// Log activity
	h.sb.Post("activity_log", token, map[string]interface{}{
		"task_id": task.ID,
		"action":  "created",
		"details": map[string]interface{}{"title": task.Title},
	}, nil)

	writeJSON(w, http.StatusCreated, data)
}

// PATCH /api/tasks/{id}
func (h *TaskHandler) Update(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "id")

	var req models.UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Fetch current task for activity log
	oldData, _, _ := h.sb.Get(fmt.Sprintf("tasks?id=eq.%s", taskID), token, nil)
	var oldTasks []models.Task
	json.Unmarshal(oldData, &oldTasks)

	body := make(map[string]interface{})
	if req.Title != nil {
		body["title"] = *req.Title
	}
	if req.Description != nil {
		body["description"] = *req.Description
	}
	if req.Status != nil {
		body["status"] = *req.Status
	}
	if req.Priority != nil {
		body["priority"] = *req.Priority
	}
	if req.DueDate != nil {
		body["due_date"] = *req.DueDate
	}
	if req.Position != nil {
		body["position"] = *req.Position
	}

	if len(body) == 0 {
		writeError(w, http.StatusBadRequest, "no fields to update")
		return
	}

	path := fmt.Sprintf("tasks?id=eq.%s", taskID)
	data, statusCode, err := h.sb.Patch(path, token, body, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update task")
		return
	}

	// Log activity for status changes
	if req.Status != nil && len(oldTasks) > 0 && oldTasks[0].Status != *req.Status {
		h.sb.Post("activity_log", token, map[string]interface{}{
			"task_id": taskID,
			"action":  "status_changed",
			"details": map[string]interface{}{
				"from": oldTasks[0].Status,
				"to":   *req.Status,
			},
		}, nil)
	}

	// Log activity for title/description/priority changes
	if req.Title != nil && len(oldTasks) > 0 && oldTasks[0].Title != *req.Title {
		h.sb.Post("activity_log", token, map[string]interface{}{
			"task_id": taskID,
			"action":  "edited",
			"details": map[string]interface{}{"field": "title"},
		}, nil)
	}

	if req.Priority != nil && len(oldTasks) > 0 && oldTasks[0].Priority != *req.Priority {
		h.sb.Post("activity_log", token, map[string]interface{}{
			"task_id": taskID,
			"action":  "priority_changed",
			"details": map[string]interface{}{
				"from": oldTasks[0].Priority,
				"to":   *req.Priority,
			},
		}, nil)
	}

	writeJSON(w, statusCode, data)
}

// DELETE /api/tasks/{id}
func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "id")

	path := fmt.Sprintf("tasks?id=eq.%s", taskID)
	data, statusCode, err := h.sb.Delete(path, token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to delete task")
		return
	}
	writeJSON(w, statusCode, data)
}

// PUT /api/tasks/{id}/assignees
func (h *TaskHandler) UpdateAssignees(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "id")

	var req struct {
		TeamMemberIDs []int64 `json:"team_member_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Delete existing assignees
	h.sb.Delete(fmt.Sprintf("task_assignees?task_id=eq.%s", taskID), token, nil)

	// Insert new assignees
	if len(req.TeamMemberIDs) > 0 {
		var assignees []map[string]interface{}
		for _, memberID := range req.TeamMemberIDs {
			assignees = append(assignees, map[string]interface{}{
				"task_id":        taskID,
				"team_member_id": memberID,
			})
		}
		h.sb.Post("task_assignees", token, assignees, nil)

		h.sb.Post("activity_log", token, map[string]interface{}{
			"task_id": taskID,
			"action":  "assignees_updated",
			"details": map[string]interface{}{"member_ids": req.TeamMemberIDs},
		}, nil)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// PUT /api/tasks/{id}/labels
func (h *TaskHandler) UpdateLabels(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "id")

	var req struct {
		LabelIDs []int64 `json:"label_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Delete existing labels
	h.sb.Delete(fmt.Sprintf("task_labels?task_id=eq.%s", taskID), token, nil)

	// Insert new labels
	if len(req.LabelIDs) > 0 {
		var labels []map[string]interface{}
		for _, labelID := range req.LabelIDs {
			labels = append(labels, map[string]interface{}{
				"task_id":  taskID,
				"label_id": labelID,
			})
		}
		h.sb.Post("task_labels", token, labels, nil)

		h.sb.Post("activity_log", token, map[string]interface{}{
			"task_id": taskID,
			"action":  "labels_updated",
			"details": map[string]interface{}{"label_ids": req.LabelIDs},
		}, nil)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// GET /api/tasks/{id}/assignees
func (h *TaskHandler) GetAssignees(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "id")

	query := fmt.Sprintf("task_assignees?task_id=eq.%s&select=team_member_id,team_members(id,name,color)", taskID)
	data, statusCode, err := h.sb.Get(query, token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch assignees")
		return
	}
	writeJSON(w, statusCode, data)
}

// GET /api/tasks/{id}/labels
func (h *TaskHandler) GetLabels(w http.ResponseWriter, r *http.Request) {
	token := middleware.GetToken(r)
	taskID := chi.URLParam(r, "id")

	query := fmt.Sprintf("task_labels?task_id=eq.%s&select=label_id,labels(id,name,color)", taskID)
	data, statusCode, err := h.sb.Get(query, token, nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch labels")
		return
	}
	writeJSON(w, statusCode, data)
}
