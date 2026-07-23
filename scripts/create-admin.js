import crypto from 'crypto';

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log('\n❌ Error: Missing arguments.');
  console.log('Usage: node scripts/create-admin.js <username> <password>');
  console.log('Example: node scripts/create-admin.js manager secret123\n');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = hashPassword(password, salt);
const escapedUsername = username.replace(/'/g, "''");

const sql = `INSERT INTO admins (username, password_hash, salt) VALUES ('${escapedUsername}', '${hash}', '${salt}');`;

console.log(`\n======================================================`);
console.log(`🔑 Generated SQL for Admin User "${username}":`);
console.log(`======================================================\n`);
console.log(sql);
console.log(`\nTo execute on Remote Cloudflare D1 Database, run:`);
console.log(`\nnpx wrangler d1 execute mr-pasta-db --remote --command="${sql.replace(/"/g, '\\"')}"\n`);
console.log(`To execute on Local D1 Database, run:`);
console.log(`\nnpx wrangler d1 execute mr-pasta-db --local --command="${sql.replace(/"/g, '\\"')}"\n`);
