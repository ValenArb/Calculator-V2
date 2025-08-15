-- Calculator V2 Database Schema
-- SQLite3 schema for electrical project management

-- Projects table
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-a' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL, -- Firebase Auth UID
    project_type TEXT NOT NULL DEFAULT 'residential',
    status TEXT NOT NULL DEFAULT 'draft',
    client_name TEXT,
    client_email TEXT,
    client_phone TEXT,
    location TEXT,
    calculation_data TEXT DEFAULT '{}', -- JSON as TEXT in SQLite
    metadata TEXT DEFAULT '{}', -- JSON as TEXT in SQLite
    calculation_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    CHECK (project_type IN ('residential', 'commercial', 'industrial')),
    CHECK (status IN ('draft', 'active', 'completed', 'archived', 'cancelled'))
);

-- Project templates table
CREATE TABLE project_templates (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-a' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    name TEXT NOT NULL,
    description TEXT,
    project_type TEXT NOT NULL,
    template_data TEXT NOT NULL DEFAULT '{}', -- JSON as TEXT in SQLite
    is_system_template INTEGER DEFAULT 0, -- BOOLEAN as INTEGER in SQLite
    created_by TEXT, -- Firebase Auth UID
    created_at TEXT DEFAULT (datetime('now')),
    
    CHECK (project_type IN ('residential', 'commercial', 'industrial'))
);

-- Project activity log (for tracking changes)
CREATE TABLE project_activities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-a' || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata TEXT DEFAULT '{}', -- JSON as TEXT in SQLite
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(project_type);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_templates_type ON project_templates(project_type);
CREATE INDEX idx_activities_project_id ON project_activities(project_id);
CREATE INDEX idx_activities_created_at ON project_activities(created_at DESC);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_projects_updated_at 
    AFTER UPDATE ON projects 
    FOR EACH ROW
BEGIN
    UPDATE projects 
    SET updated_at = datetime('now') 
    WHERE id = NEW.id;
END;