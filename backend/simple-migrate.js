import { execute } from './config/database.js';

async function migrate() {
  try {
    console.log('Adding new columns to projects table...');
    
    const alterations = [
      "ALTER TABLE projects ADD COLUMN work_number TEXT",
      "ALTER TABLE projects ADD COLUMN company TEXT", 
      "ALTER TABLE projects ADD COLUMN informacion_proyecto TEXT DEFAULT '{}'",
      "ALTER TABLE projects ADD COLUMN protocolos_ensayos TEXT DEFAULT '{}'",
      "ALTER TABLE projects ADD COLUMN calculos_cortocircuito TEXT DEFAULT '{}'",
      "ALTER TABLE projects ADD COLUMN informe_tecnico TEXT DEFAULT '{}'",
      "ALTER TABLE projects ADD COLUMN protocolo_count INTEGER DEFAULT 0",
      "ALTER TABLE projects ADD COLUMN calculo_count INTEGER DEFAULT 0"
    ];
    
    for (const sql of alterations) {
      try {
        await execute(sql);
        console.log('✅', sql.substring(0, 50) + '...');
      } catch (error) {
        if (error.message.includes('duplicate column')) {
          console.log('⚠️  Column already exists:', sql.substring(0, 50) + '...');
        } else {
          throw error;
        }
      }
    }
    
    console.log('✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  process.exit(0);
}

migrate();