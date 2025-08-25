import { query } from '../config/database.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check if projects table exists
    const tables = await query(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);
    
    console.log('📊 Available tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Check projects table structure
    if (tables.rows.some(t => t.name === 'projects')) {
      console.log('\n🏗️ Projects table structure:');
      const schema = await query('PRAGMA table_info(projects)');
      schema.rows.forEach(col => {
        console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
  
  process.exit(0);
}

checkDatabase();