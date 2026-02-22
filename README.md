# CRUD Node + Angular (End-to-End)

This project contains a complete CRUD application with:

- `backend`: Node.js + Express + MySQL + Winston logging
- `frontend`: Angular 18 (module-based, routed UI with reactive forms)

## Folder Structure

```text
CRUD-Node-Ang/
  backend/
  frontend/
```

## Backend Setup (`backend`)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment file:

   - Edit `backend/.env`
   - Set your MySQL credentials and `PORT=5000`

3. Create database/table manually in MySQL:

   - Use a database name matching `DB_NAME` in `backend/.env` (example below uses `world`):

   ```sql
   CREATE DATABASE IF NOT EXISTS world;
   USE world;

   CREATE TABLE IF NOT EXISTS users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(150) NOT NULL UNIQUE,
     role VARCHAR(50) NULL
   );
   ```

   - If your `users` table already exists without `role`, add it as optional:

   ```sql
   ALTER TABLE users ADD COLUMN role VARCHAR(50) NULL;
   ```

4. Start backend (port `5000`):

   ```bash
   npm run start
   ```

### Backend API Endpoints

- `GET /users` - Fetch all users
- `GET /users/:id` - Fetch one user
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## Frontend Setup (`frontend`)

1. Install dependencies:

   ```bash
   npm install
   ```

2. Confirm API URL:

   - `frontend/src/environments/environment.ts` uses `http://localhost:5000`

3. Start frontend (port `4200`):

   ```bash
   npm run start
   ```

## Logging

Winston is configured in `backend/src/config/logger.js` with:

- Console logging
- Rotating application logs (`backend/logs/application-YYYY-MM-DD.log`)
- Rotating error logs (`backend/logs/error-YYYY-MM-DD.log`)
- Stack traces for error/exception/rejection logging

Request and response logging middleware is in:

- `backend/src/middleware/requestLogger.js`
- `backend/src/middleware/errorHandler.js`

## Notes

- Backend default port: `5000`
- Frontend default port: `4200`
- Frontend uses `UserService` to consume backend APIs
