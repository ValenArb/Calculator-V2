-- Calculator V2 Database Schema V2
-- SQLite3 database with separate fields for each document type

-- Projects table with separate document fields
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id TEXT NOT NULL,
  project_type TEXT DEFAULT 'residential',
  status TEXT DEFAULT 'draft',
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  location TEXT,
  work_number TEXT,
  company TEXT,
  
  -- Separate document fields (JSON)
  informacion_proyecto TEXT DEFAULT '{}',
  protocolos_ensayos TEXT DEFAULT '{}',
  calculos_cortocircuito TEXT DEFAULT '{}',
  informe_tecnico TEXT DEFAULT '{}',
  
  -- Document counts for statistics
  protocolo_count INTEGER DEFAULT 0,
  calculo_count INTEGER DEFAULT 0,
  
  -- Legacy field (to be removed after migration)
  calculation_data TEXT DEFAULT '{}',
  
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Project activities table (unchanged)
CREATE TABLE IF NOT EXISTS project_activities (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON project_activities(created_at);