import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('📦 Exporting D1 database to JSON backup...');

try {
  // Query dishes, restaurant, admins, and uploads via wrangler
  const dishesRaw = execSync('npx wrangler d1 execute mr-pasta-db --remote --command="SELECT * FROM dishes" --json', { encoding: 'utf8' });
  const restaurantRaw = execSync('npx wrangler d1 execute mr-pasta-db --remote --command="SELECT * FROM restaurant" --json', { encoding: 'utf8' });
  const uploadsRaw = execSync('npx wrangler d1 execute mr-pasta-db --remote --command="SELECT filename, content_type, hex(data) as data_hex, created_at FROM uploads" --json', { encoding: 'utf8' });

  const dishes = JSON.parse(dishesRaw)[0].results;
  const restaurant = JSON.parse(restaurantRaw)[0].results;
  const uploads = JSON.parse(uploadsRaw)[0].results;

  const backupData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    dishes,
    restaurant,
    uploads
  };

  const outputPath = path.resolve('backup-d1-database.json');
  fs.writeFileSync(outputPath, JSON.stringify(backupData, null, 2), 'utf8');
  console.log(`✅ Successfully saved JSON backup to ${outputPath}`);
} catch (err) {
  console.error('❌ Error generating JSON backup:', err.message);
}
