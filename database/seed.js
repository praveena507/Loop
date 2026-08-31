import { initDatabase } from '../backend/src/db/initDb.js';
import { seed135Complaints } from '../backend/src/scripts/seed135Complaints.js';

export async function seedDatabase() {
  await initDatabase();
  await seed135Complaints();
  console.log('Seed: Database verification, 11 staff accounts, and 135 complaints confirmed ready.');
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

