# ResolveIT - Corporate IT Helpdesk & Complaint Management System

ResolveIT is a full-stack helpdesk platform for internal corporate IT support.

## Tech Stack
- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MySQL
- Auth: JWT + bcrypt
- Uploads: Multer
- Charts: Recharts

## Project Structure

```text
client/
  src/
    components/
    pages/
    layouts/
    services/
    context/
server/
  controllers/
  routes/
  models/
  middleware/
  config/
  scripts/
```

## Features

### Authentication
- Role-based login (`employee`, `admin`)
- Password hashing via `bcrypt`
- JWT authentication
- Protected routes and role guards
- Separate employee/admin dashboards

### Employee
- Register & login
- Create complaint with image upload
- Auto ticket ID generation (`CMP-YYYY-###`)
- View own complaints
- Track status: `Pending -> In Progress -> Resolved -> Closed`
- Update profile

### Admin
- View all complaints
- Filter by status/category/priority
- Move complaint status with lifecycle validation
- Delete complaints
- Analytics dashboard:
  - Total complaints
  - Pending
  - In Progress
  - Resolved
  - Closed
  - Bar chart by category
  - Pie chart by status

### Extra
- Loading spinners
- Toast notifications
- Protected admin routes
- Pagination in complaint lists

## Database Setup

1. Create/import schema:
```sql
SOURCE server/scripts/schema.sql;
```

2. Default admin account from seed:
- Email: `admin@resolveit.com`
- Password: `Admin@123`

## Environment Variables

### Backend (`server/.env`)
Copy from `server/.env.example` and fill values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resolveit
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
Copy from `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_UPLOAD_BASE_URL=http://localhost:5000
```

## Run Locally

1. Install backend dependencies:
```bash
cd server
npm install
```

2. Install frontend dependencies:
```bash
cd ../client
npm install
```

3. Start backend:
```bash
cd ../server
npm run dev
```

4. Start frontend:
```bash
cd ../client
npm run dev
```

5. Open app:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Core API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Complaints
- `POST /api/complaints` (employee)
- `GET /api/complaints/my` (employee)
- `GET /api/complaints` (admin)
- `PATCH /api/complaints/:id/status` (admin)
- `DELETE /api/complaints/:id` (admin)
- `GET /api/complaints/analytics/summary` (admin)

## Notes
- Status updates only allow forward lifecycle transitions.
- Uploaded images are stored in `server/uploads` and served from `/uploads/<filename>`.
- Registration currently allows both employee/admin role selection for demo/testing.
