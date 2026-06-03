# Hostel Complaint Management System

Full-stack app for submitting and managing hostel complaints.

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MySQL / MariaDB (localhost:3306, user `root`, no password)

## Features

- Student registration & login (JWT auth)
- Submit complaints in categories: electricity, water, internet, maintenance, food
- Auto-generated unique complaint IDs (e.g. `HCMS-AB12CD34`)
- Admin dashboard: view/filter all complaints, assign to staff, stats
- Staff dashboard: view assigned complaints, update status
- Status flow: **Pending → In Progress → Resolved**
- Public complaint tracking by complaint ID

## Project structure

```
hostel-complaint-system/
  backend/    Express API + MySQL
  frontend/   React + Tailwind (Vite)
```

## Setup

### 1. Database

MySQL must be running on `localhost:3306`. Create the schema and seed demo accounts:

```bash
cd backend
npm install
npm run init-db
```

### 2. Backend API

```bash
cd backend
npm start        # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend on port 5000.

## Demo accounts

| Role    | Email              | Password   |
|---------|--------------------|------------|
| Admin   | admin@hostel.com   | admin123   |
| Staff   | staff1@hostel.com  | staff123   |
| Staff   | staff2@hostel.com  | staff123   |
| Student | student@hostel.com | student123 |

## API overview

| Method | Endpoint                              | Role    | Purpose                       |
|--------|---------------------------------------|---------|-------------------------------|
| POST   | /api/auth/register                    | public  | Student registration          |
| POST   | /api/auth/login                       | public  | Login (any role)              |
| GET    | /api/auth/me                          | auth    | Current user                  |
| POST   | /api/complaints                       | student | Submit complaint              |
| GET    | /api/complaints/mine                  | student | List own complaints           |
| GET    | /api/complaints/track/:code           | public  | Track by complaint ID         |
| GET    | /api/admin/complaints                 | admin   | All complaints (+filters)     |
| GET    | /api/admin/stats                      | admin   | Dashboard counts              |
| GET    | /api/admin/staff                      | admin   | Staff list                    |
| PUT    | /api/admin/complaints/:id/assign      | admin   | Assign complaint to staff     |
| GET    | /api/staff/complaints                 | staff   | Assigned complaints           |
| PUT    | /api/staff/complaints/:id/status      | staff   | Update complaint status       |
