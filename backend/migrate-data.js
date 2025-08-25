import { execute, query } from './config/database.js';

async function migrateData() {
  try {
    console.log('🔄 Migrating data from calculation_data to separate fields...');
    
    // Get all projects with calculation_data
    const result = await query(`
      SELECT id, calculation_data
      FROM projects 
      WHERE calculation_data != '{}' AND calculation_data IS NOT NULL
    `);
    
    console.log(`Found ${result.rows.length} projects with calculation data to migrate`);
    
    for (const project of result.rows) {
      console.log(`Migrating project ${project.id}...`);
      
      let calculationData = {};
      try {
        calculationData = JSON.parse(project.calculation_data || '{}');
      } catch (e) {
        console.warn(`Failed to parse calculation_data for project ${project.id}:`, e);
        continue;
      }
      
      // Extract data for each document type
      const protocolosEnsayos = calculationData.protocolosPorTablero || {};
      const calculosCortocircuito = calculationData.cortocircuito || {};
      
      // Count protocols for statistics
      const protocoloCount = Object.keys(protocolosEnsayos).length;
      
      // Update project with separated data
      await execute(`
        UPDATE projects 
        SET 
          protocolos_ensayos = ?,
          calculos_cortocircuito = ?,
          protocolo_count = ?,
          calculo_count = ?
        WHERE id = ?
      `, [
        JSON.stringify(protocolosEnsayos),
        JSON.stringify(calculosCortocircuito), 
        protocoloCount,
        protocoloCount > 0 ? 1 : 0,
        project.id
      ]);
      
      console.log(`✅ Migrated project ${project.id}: ${protocoloCount} protocols`);
    }
    
    console.log('✅ Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data migration:', error);
  }
  
  process.exit(0);
}

migrateData();