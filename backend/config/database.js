import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path - will be created in the backend directory
const dbPath = path.join(__dirname, '..', 'database', 'calculator.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Enable verbose mode in development
const sqlite = process.env.NODE_ENV === 'development' ? sqlite3.verbose() : sqlite3;

// Initialize SQLite database
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log(`✅ SQLite connected successfully!`);
    console.log(`📁 Database location: ${dbPath}`);
    
    // Configure database for optimal performance
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 1000000');
    db.run('PRAGMA temp_store = memory');
  }
});

// Test database connection
export const testConnection = () => {
  return new Promise((resolve) => {
    db.get('SELECT sqlite_version() as version', (err, row) => {
      if (err) {
        console.error('❌ SQLite connection test failed:', err);
        resolve(false);
      } else {
        console.log(`✅ SQLite version: ${row.version}`);
        resolve(true);
      }
    });
  });
};

// Query helper function (for SELECT queries)
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err.message);
        reject(err);
      } else {
        resolve({ rows: rows || [], rowCount: rows ? rows.length : 0 });
      }
    });
  });
};

// Execute helper function (for INSERT, UPDATE, DELETE)
export const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('Execute error:', err.message);
        reject(err);
      } else {
        resolve({ 
          rowCount: this.changes, 
          insertId: this.lastID,
          changes: this.changes 
        });
      }
    });
  });
};

// Transaction helper
export const transaction = (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          const result = callback();
          db.run('COMMIT', (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
            } else {
              resolve(result);
            }
          });
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  });
};

// Helper function to run multiple statements (for migrations)
export const runMigration = (sqlStatements) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        let completed = 0;
        const total = sqlStatements.length;
        
        if (total === 0) {
          db.run('COMMIT');
          resolve();
          return;
        }
        
        sqlStatements.forEach((statement, index) => {
          if (statement.trim()) {
            db.run(statement, (err) => {
              if (err) {
                console.error(`Error in statement ${index + 1}:`, err.message);
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              
              completed++;
              if (completed === total) {
                db.run('COMMIT', (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve();
                  }
                });
              }
            });
          } else {
            completed++;
            if (completed === total) {
              db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              });
            }
          }
        });
      });
    });
  });
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🔄 Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🔄 Closing database connection...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    }
    process.exit(0);
  });
});

export default db;