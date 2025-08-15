import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'database', 'calculator.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

console.log('🔄 Starting simple migration...');
console.log('📁 Database path:', dbPath);
console.log('📁 Schema path:', schemaPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log('✅ Database opened successfully');
});

// Read schema
const schema = fs.readFileSync(schemaPath, 'utf8');
console.log('📂 Schema file read, length:', schema.length);

// Execute schema
db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error executing schema:', err);
  } else {
    console.log('✅ Schema executed successfully');
  }
  
  // Close database
  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err);
    } else {
      console.log('✅ Database closed');
    }
    process.exit(0);
  });
});