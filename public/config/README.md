# Configuration Files

This directory contains JSON configuration files for the Calculadora Eléctrica V2 application.

## Files

### `app-config.json` (Required)
Main configuration file loaded by the application. Copy from one of the template files below:

```json
{
  "backend": {
    "baseUrl": "http://localhost:3001",
    "apiPath": "/api"
  },
  "app": {
    "name": "Calculadora Eléctrica V2",
    "version": "2.0.0",
    "environment": "development"
  }
}
```

### `app-config.production.json` (Template)
Template for production environment. Contains example production URLs.

## Configuration Options

### Backend Configuration
- `backend.baseUrl`: Base URL of the backend server (without /api path)
- `backend.apiPath`: API path suffix (usually "/api")

### App Configuration
- `app.name`: Application display name
- `app.version`: Application version
- `app.environment`: Environment type (development/production)

## Usage

1. **Development**: Use the default `app-config.json` with localhost URLs
2. **Production**: Copy `app-config.production.json` to `app-config.json` and update URLs
3. **Custom**: Create your own configuration based on your setup

## Environment Setup

### For Development
```json
{
  "backend": {
    "baseUrl": "http://localhost:3001",
    "apiPath": "/api"
  }
}
```

### For Production
```json
{
  "backend": {
    "baseUrl": "https://your-production-server.com",
    "apiPath": "/api"
  }
}
```

### For Different Ports
```json
{
  "backend": {
    "baseUrl": "http://localhost:8080",
    "apiPath": "/api"
  }
}
```

## Fallback Behavior

If the configuration file cannot be loaded, the application will fall back to:
- Environment variable `VITE_API_URL` if available
- Default: `http://localhost:3001/api`

## Notes

- Configuration is loaded once at application startup
- Changes require page refresh to take effect
- The file must be valid JSON format
- All URLs should not end with trailing slashes