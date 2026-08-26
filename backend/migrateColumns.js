import { db } from './src/db/initDb.js';

const columns = [
  'confidence',
  'severity',
  'urgency',
  'impact',
  'affectedScope',
  'priorityReason',
  'keyFactors'
];

db.serialize(() => {
  for (const col of columns) {
    db.run(`ALTER TABLE ai_analysis ADD COLUMN ${col} TEXT`, (err) => {
      if (err) {
        console.log(`Notice for column ${col}:`, err.message);
      } else {
        console.log(`Added column ${col} to ai_analysis table.`);
      }
    });
  }
});
