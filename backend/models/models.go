package models

import "time"

type Task struct {
	ID          int64      `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	Priority    string     `json:"priority"`
	DueDate     *string    `json:"due_date"`
	Position    float64    `json:"position"`
	UserID      string     `json:"user_id"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Status      string   `json:"status"`
	Priority    string   `json:"priority"`
	DueDate     *string  `json:"due_date"`
	Position    float64  `json:"position"`
	AssigneeIDs []int64  `json:"assignee_ids"`
	LabelIDs    []int64  `json:"label_ids"`
}

type UpdateTaskRequest struct {
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Status      *string  `json:"status"`
	Priority    *string  `json:"priority"`
	DueDate     *string  `json:"due_date"`
	Position    *float64 `json:"position"`
}

type TeamMember struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateTeamMemberRequest struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type Label struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateLabelRequest struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type Comment struct {
	ID        int64     `json:"id"`
	TaskID    int64     `json:"task_id"`
	Content   string    `json:"content"`
	UserID    string    `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateCommentRequest struct {
	Content string `json:"content"`
}

type ActivityLog struct {
	ID        int64                  `json:"id"`
	TaskID    int64                  `json:"task_id"`
	Action    string                 `json:"action"`
	Details   map[string]interface{} `json:"details"`
	UserID    string                 `json:"user_id"`
	CreatedAt time.Time              `json:"created_at"`
}

type TaskAssignee struct {
	TaskID       int64  `json:"task_id"`
	TeamMemberID int64  `json:"team_member_id"`
	UserID       string `json:"user_id"`
}

type TaskLabel struct {
	TaskID  int64  `json:"task_id"`
	LabelID int64  `json:"label_id"`
	UserID  string `json:"user_id"`
}
