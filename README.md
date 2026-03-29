# 🚀 Task Board

Full-stack Kanban board with drag-and-drop. Took design cues from Linear and Notion.

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Go + Chi Router
- **Database & Auth:** Supabase (PostgreSQL + Anonymous Sign-In + RLS)
- **Drag & Drop:** @dnd-kit
- **Hosting:** Vercel

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Go](https://img.shields.io/badge/Go-1.26-00ADD8?logo=go)
![Supabase](https://img.shields.io/badge/Supabase-Free_Tier-3ECF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss)

---

## ✨ Features

### 📋 Core
- **Drag & Drop** — Smooth task movement across 4 columns (To Do → In Progress → In Review → Done)
- **Task Management** — Create, edit, delete tasks with title, description, priority, and due date
- **Guest Auth** — Anonymous sign-in via Supabase, no registration required
- **Row Level Security** — Each user only sees their own data
- **Go Backend** — RESTful API with Chi router, forwarding Supabase JWT for RLS

### 🏆 Advanced Features (All 7 Implemented)

| # | Feature | Description |
|---|---------|-------------|
| 1 | 👥 **Team Members** | Create team members with name & color, assign to tasks, see avatars on cards |
| 2 | 💬 **Comments** | Open task detail panel, write comments, chronological with timestamps |
| 3 | 📜 **Activity Log** | Track status changes, edits, assignments — timeline view per task |
| 4 | 🏷️ **Labels / Tags** | Custom labels with colors, assign to tasks, filter board by label |
| 5 | 📅 **Due Date Indicators** | Red for overdue, yellow for due soon, green for completed |
| 6 | 🔍 **Search & Filtering** | Search by title, filter by priority / assignee / label |
| 7 | 📊 **Board Stats** | Total tasks, active, completed, overdue — live in the header |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Icons** | Lucide React |
| **Backend** | Go + Chi Router |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Anonymous Sign-In |
| **Hosting** | Vercel (frontend) |

---

## 📁 Project Structure

```
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── board/                # Board, Column, TaskCard, EmptyColumn
│   │   ├── task/                 # CreateTaskModal, TaskDetailPanel, Comments, ActivityLog
│   │   ├── team/                 # TeamManagerModal, AvatarGroup
│   │   ├── labels/               # LabelManagerModal, LabelChip
│   │   ├── filters/              # SearchInput, FilterBar
│   │   ├── layout/               # Header, BoardStats
│   │   └── ui/                   # Modal, Button, Spinner, Avatar
│   ├── contexts/                 # AuthContext, BoardContext
│   ├── lib/                      # Supabase client, API client, constants
│   ├── types/                    # TypeScript interfaces
│   └── utils/                    # Date helpers, position calculation
│
├── backend/                      # Backend (Go)
│   ├── main.go                   # Server entry, routes, middleware
│   ├── handlers/                 # Tasks, TeamMembers, Labels, Comments, ActivityLog
│   ├── middleware/                # JWT auth extraction
│   └── models/                   # Request/response types
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- A [Supabase](https://supabase.com) account (free tier)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/kanban-board.git
cd kanban-board
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema below (see [Database Schema](#-database-schema))
3. Enable **Anonymous Sign-In**: Authentication → Providers → Anonymous Sign-In → Enable
4. Copy your **Project URL** and **anon key** from Settings → API

### 3. Configure environment variables

**Frontend** — create `.env.local` in the root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8080
```

**Backend** — create `.env` in `backend/`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
FRONTEND_URL=http://localhost:5173
PORT=8080
```

### 4. Install & run

```bash
# Frontend
npm install
npm run dev

# Backend (in another terminal)
cd backend
go run main.go
```

Open **http://localhost:5173** and start managing tasks! 🎉

---

## 🗄️ Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Tasks
create table tasks (
  id bigint generated always as identity primary key,
  title text not null,
  description text default '',
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'in_review', 'done')),
  priority text not null default 'medium'
    check (priority in ('urgent', 'high', 'medium', 'low')),
  due_date date,
  position real not null default 0,
  user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Team Members
create table team_members (
  id bigint generated always as identity primary key,
  name text not null,
  color text not null default '#6366f1',
  user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- Task Assignees (junction)
create table task_assignees (
  task_id bigint not null references tasks(id) on delete cascade,
  team_member_id bigint not null references team_members(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  primary key (task_id, team_member_id)
);

-- Labels
create table labels (
  id bigint generated always as identity primary key,
  name text not null,
  color text not null default '#8b5cf6',
  user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- Task Labels (junction)
create table task_labels (
  task_id bigint not null references tasks(id) on delete cascade,
  label_id bigint not null references labels(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id),
  primary key (task_id, label_id)
);

-- Comments
create table comments (
  id bigint generated always as identity primary key,
  task_id bigint not null references tasks(id) on delete cascade,
  content text not null,
  user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- Activity Log
create table activity_log (
  id bigint generated always as identity primary key,
  task_id bigint not null references tasks(id) on delete cascade,
  action text not null,
  details jsonb default '{}',
  user_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_tasks_user_status on tasks(user_id, status);
create index idx_comments_task on comments(task_id, created_at);
create index idx_activity_task on activity_log(task_id, created_at);

-- Auto-update timestamp
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();

-- Enable RLS on all tables
alter table tasks enable row level security;
alter table team_members enable row level security;
alter table task_assignees enable row level security;
alter table labels enable row level security;
alter table task_labels enable row level security;
alter table comments enable row level security;
alter table activity_log enable row level security;

-- RLS policies: users can only access their own data
create policy "own_data" on tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_data" on team_members for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_data" on task_assignees for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_data" on labels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_data" on task_labels for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_data" on comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_data" on activity_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Go Backend  │────▶│   Supabase   │
│  React + TS  │     │  Chi Router  │     │  PostgreSQL  │
│  Tailwind    │     │  REST API    │     │  Auth + RLS  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │  Supabase Auth     │  JWT forwarding
       │  (Anonymous)       │  (RLS enforced)
       └────────────────────┘
```

- **Frontend** handles auth (anonymous sign-in) and passes the JWT to the Go backend
- **Go Backend** validates the token, forwards requests to Supabase PostgREST API
- **Supabase RLS** ensures data isolation — each user only sees their own tasks

---

## ⚖️ Design Decisions & Tradeoffs

| Decision | Why |
|----------|-----|
| **Fractional indexing** for task position | Avoids renumbering all tasks on every drag — O(1) reorder |
| **Client-side filtering** | Single-user data volume is small; simpler than complex SQL joins |
| **Optimistic updates** | UI feels instant; reverts on failure |
| **Activity log in application layer** | More flexible than DB triggers; easier to format messages |
| **@dnd-kit** over react-beautiful-dnd | Modern, actively maintained, better touch support |
| **Go backend** | Lightweight, fast, matches the suggested tech stack |

### 🔮 What I'd Improve With More Time
- Real-time sync via Supabase Realtime subscriptions
- Task reordering within the same column (drag to reposition)
- File attachments on tasks
- Dark mode toggle
- Keyboard shortcuts (N for new task, etc.)
- Mobile-optimized responsive layout
- End-to-end tests with Playwright

