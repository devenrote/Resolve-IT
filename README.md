# ResolveIT - Corporate IT Helpdesk & Complaint Management System

ResolveIT is a full-stack corporate IT support and grievance redressal platform designed for modern organizations. It features a responsive double-theme system, role-based security, automated tracking, and cloud-based file uploads.

## Tech Stack
* **Frontend**: React.js (Vite) + Tailwind CSS + Vanilla CSS (Custom Theme Engine)
* **Backend**: Node.js + Express.js
* **Database**: PostgreSQL (`pg` pool connection)
* **Auth**: JWT (token payload with userId, email, and role) + `bcrypt` password hashing
* **File Uploads**: Cloudinary integration (supporting PDF, ZIP, and image formats)
* **Email Notifications**: Web3Forms client-side integration
* **Analytics**: Recharts (interactive dashboards)

## Project Structure
```text
client/
  src/
    components/   # Reusable components (Navbar, ProtectedRoute, etc.)
    pages/        # Admin and Employee specific pages
    layouts/      # Admin and Employee dashboard sidebar shells
    services/     # API request hooks
    context/      # AuthContext containing active user and global theme states
server/
  controllers/    # Auth, Complaint, Contact, and User controllers
  routes/         # Router endpoints
  models/         # Database models (PostgreSQL queries)
  middleware/     # Auth, Role, Upload, and Validation middlewares
  config/         # Database and Cloudinary configurations
  scripts/        # PostgreSQL schema scripts
```

## Features

### Authentication & Redirection
* **Simplified Access**: Role dropdown selection is completely removed from the Registration and Login forms.
* **Registration**: Register with **Name, Email, and Password**. New user sign-ups are always assigned the `employee` role on the backend (ignoring client payloads).
* **Login**: Login with **Email and Password**. The backend validates credentials, reads the user's role from the PostgreSQL database, signs it into the JWT, and the client automatically redirects the user to their corresponding layout:
  * `admin` → Admin Dashboard (`/admin`)
  * `employee` → Employee Dashboard (`/employee`)
* **Existing Accounts**: Pre-existing admin users created manually inside the database continue to log in and function normally.

### Theme Switcher (Dark/Light Mode)
* **Microsoft Azure / Stripe Inspired Style**: A sleek, clean Light Theme modeled after high-end SaaS products, featuring alternating row styles, white cards, subtle borders, custom scrollbars, and high contrast typography.
* **Centralized Switcher**: Toggling the Moon/Sun button in the header updates the theme globally, toggling a `light-theme` class on the `<body>` element.
* **Theme Storage**: The selected theme is automatically persisted in `localStorage` and restored on page reload.

### Employee Dashboard
* File complaints with ticket ID auto-generation (`CMP-YYYY-###`).
* Upload image, PDF, or ZIP attachments securely to Cloudinary.
* View and track own complaint status lifecycle: `Pending → In Progress → Resolved → Closed`.
* Edit or cancel own complaints only while they are still in the `Pending` state.
* Manage personal user profile details.

### Admin Dashboard
* View all corporate complaints in a paginated list.
* Filter complaints by category, priority, or status.
* Change complaint statuses (lifecycle logic validation) or delete records.
* Interactive analytics:
  * Total, Pending, In Progress, Resolved, and Closed complaint summary cards.
  * Bar chart distribution by Category.
  * Pie chart distribution by Status.
* User Management portal to create new users (assigning `admin` or `employee` roles) and reset user passwords to default.

---

## Environment Variables

### Backend (`server/.env`)
Create a `.env` file in the `server` directory:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=complaint_system
DB_SSL=false
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
DEFAULT_USER_PASSWORD=Admin@123
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,http://localhost:5174
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
WEB3FORMS_ACCESS_KEY=your_web3forms_access_key
```

### Frontend (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_UPLOAD_BASE_URL=http://localhost:5001
```

---

## Run Locally

1. **Database Setup**:
   Ensure PostgreSQL is running, create the `complaint_system` database, and run `server/scripts/schema.sql` to initialize the database tables and default admin seed.

2. **Install Dependencies**:
   ```bash
   # Server dependencies
   cd server
   npm install

   # Client dependencies
   cd ../client
   npm install
   ```

3. **Start Development Servers**:
   ```bash
   # Run backend (from server directory)
   npm run dev

   # Run frontend (from client directory)
   npm run dev
   ```

4. **Access Applications**:
   * Frontend: `http://localhost:5173`
   * Backend API: `http://localhost:5001`
