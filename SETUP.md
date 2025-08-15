# Calculator V2 Setup Guide

Complete setup guide for the Calculator V2 application with enhanced project management.

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## Quick Setup

### 1. Frontend Setup

The frontend server should already be running. If not:

```bash
npm install
npm run dev
```

Frontend will be available at: http://localhost:3000

### 2. Backend Setup

```bash
# Install backend dependencies
npm run setup:backend

# OR manually:
cd backend
npm install
```

### 3. Database Setup

**Install PostgreSQL:**
```bash
# Windows (using chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/
```

**Create Database:**
```sql
CREATE DATABASE calculator_v2;
CREATE USER calc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE calculator_v2 TO calc_user;
```

**Configure Environment:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

**Run Migrations:**
```bash
npm run db:setup

# OR manually:
cd backend
npm run db:migrate
```

### 4. Run Complete System

```bash
# Install concurrently if needed
npm install

# Run both frontend and backend
npm run dev:full
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Application Features

### Enhanced Dashboard
- ✅ **Three-Card Layout**: Create Project, Recent Projects, Templates
- ✅ **KPI Statistics**: Project counts, completion rates, activity metrics
- ✅ **Quick Actions**: Import, Export, Backup, Analytics
- ✅ **Project Distribution**: Visual breakdown by type and status

### Project Management
- ✅ **Create Projects**: With client information and project details
- ✅ **Project Templates**: System templates for different project types
- ✅ **Recent Projects**: Quick access to recently modified projects
- ✅ **Project Statistics**: Comprehensive activity tracking

### Database Features
- ✅ **PostgreSQL**: Local database for full control
- ✅ **JSONB Storage**: Flexible calculation data storage
- ✅ **Activity Logging**: Complete audit trail
- ✅ **Templates System**: Reusable project templates

## API Endpoints

### Projects
- `GET /api/projects?userId=X` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id?userId=X` - Get specific project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id?userId=X` - Delete project

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/dashboard/grouped` - Get grouped templates

### Statistics
- `GET /api/stats/dashboard?userId=X` - Get dashboard statistics
- `GET /api/stats/recent-projects?userId=X` - Get recent projects

### Health Check
- `GET /health` - Server and database status

## Environment Configuration

**Backend (.env):**
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

## Development Workflow

1. **Frontend Changes**: Hot reloading active on port 3000
2. **Backend Changes**: Nodemon auto-restart on port 3001
3. **Database Changes**: Run migrations with `npm run db:migrate`
4. **Full Development**: Use `npm run dev:full` to run both servers

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
cd backend
node -e "import('./config/database.js').then(db => db.testConnection())"
```

### Port Conflicts
- Frontend (3000): Change in `vite.config.js`
- Backend (3001): Change `PORT` in `.env`

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Backend clean install
cd backend
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

1. **Build Frontend**: `npm run build`
2. **Start Backend**: `cd backend && npm start`
3. **Database**: Ensure PostgreSQL is running
4. **Environment**: Set `NODE_ENV=production`

## Next Steps

- [ ] Connect API calls in frontend components
- [ ] Implement project editing functionality
- [ ] Add project export features
- [ ] Create backup/restore system
- [ ] Add user permissions and sharing