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

## Development Server Management

**CRITICAL: Always Keep Development Server Running**

- **ALWAYS start the development server** when working on this project: `npm run dev`
- **Keep the server running in background** throughout the entire work session
- **Restart the server** after making significant changes to:
  - Package.json dependencies
  - Vite configuration
  - Environment variables
  - Build configuration files
  - Major structural changes

**Server Management Commands:**
```bash
npm run dev                    # Start development server (ALWAYS run this first)
# Keep terminal open and server running
# Use a separate terminal for other commands

# If server needs restart:
Ctrl+C                        # Stop current server
npm run dev                   # Start server again
```

**Important Notes:**
- Development server runs on `http://localhost:3000`
- Server provides hot reloading for immediate feedback
- Never commit changes without testing on running development server
- If application doesn't load, first check if server is running

## Architecture Overview

This is a streamlined electrical engineering calculator application focused on providing comprehensive calculation tools with user management.

### Current Architecture (Post-Cleanup)

**State Management**: Simplified Redux Toolkit setup:
- `authSlice`: User authentication (Firebase Auth integration)
- Clean, minimal state management ready for future expansion

**Feature-Based Organization**: 
- `src/features/auth/`: Authentication components, hooks, and services
- `src/components/calculator/`: 60+ individual calculator components
- `src/components/error-codes/`: Error code management system
- `src/components/ui/`: Reusable UI components
- `src/pages/`: Main application pages (Dashboard, Login, Calculator)

**Key Architectural Patterns**:
- **Component-Based Architecture**: Modular, reusable calculator components
- **Clean State Management**: Minimal Redux store focusing on authentication
- **Firebase Integration**: User auth and error codes only (projects removed for rebuild)
- **Session-Based Calculations**: Frontend-only calculations without backend dependency

### Data Flow Architecture (Current)

1. **User Input**: Calculator interfaces with form inputs
2. **Frontend Calculations**: Client-side calculation logic within components
3. **Session Storage**: Calculations exist only during user session
4. **Authentication Flow**: Firebase Auth for user management
5. **Error Codes**: Firebase Firestore for admin error code management

### Firebase Integration (Simplified)

**Authentication**: Firebase Auth with Google SSO and email/password
**Database**: Firestore for error codes and user admin management only
**Security Rules**: Simplified rules for error codes collection

**Current Firestore Collections**:
```
errorCodes/{errorId}
├── code: string
├── description: string
├── category: string
├── createdAt: timestamp
└── updatedAt: timestamp

admins/{userId}
├── email: string
├── role: string
└── permissions: array
```

## Electrical Engineering Context

This application implements professional electrical calculations following IEC and IEEE standards:

**DPMS (Determinación de Potencia Máxima Simultánea)**: Calculates demand loads with proper diversity factors for different building types and load categories (TUG, IUG, ATE, ACU, TUE, OCE).

**Load Calculations**: Handles single-phase (220V), three-phase (380V line-to-line), and split-phase systems with accurate current calculations.

**Thermal Analysis**: Conductor capacity verification with temperature derating, installation method factors, and grouping corrections per IEC 60364-5-52.

**Voltage Drop**: Exact calculations (not approximations) considering both resistive and reactive components, with standards-compliant limits.

**Short Circuit**: IEC 60909 methodology with X/R ratio considerations for peak current calculations.

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