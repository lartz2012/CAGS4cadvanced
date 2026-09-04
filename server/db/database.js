const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(__dirname, 'market_data.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create the tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS market_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      speciesId TEXT UNIQUE NOT NULL,
      basePrice REAL NOT NULL,
      lowIqr REAL,
      highIqr REAL,
      trend30d TEXT,
      clearedTransactionsCount INTEGER,
      source TEXT,
      lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
      isManualOverride BOOLEAN DEFAULT 0
    )`, (err) => {
      if (err) {
        console.error('Error creating market_prices table', err.message);
      } else {
        console.log('market_prices table ready');
        // Seed some initial data if empty
        seedData();
      }
    });
  }
});

function seedData() {
  db.get("SELECT count(*) as count FROM market_prices", (err, row) => {
    if (err) return;
    if (row.count === 0) {
      console.log('Seeding initial market data...');
      const seedStatement = db.prepare(`INSERT INTO market_prices (speciesId, basePrice, lowIqr, highIqr, trend30d, clearedTransactionsCount, source, isManualOverride) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      
      const seedFilePath = path.resolve(__dirname, 'actual_seed.json');
      if (fs.existsSync(seedFilePath)) {
        try {
          const rawData = fs.readFileSync(seedFilePath, 'utf8');
          const initialData = JSON.parse(rawData);
          
          initialData.forEach(item => {
            seedStatement.run(
              [item.speciesId, item.basePrice, item.lowIqr || 0, item.highIqr || 0, item.trend30d || '+0%', item.clearedTransactionsCount || 0, item.source || 'Manual Seed', item.isManualOverride ? 1 : 0], 
              (err) => {
                if (err) console.error("Seeding error:", err.message);
              }
            );
          });
          console.log(`Seeded ${initialData.length} records from actual_seed.json`);
        } catch (e) {
          console.error('Failed to parse actual_seed.json', e.message);
        }
      } else {
        console.log('No actual_seed.json found. Database left empty for manual Admin entry.');
      }
      seedStatement.finalize();
    }
  });
}

// Helper methods for interacting with DB
const getMarketPrices = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM market_prices", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const updateMarketPrice = (speciesId, priceData, isManual = false) => {
  return new Promise((resolve, reject) => {
    const { basePrice, lowIqr, highIqr, trend30d, clearedTransactionsCount, source } = priceData;
    db.run(
      `INSERT INTO market_prices (speciesId, basePrice, lowIqr, highIqr, trend30d, clearedTransactionsCount, source, isManualOverride, lastUpdated) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(speciesId) DO UPDATE SET 
         basePrice=excluded.basePrice, 
         lowIqr=excluded.lowIqr, 
         highIqr=excluded.highIqr, 
         trend30d=excluded.trend30d, 
         clearedTransactionsCount=excluded.clearedTransactionsCount, 
         source=excluded.source, 
         isManualOverride=excluded.isManualOverride,
         lastUpdated=CURRENT_TIMESTAMP
       WHERE (isManualOverride = 0) OR (excluded.isManualOverride = 1)`,
      [speciesId, basePrice, lowIqr, highIqr, trend30d, clearedTransactionsCount, source, isManual ? 1 : 0],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      }
    );
  });
};

const clearManualOverride = (speciesId) => {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE market_prices SET isManualOverride = 0 WHERE speciesId = ?`, [speciesId], function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
}

module.exports = {
  db,
  getMarketPrices,
  updateMarketPrice,
  clearManualOverride
};
