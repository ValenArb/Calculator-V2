import { query } from './config/database.js';

async function checkMigration() {
  try {
    const result = await query('SELECT id, name, protocolo_count, protocolos_ensayos FROM projects WHERE protocolo_count > 0');
    console.log('Projects with migrated protocol data:');
    result.rows.forEach(row => {
      const protocolos = JSON.parse(row.protocolos_ensayos || '{}');
      console.log(`- ${row.id}: ${row.name} (${row.protocolo_count} protocols)`);
      console.log(`  Tableros: ${Object.keys(protocolos).join(', ')}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkMigration();