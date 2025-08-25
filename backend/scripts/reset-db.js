import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetDatabase() {
  try {
    const dbPath = path.join(__dirname, '..', 'database', 'calculator.db');
    
    // Check if database exists
    try {
      await fs.access(dbPath);
      console.log('🗑️ Removing existing database...');
      await fs.unlink(dbPath);
      console.log('✅ Database file deleted successfully');
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ℹ️ No existing database found');
      } else {
        console.log('⚠️ Could not delete database:', error.message);
        console.log('📝 Please stop the backend server first, then run this script again');
        process.exit(1);
      }
    }
    
    console.log('🆕 Database reset complete. Run npm run db:migrate to create fresh tables.');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase();