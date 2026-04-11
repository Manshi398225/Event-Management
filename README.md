# Cloud-Based Event Management System

Full-stack web application for college event management with student and admin roles.

## Structure

- `backend` - Express, MongoDB, JWT, MVC API
- `frontend` - React + Vite user interface

## Features

- JWT authentication with admin and student roles
- Event creation, update, deletion, and listing
- Student event registrations with duplicate protection
- Admin registration approval and analytics
- Profile management
- Search and responsive UI
- Optional email notification support through SMTP

## Local Setup

### Backend

1. `cd backend`
2. `copy .env.example .env`
3. `npm install`
4. `npm run seed`
5. `npm run dev`

### Frontend

1. `cd frontend`
2. `copy .env.example .env`
3. `npm install`
4. `npm run dev`

## Render Deployment

### Backend

- Create a new Render Web Service from `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables from `backend/.env.example`

### Frontend

- Create a Static Site on Render or Netlify from `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Set `VITE_API_URL` to your deployed backend URL plus `/api`

## Sample Admin

- Email: `admin@college.edu`
- Password: `Admin@123`
