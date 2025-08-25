# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend Development
```bash
npm install                    # Install dependencies
npm run dev                    # Start development server (port 3000)
npm run build                  # Build for production (includes TypeScript compilation)
npm run preview                # Preview production build
npm run lint                   # Run ESLint with TypeScript support
npm run typecheck              # Run TypeScript type checking without emit

# Convenience scripts for full-stack development
npm run dev:backend            # Start backend server only (cd backend && npm run dev)
npm run dev:full               # Start both frontend and backend concurrently
npm run setup:backend          # Install backend dependencies (cd backend && npm install)
npm run db:setup               # Run database migrations (cd backend && npm run db:migrate)
```

### Backend Development (SQLite3 API)
```bash
cd backend
npm install                    # Install backend dependencies
npm run db:migrate             # Create database schema
npm run db:seed                # Seed database with initial data
npm run db:reset               # Reset database (drop and recreate)
npm run dev                    # Start backend API server (port 3001) with auto-reload
npm start                      # Start backend in production mode
```

## Development Server Management

**CRITICAL RULE: NEVER START SERVERS AUTOMATICALLY**

**🚨 IMPORTANT: Claude must NEVER run server commands automatically. Always ask the user first before starting any servers.**

**Frontend Server (Required):**
- **ASK USER before starting**: `npm run dev`
- **Frontend runs on**: `http://localhost:3000`

**Backend API Server (Required):**
- **ASK USER before starting**: `cd backend && npm run dev`
- **Backend runs on**: `http://localhost:3001`

**Development Workflow:**
```bash
# Terminal 1 - Backend API
cd backend
npm install                    # Only needed once
npm run db:migrate            # Only needed once or after schema changes
npm run dev                   # Keep running

# Terminal 2 - Frontend
npm install                   # Only needed once  
npm run dev                   # Keep running

# Terminal 3 - Additional commands
npm run lint
npm run typecheck
git commands, etc.
```

**Server Restart Required After:**
- Package.json dependencies changes
- Vite configuration changes
- Environment variables changes
- Database schema changes (backend)
- Major structural changes

**Important Notes:**
- Frontend server provides hot reloading for immediate feedback
- Backend provides SQLite3 database and REST API
- Never commit changes without testing on both running servers
- If application doesn't load, first check if both servers are running
- API calls from frontend go to `http://localhost:3001/api`

## Architecture Overview

This is a streamlined electrical engineering calculator application focused on providing comprehensive calculation tools with user management.

### Current Architecture (SQLite3 Backend)

**Frontend (React + Redux)**:
- `authSlice`: User authentication (Firebase Auth integration)
- Clean, minimal state management focusing on authentication
- API service layer for backend communication

**Backend (Node.js + Express + SQLite3)**:
- Local SQLite3 database with optimized performance settings
- RESTful API endpoints for project CRUD operations
- Automatic database schema creation and migrations
- Transaction support for data integrity

**Feature-Based Organization**: 
- `src/features/auth/`: Authentication components, hooks, and services
- `src/components/calculator/`: 60+ individual calculator components
- `src/components/projects/`: Project management components with real data
- `src/components/ui/`: Reusable UI components
- `src/services/api.js`: Backend API integration service
- `src/pages/`: Main application pages (Dashboard, Login, Calculator)

**Backend Structure**:
- `backend/config/database.js`: SQLite3 configuration and helpers
- `backend/routes/projects.js`: Project CRUD API endpoints
- `backend/database/schema.sql`: Database schema definition
- `backend/scripts/migrate.js`: Database migration script

**Key Architectural Patterns**:
- **Component-Based Architecture**: Modular, reusable calculator components
- **API-First Design**: Clean separation between frontend and backend
- **Local Database**: SQLite3 for self-hosted deployment
- **Firebase Auth Integration**: User authentication with local project storage
- **Session + Persistence**: Calculations stored locally with project context

### Data Flow Architecture (SQLite3 Backend)

1. **User Authentication**: Firebase Auth for user login/registration
2. **Project Management**: Frontend ↔ Backend API ↔ SQLite3 database
3. **Calculator Operations**: Client-side calculation logic within components
4. **Data Persistence**: Projects and calculations saved to local SQLite3 database
5. **Real-time Updates**: API calls update project data and refresh UI
6. **Search & Filtering**: Client-side filtering with server-side data

**API Endpoints**:
- `GET /api/projects?userId={uid}` - Get all user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/{id}/activity` - Get project activity log

### Database Architecture (SQLite3)

**SQLite3 Database**: Local file-based database for self-hosting
**Location**: `backend/database/calculator.db`
**Performance**: WAL mode, foreign keys enabled, optimized pragmas

**Database Tables**:
```sql
projects
├── id: TEXT (UUID)
├── name: TEXT
├── description: TEXT
├── owner_id: TEXT (Firebase UID)
├── project_type: TEXT (residential/commercial/industrial)
├── status: TEXT (draft/active/completed/archived)
├── client_name: TEXT
├── client_email: TEXT
├── client_phone: TEXT
├── location: TEXT
├── calculation_data: TEXT (JSON)
├── metadata: TEXT (JSON)
├── calculation_count: INTEGER
├── created_at: TEXT (ISO datetime)
└── updated_at: TEXT (ISO datetime)

