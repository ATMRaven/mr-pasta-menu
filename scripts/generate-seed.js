import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function hashPassword(password, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return hash.toString('hex');
}

const menuPath = path.resolve('data/menu.json');
const restaurantPath = path.resolve('data/restaurant.json');
const outputPath = path.resolve('seed.sql');

const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
const restaurantData = JSON.parse(fs.readFileSync(restaurantPath, 'utf8'));

let sql = `-- Seed script for Mr Pasta Menu D1 Database\n\n`;

// 1. Initial Admin User (username: admin, password: pasta2026!)
const defaultSalt = crypto.randomBytes(16).toString('hex');
const defaultHash = hashPassword('pasta2026!', defaultSalt);

sql += `-- 1. Seed Admin\n`;
sql += `INSERT OR REPLACE INTO admins (id, username, password_hash, salt) VALUES (1, 'admin', ${escapeSql(defaultHash)}, ${escapeSql(defaultSalt)});\n\n`;

// 2. Seed Restaurant Data
sql += `-- 2. Seed Restaurant Data\n`;
for (const [key, value] of Object.entries(restaurantData)) {
  const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
  sql += `INSERT OR REPLACE INTO restaurant (key, value) VALUES (${escapeSql(key)}, ${escapeSql(valStr)});\n`;
}
sql += `\n`;

// 3. Seed Menu Items
sql += `-- 3. Seed Menu Items (${menuData.length} dishes)\n`;
menuData.forEach((dish, idx) => {
  const id = dish.id || (idx + 1);
  const category = dish.category || 'pasta';
  const groupName = dish.group || dish.category || 'pasta';
  const nameFr = dish.name || '';
  const nameAr = dish.nameAr || '';
  const descFr = dish.desc || '';
  const descAr = dish.descAr || '';
  const price = Number(dish.price || 0);
  const sizesJson = dish.sizes ? JSON.stringify(dish.sizes) : null;
  const imageUrl = dish.image || 'assets/dish-placeholder.svg';
  const available = dish.available === false ? 0 : 1;
  const sortOrder = idx + 1;

  sql += `INSERT OR REPLACE INTO dishes (id, category, group_name, name_fr, name_ar, desc_fr, desc_ar, price, sizes_json, image_url, available, sort_order) VALUES (${id}, ${escapeSql(category)}, ${escapeSql(groupName)}, ${escapeSql(nameFr)}, ${escapeSql(nameAr)}, ${escapeSql(descFr)}, ${escapeSql(descAr)}, ${price}, ${sizesJson ? escapeSql(sizesJson) : 'NULL'}, ${escapeSql(imageUrl)}, ${available}, ${sortOrder});\n`;
});

fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Successfully generated seed.sql with ${menuData.length} menu items and default admin credentials!`);
