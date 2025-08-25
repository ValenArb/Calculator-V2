#!/usr/bin/env node

// Migration script to add separate document fields to projects table
import { execute, query } from '../config/database.js';

const migrationSteps = [
  // Add new document-specific columns
  {
    description: 'Add informacion_proyecto column',
    sql: `ALTER TABLE projects ADD COLUMN informacion_proyecto TEXT DEFAULT '{}'`
  },
  {
    description: 'Add protocolos_ensayos column', 
    sql: `ALTER TABLE projects ADD COLUMN protocolos_ensayos TEXT DEFAULT '{}'`
  },
  {
    description: 'Add calculos_cortocircuito column',
    sql: `ALTER TABLE projects ADD COLUMN calculos_cortocircuito TEXT DEFAULT '{}'`
  },
  {
    description: 'Add informe_tecnico column',
    sql: `ALTER TABLE projects ADD COLUMN informe_tecnico TEXT DEFAULT '{}'`
  },
  {
    description: 'Add work_number column',
    sql: `ALTER TABLE projects ADD COLUMN work_number TEXT`
  },
  {
    description: 'Add company column',
    sql: `ALTER TABLE projects ADD COLUMN company TEXT`
  },
  {
    description: 'Add protocolo_count column',
    sql: `ALTER TABLE projects ADD COLUMN protocolo_count INTEGER DEFAULT 0`
  },
  {
    description: 'Add calculo_count column',
    sql: `ALTER TABLE projects ADD COLUMN calculo_count INTEGER DEFAULT 0`
  }
];

async function migrateData() {
  console.log('🔄 Starting data migration from calculation_data to separate fields...');
  
  try {
    // Get all projects with calculation_data
    const result = await query(`
      SELECT id, calculation_data, calculation_count
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
        protocoloCount > 0 ? 1 : 0, // For now, count any project with protocols as having calculations
        project.id
      ]);
      
      console.log(`✅ Migrated project ${project.id}: ${protocoloCount} protocols`);
    }
    
    console.log('✅ Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data migration:', error);
    throw error;
  }
}

async function runMigration() {
  console.log('🚀 Starting database migration to V2...');
  console.log('⚠️  This will add new columns to the projects table');
  
  try {
    // Execute each migration step
    for (let i = 0; i < migrationSteps.length; i++) {
      const step = migrationSteps[i];
      console.log(`${i + 1}/${migrationSteps.length} ${step.description}...`);
      
      try {
        await execute(step.sql);
        console.log('✅ Success');
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log('⚠️  Column already exists, skipping');
        } else {
          throw error;
        }
      }
    }
    
    console.log('📊 Database schema migration completed!');
    
    // Migrate existing data
    await migrateData();
    
    console.log('🎉 Migration to V2 completed successfully!');
    console.log('');
    console.log('New database structure:');
    console.log('  - informacion_proyecto: Project basic information');
    console.log('  - protocolos_ensayos: FAT test protocols');
    console.log('  - calculos_cortocircuito: Short circuit calculations');  
    console.log('  - informe_tecnico: Technical reports');
    console.log('  - protocolo_count: Number of protocols');
    console.log('  - calculo_count: Number of calculations');
    console.log('');
    console.log('✨ Ready to use the new document-specific fields!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runMigration, migrateData };