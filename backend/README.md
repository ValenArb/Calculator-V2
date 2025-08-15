# Calculator V2 Backend

Node.js/Express API for Calculator V2 electrical project management system.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Quick Setup

1. **Install PostgreSQL**
   ```bash
   # Windows (using chocolatey)
   choco install postgresql
   
   # Or download from: https://www.postgresql.org/download/
   ```

2. **Create Database**
   ```sql
   CREATE DATABASE calculator_v2;
   CREATE USER calc_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE calculator_v2 TO calc_user;
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run Database Migration**
   ```bash
   npm run db:migrate
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects for user
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/activity` - Get project activity log

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/:id` - Get specific template
- `GET /api/templates/dashboard/grouped` - Get templates grouped by type

### Statistics
- `GET /api/stats/dashboard?userId=X` - Get dashboard statistics
- `GET /api/stats/recent-projects?userId=X` - Get recent projects
- `GET /api/stats/system` - Get system-wide statistics

### Health Check
- `GET /health` - Server and database status

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculator_v2
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

## Database Schema

- **projects**: Main project data with JSONB calculation storage
- **project_templates**: Reusable project templates
- **project_activities**: Activity logging for audit trail

## Development

```bash
npm run dev     # Start with nodemon (auto-restart)
npm start       # Start production server
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed initial data
```