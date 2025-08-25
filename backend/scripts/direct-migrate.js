import { execute, testConnection } from '../config/database.js';

async function createTables() {
  try {
    console.log('🔄 Starting direct database migration...');
    
    // Test connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Cannot connect to database');
      process.exit(1);
    }
    
    console.log('📋 Creating projects table...');
    await execute(`
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
        calculation_data TEXT DEFAULT '{}',
        informacion_proyecto TEXT DEFAULT '{}',
        protocolos_ensayos TEXT DEFAULT '{}',
        calculos_cortocircuito TEXT DEFAULT '{}',
        informe_tecnico TEXT DEFAULT '{}',
        protocolo_count INTEGER DEFAULT 0,
        metadata TEXT DEFAULT '{}',
        calculation_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);
    console.log('✅ Projects table created');
    
    console.log('📋 Creating project_activities table...');
    await execute(`
      CREATE TABLE IF NOT EXISTS project_activities (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Project activities table created');
    
    console.log('📋 Creating indexes...');
    await execute('CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id)');
    await execute('CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at)');
    await execute('CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON project_activities(project_id)');
    await execute('CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON project_activities(created_at)');
    console.log('✅ Indexes created');
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

createTables();