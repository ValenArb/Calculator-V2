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
```

### Backend Development (Python)
```bash
cd backend-python
python -m venv venv            # Create virtual environment
# Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python main.py                 # Start FastAPI server (port 8000)
uvicorn main:app --reload      # Start with auto-reload for development
```

## Architecture Overview

This is a full-stack electrical engineering calculator application with real-time collaboration capabilities.

### Frontend Architecture (React + Redux)

**State Management**: Redux Toolkit with 4 main slices:
- `authSlice`: User authentication (Firebase Auth integration)
- `projectsSlice`: Project CRUD operations with Firestore
- `calculationsSlice`: All electrical calculation data (DPMS, loads, thermal, etc.)
- `collaborationSlice`: Real-time sync and user presence

**Feature-Based Organization**: Each domain is self-contained in `src/features/`:
- `auth/`: Authentication components, hooks, and services
- `projects/`: Project management (CRUD, favorites, recent)
- `calculations/`: Calculation modules (DPMS, loads-per-panel, thermal, voltage-drop, short-circuit)
- `collaboration/`: Real-time sync hooks and collaborator management
- `export/`: Excel and PDF export functionality

**Key Architectural Patterns**:
- **Feature Co-location**: Each feature contains its components, hooks, services, and schemas
- **Redux + Custom Hooks**: Redux for global state, custom hooks for component logic
- **Real-time Sync**: Firestore listeners with debounced auto-save (2-second debounce)
- **Optimistic Updates**: UI updates immediately, syncs to Firebase in background

### Backend Architecture (Python FastAPI)

**Calculation Engine**: Specialized modules in `backend-python/calculations/`:
- `dpms.py`: Weighted power factor calculations, demand factors by building type
- `loads_per_panel.py`: Three-phase vs single-phase current calculations
- `thermal.py`: Temperature-dependent conductor capacity with IEC compliance
- `voltage_drop.py`: Exact voltage drop formulas (not approximations)
- `short_circuit.py`: IEC 60909 compliant short circuit calculations with X/R ratios
- `electrical_constants.py`: Standards-compliant constants and validation

**API Structure**: RESTful endpoints following pattern `/calculate/{module}` with Pydantic models for validation.

### Data Flow Architecture

1. **User Input**: Excel-like tables in React components
2. **State Updates**: Redux actions update calculation slices
3. **Real-time Sync**: Firestore listeners sync changes across users (debounced)
4. **Backend Calculations**: Optional Python API calls for complex calculations
5. **Export Pipeline**: In-browser generation of Excel/PDF from Redux state

### Firebase Integration

**Authentication**: Firebase Auth with Google SSO and email/password
**Database**: Firestore with real-time listeners for collaboration
**Security Rules**: Owner/collaborator permissions with email-based access control

**Project Structure in Firestore**:
```
projects/{projectId}
├── ownerId: string
├── collaborators: string[]
├── data: {
│   ├── dpms: Array<DPMSData>
│   ├── loadsByPanel: Array<LoadsByPanelData>
│   ├── thermal: Array<ThermalData>
│   ├── voltageDrops: Array<VoltageDropData>
│   └── shortCircuit: Array<ShortCircuitData>
├── lastModifiedBy: string
└── lastModifiedAt: timestamp
```

## Electrical Engineering Context

This application implements professional electrical calculations following IEC and IEEE standards:

**DPMS (Determinación de Potencia Máxima Simultánea)**: Calculates demand loads with proper diversity factors for different building types and load categories (TUG, IUG, ATE, ACU, TUE, OCE).

**Load Calculations**: Handles single-phase (220V), three-phase (380V line-to-line), and split-phase systems with accurate current calculations.

**Thermal Analysis**: Conductor capacity verification with temperature derating, installation method factors, and grouping corrections per IEC 60364-5-52.

**Voltage Drop**: Exact calculations (not approximations) considering both resistive and reactive components, with standards-compliant limits.

**Short Circuit**: IEC 60909 methodology with X/R ratio considerations for peak current calculations.

## Development Considerations

**Real-time Collaboration**: The `useRealTimeSync` hook automatically saves changes after 2 seconds of inactivity. Manual save is available via `forceSave()`.

**Calculation Accuracy**: All electrical formulas have been reviewed for standards compliance. The `electrical_constants.py` module provides validated constants and formulas.

**Type Safety**: TypeScript is used throughout with proper typing for electrical parameters. Run `npm run typecheck` to validate.

**Export System**: Uses jsPDF and XLSX libraries for client-side generation. Export options are configurable per module.

**State Persistence**: All calculation data persists to Firestore automatically. Projects can be loaded/resumed from any device.

## Firebase Configuration

The Firebase config is in `firebaseconfig.js`. Ensure Firestore security rules allow read/write access for project owners and collaborators:

```javascript
allow read, write: if request.auth != null && 
  (request.auth.uid == resource.data.ownerId || 
   request.auth.token.email in resource.data.collaborators);
```

## Adding New Calculation Modules

1. Create calculation logic in `backend-python/calculations/new_module.py`
2. Add Redux actions to `calculationsSlice.js`
3. Create React table component in `src/features/calculations/new-module/`
4. Add module to sidebar navigation in `components/layout/Sidebar`
5. Update export services to include new calculation type
6. Add TypeScript types to `src/types/index.ts`

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
4. **Push to GitHub**: `git push origin master`

**Example commit workflow:**
```bash
git add .
git commit -m "Add voltage drop calculation validation

- Implement input validation for cable parameters
- Add error handling for invalid conductor sizes
- Update thermal derating calculations per IEC standards

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master
```

**Repository Configuration:**
- Main branch: `master`
- Remote: `origin` (https://github.com/ValenArb/Calculator-V2.git)
- Owner: ValenArb (valenarbert@gmail.com)

### GitHub Integration Guidelines

- **Always verify changes are pushed** after modifications
- **Use meaningful commit messages** that describe the electrical engineering context
- **Group related changes** in single commits when logical
- **Never commit sensitive information** (Firebase keys, API secrets, etc.)
- **Maintain clean commit history** with atomic, logical changes