project_activities
├── id: TEXT (UUID)
├── project_id: TEXT → projects(id)
├── user_id: TEXT (Firebase UID)
├── activity_type: TEXT
├── description: TEXT
├── metadata: TEXT (JSON)
└── created_at: TEXT (ISO datetime)
```

**Firebase Integration**:
- **Authentication Only**: Firebase Auth with Google SSO and email/password
- **No Firestore**: All project data stored locally in SQLite3
- **User IDs**: Firebase UIDs used as foreign keys in local database

### Email Service Configuration (Gmail App Password)

**Email Service**: Uses Gmail with App Password authentication for sending emails
**Location**: `backend/config/email.js`
**Frontend Service**: `src/services/email.js`
**Sending Email**: noticalculadora@gmail.com

**Required Environment Variables** (Backend):
```env
GMAIL_USER=noticalculadora@gmail.com
GMAIL_APP_PASSWORD=eljs_oisk_rosi_jjal
```

**Email API Endpoints**:
- `GET /api/email/status` - Get email service configuration status
- `GET /api/email/test` - Test email service configuration
- `POST /api/email/invitation` - Send project invitation email
- `POST /api/email/notification` - Send general notification email
- `POST /api/email/send` - Send custom email with HTML content

**Email Types**:
- **Project Invitations**: Automatic emails when users are invited to projects
- **System Notifications**: Project updates, protocol completions, etc.
- **Custom Emails**: Protocol reports, administrative communications

**Gmail App Password Setup** (Already configured):
1. ✅ Gmail account created: noticalculadora@gmail.com
2. ✅ 2-Factor Authentication enabled
3. ✅ App Password generated: eljs oisk rosi jjal
4. ✅ Environment variables configured in backend/.env

**Email Service Features**:
- Beautiful HTML email templates
- Automatic fallback to plain text
- Email validation and error handling
- Rate limiting and spam protection
- Status monitoring and testing tools
- Integration with invitation system
- Simplified authentication with App Password

## Electrical Engineering Context

This application implements professional electrical calculations following IEC and IEEE standards:

**DPMS (Determinación de Potencia Máxima Simultánea)**: Calculates demand loads with proper diversity factors for different building types and load categories (TUG, IUG, ATE, ACU, TUE, OCE).

**Load Calculations**: Handles single-phase (220V), three-phase (380V line-to-line), and split-phase systems with accurate current calculations.

**Thermal Analysis**: Conductor capacity verification with temperature derating, installation method factors, and grouping corrections per IEC 60364-5-52.

**Voltage Drop**: Exact calculations (not approximations) considering both resistive and reactive components, with standards-compliant limits.

**Short Circuit**: IEC 60909 methodology with X/R ratio considerations for peak current calculations.

**PDF Export**: Professional PDF report generation following IEC 60364-6 standards for electrical installation testing documentation using jsPDF and html2canvas libraries.

## Development Considerations

**Calculation Accuracy**: All electrical formulas follow IEC and IEEE standards for professional electrical engineering calculations.

**Type Safety**: TypeScript is used throughout with proper typing for electrical parameters. Always run `npm run typecheck` to validate before committing.

**Session-Based Calculations**: All calculations are performed client-side and exist only during the user session. No data persistence for calculations currently.

**Component-Based Design**: Each calculator is self-contained with its own logic and UI, making them easy to maintain and extend.

## Firebase Configuration

The Firebase config is in `firebaseconfig.js`. Current setup includes:
- Authentication (Google SSO + email/password)
- Error codes collection for admin management
- Simplified security rules for admin-only error code management

## Adding New Calculator Components

**For Individual Calculators:**
1. Create new calculator component in `src/components/calculator/`
2. Follow existing patterns for form inputs and result display
3. Implement client-side calculation logic within the component
4. Add to CalculatorApp component navigation
5. Test with development server running

**For Future Project System:**
- Project management will be rebuilt from scratch
- New database architecture (SQL) will be implemented
- Export functionality will be redesigned

## GitHub Repository

**Repository URL**: https://github.com/ValenArb/Calculator-V2

**Important Instructions for Claude Code**: 
- This project is version controlled with Git and hosted on GitHub
- **AFTER EVERY MODIFICATION**, you MUST automatically commit and push changes to GitHub
- Use descriptive commit messages that explain what was changed and why
- Always include the Claude Code signature in commit messages

### Git Workflow for Claude Code

**For ANY file modification, addition, or deletion:**

1. **Make your changes** using the appropriate tools (Edit, Write, etc.)
2. **Stage all changes**: `git add .`
3. **Commit with descriptive message**: 
   ```bash
   git commit -m "Description of changes made
   
   🤖 Generated with [Claude Code](https://claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```
4. **Push to GitHub**: `git push origin [current-branch]` (check current branch with `git branch`)

**Example commit workflow:**
```bash
git add .
git commit -m "Add voltage drop calculation validation

- Implement input validation for cable parameters
- Add error handling for invalid conductor sizes
- Update thermal derating calculations per IEC standards

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin [current-branch]
```

**Repository Configuration:**
- Main branch: `master`
- Current working branch: `pdf-export-feature` (check with `git branch`)
- Remote: `origin` (https://github.com/ValenArb/Calculator-V2.git)
- Owner: ValenArb (valenarbert@gmail.com)

### GitHub Integration Guidelines

- **Always verify changes are pushed** after modifications
- **Use meaningful commit messages** that describe the electrical engineering context
- **Group related changes** in single commits when logical
- **Never commit sensitive information** (Firebase keys, API secrets, etc.)
- **Maintain clean commit history** with atomic, logical changes