import { query } from './config/database.js';

async function checkSchema() {
  try {
    const result = await query('PRAGMA table_info(projects)');
    console.log('Current projects table structure:');
    result.rows.forEach((col, i) => {
      console.log(`${i+1}. ${col.name} (${col.type}) - ${col.notnull ? 'NOT NULL' : 'NULL'} - Default: ${col.dflt_value || 'none'}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkSchema();