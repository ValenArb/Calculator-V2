import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigration, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🔄 Starting database migration...');
  
  // Test connection first
  console.log('🔗 Testing database connection...');
  const isConnected = await testConnection();
  console.log('🔗 Connection test result:', isConnected);
  if (!isConnected) {
    console.error('❌ Cannot connect to database. Please check your configuration.');
    process.exit(1);
  }
  console.log('✅ Database connection verified');

  try {
    console.log('📂 Reading schema file...');
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file read successfully');
    
    // Split schema into individual statements (split by semicolon and newline)
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log('📋 Creating database schema...');
    console.log(`Found ${statements.length} SQL statements to execute`);
    statements.forEach((stmt, index) => {
      console.log(`Statement ${index + 1}: ${stmt.substring(0, 50)}...`);
    });
    
    console.log('🚀 Starting migration execution...');
    await runMigration(statements);
    console.log('✅ Schema created successfully');
    
    // Read and execute seed data if it exists
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, 'utf8');
      const seedStatements = seedData
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('--'));
      
      console.log('🌱 Seeding initial data...');
      await runMigration(seedStatements);
      console.log('✅ Seed data inserted successfully');
    }
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run migrations if script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export default runMigrations;