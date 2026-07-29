import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  JWT_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'If-None-Match'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  exposeHeaders: ['Content-Type', 'ETag', 'Content-Disposition'],
  maxAge: 86400
}));

// Pretty URL aliases (/admin -> admin.html, /srv -> srv.html)
app.get('/admin', async (c) => {
  return c.env.ASSETS.fetch(new Request(new URL('/admin.html', c.req.url)));
});

app.get('/srv', async (c) => {
  return c.env.ASSETS.fetch(new Request(new URL('/srv.html', c.req.url)));
});

const DEFAULT_JWT_SECRET = 'mr-pasta-jwt-secret-key-2026';

function getJwtSecret(env: Env): string {
  return env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

// --- Web Crypto Auth Helpers ---
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const passKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    passKey,
    256
  );
  return Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function createToken(payload: object, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64Header = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const b64Payload = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 * 7 })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const unsignedToken = `${b64Header}.${b64Payload}`;
  
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(unsignedToken));
  const b64Sig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${unsignedToken}.${b64Sig}`;
}

async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [b64Header, b64Payload, b64Sig] = parts;
    const unsignedToken = `${b64Header}.${b64Payload}`;
    
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const sigStr = atob(b64Sig.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBuf = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) sigBuf[i] = sigStr.charCodeAt(i);
    
    const valid = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(unsignedToken));
    if (!valid) return null;
    
    const payload = JSON.parse(atob(b64Payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Auth Middleware for Admin Routes
async function adminAuthMiddleware(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const payload = await verifyToken(token, getJwtSecret(c.env));
  if (!payload || !payload.sub) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  c.set('adminUser', payload);
  await next();
}

// Helper to format DB dish row to API dish format
function formatDishRow(row: any) {
  let sizes = null;
  if (row.sizes_json) {
    try {
      sizes = JSON.parse(row.sizes_json);
    } catch (_) { sizes = null; }
  }
  return {
    id: Number(row.id),
    category: row.category,
    group: row.group_name,
    name: row.name_fr,
    nameAr: row.name_ar || '',
    desc: row.desc_fr || '',
    descAr: row.desc_ar || '',
    price: Number(row.price),
    sizes: sizes,
    image: row.image_url,
    available: Boolean(row.available),
    sortOrder: Number(row.sort_order || 0),
    isPopular: Boolean(row.is_popular || row.isPopular)
  };
}

// --- Clean URL Routes ---
app.get('/admin', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/admin.html';
  return (c.env as any).ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

app.get('/srv', async (c) => {
  const url = new URL(c.req.url);
  url.pathname = '/srv.html';
  return (c.env as any).ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

app.get('/index', (c) => c.redirect('/', 301));

// Helper to trigger live update version bump
async function touchDatabaseVersion(db: D1Database) {
  try {
    await db.prepare(
      "INSERT OR REPLACE INTO restaurant (key, value) VALUES ('last_updated', ?)"
    ).bind(String(Date.now())).run();
  } catch (_) {}
}

// GET /api/menu/version (Returns timestamp version for real-time live sync with ETag support)
app.get('/api/menu/version', async (c) => {
  const row = await c.env.DB.prepare(
    "SELECT value FROM restaurant WHERE key = 'last_updated'"
  ).first<any>();
  const version = row?.value || '1';

  const ifNoneMatch = c.req.header('If-None-Match');
  if (ifNoneMatch === `"${version}"`) {
    return c.body(null, 304, {
      'ETag': `"${version}"`,
      'Cache-Control': 'no-cache'
    });
  }

  return c.json({ version }, 200, {
    'ETag': `"${version}"`,
    'Cache-Control': 'no-cache'
  });
});

// GET /api/menu (Public Menu Data)
app.get('/api/menu', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM dishes WHERE available = 1 ORDER BY id DESC'
  ).all();
  
  const menu = (results || []).map(formatDishRow);
  return c.json(menu);
});

// GET /api/restaurant (Public Restaurant Data)
app.get('/api/restaurant', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT key, value FROM restaurant').all();
  
  const restaurantObj: Record<string, any> = {};
  for (const row of (results || [])) {
    try {
      restaurantObj[row.key as string] = JSON.parse(row.value as string);
    } catch (_) {
      const val = row.value as string;
      if (val === 'true') restaurantObj[row.key as string] = true;
      else if (val === 'false') restaurantObj[row.key as string] = false;
      else if (!isNaN(Number(val)) && val.trim() !== '') restaurantObj[row.key as string] = Number(val);
      else restaurantObj[row.key as string] = val;
    }
  }
  return c.json(restaurantObj);
});

// --- Admin Authentication Endpoints ---

// POST /api/admin/login (Supports single password or username+password)
app.post('/api/admin/login', async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}));
  
  if (!password) {
    return c.json({ error: 'Mot de passe requis' }, 400);
  }

  const { results: admins } = await c.env.DB.prepare('SELECT * FROM admins').all<any>();
  if (!admins || !admins.length) {
    return c.json({ error: 'Accès administrateur non configuré' }, 500);
  }

  if (username && String(username).trim()) {
    const cleanUsername = String(username).trim();
    const user = admins.find(a => a.username === cleanUsername);
    if (!user) return c.json({ error: 'Mot de passe incorrect' }, 401);

    const computedHash = await hashPassword(password, user.salt);
    if (computedHash !== user.password_hash) {
      return c.json({ error: 'Mot de passe incorrect' }, 401);
    }
    const token = await createToken({ sub: user.id, username: user.username }, getJwtSecret(c.env));
    return c.json({ success: true, token, username: user.username });
  }

  // Single-password login mode
  for (const user of admins) {
    const computedHash = await hashPassword(password, user.salt);
    if (computedHash === user.password_hash) {
      const token = await createToken({ sub: user.id, username: user.username }, getJwtSecret(c.env));
      return c.json({ success: true, token, username: user.username });
    }
  }
  
  return c.json({ error: 'Mot de passe incorrect' }, 401);
});

// GET /api/admin/me
app.get('/api/admin/me', adminAuthMiddleware, async (c) => {
  const user = c.get('adminUser');
  return c.json({ success: true, user });
});

// POST /api/admin/change-password
app.post('/api/admin/change-password', adminAuthMiddleware, async (c) => {
  const adminUser = c.get('adminUser');
  const { oldPassword, newPassword } = await c.req.json().catch(() => ({}));
  
  if (!oldPassword || !newPassword || String(newPassword).length < 6) {
    return c.json({ error: 'New password must be at least 6 characters long' }, 400);
  }
  
  const user = await c.env.DB.prepare('SELECT * FROM admins WHERE id = ?').bind(adminUser.sub).first<any>();
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  const computedOldHash = await hashPassword(oldPassword, user.salt);
  if (computedOldHash !== user.password_hash) {
    return c.json({ error: 'Incorrect current password' }, 400);
  }
  
  const newSalt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const newHash = await hashPassword(newPassword, newSalt);
  
  await c.env.DB.prepare(
    'UPDATE admins SET password_hash = ?, salt = ? WHERE id = ?'
  ).bind(newHash, newSalt, user.id).run();
  
  return c.json({ success: true, message: 'Password updated successfully' });
});

// POST /api/admin/users (Create new admin user)
app.post('/api/admin/users', adminAuthMiddleware, async (c) => {
  const { username, password } = await c.req.json().catch(() => ({}));
  
  if (!username || !password || String(username).trim().length < 3 || String(password).length < 6) {
    return c.json({ error: 'Username (min 3 chars) and password (min 6 chars) are required' }, 400);
  }
  
  const cleanUsername = String(username).trim().toLowerCase();
  
  const existing = await c.env.DB.prepare('SELECT id FROM admins WHERE username = ?').bind(cleanUsername).first();
  if (existing) {
    return c.json({ error: 'An admin user with this username already exists' }, 400);
  }
  
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const passwordHash = await hashPassword(password, salt);
  
  await c.env.DB.prepare(
    'INSERT INTO admins (username, password_hash, salt) VALUES (?, ?, ?)'
  ).bind(cleanUsername, passwordHash, salt).run();
  
  return c.json({ success: true, message: `Admin user '${cleanUsername}' created successfully` });
});

// GET /api/admin/backup (Download full database backup)
app.get('/api/admin/backup', adminAuthMiddleware, async (c) => {
  const [dishesRes, restRes, uploadsRes] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM dishes').all(),
    c.env.DB.prepare('SELECT * FROM restaurant').all(),
    c.env.DB.prepare('SELECT filename, content_type, created_at FROM uploads').all()
  ]);

  const backupData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    dishes: dishesRes.results || [],
    restaurant: restRes.results || [],
    uploads: uploadsRes.results || []
  };

  const filename = `mr-pasta-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return c.json(backupData, 200, {
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="${filename}"`
  });
});

// POST /api/admin/restore (Restore database from backup JSON)
app.post('/api/admin/restore', adminAuthMiddleware, async (c) => {
  try {
    const payload = await c.req.json().catch(() => null);
    if (!payload || !Array.isArray(payload.dishes) || !Array.isArray(payload.restaurant)) {
      return c.json({ error: 'Fichier de sauvegarde invalide (structure JSON manquante ou corrompue)' }, 400);
    }

    // 1. Clear existing dishes and restaurant data
    await c.env.DB.batch([
      c.env.DB.prepare('DELETE FROM dishes'),
      c.env.DB.prepare('DELETE FROM restaurant')
    ]);

    // 2. Restore Dishes
    for (const dish of payload.dishes) {
      await c.env.DB.prepare(
        `INSERT INTO dishes (id, category, group_name, name_fr, name_ar, desc_fr, desc_ar, price, sizes_json, image_url, available, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        dish.id,
        dish.category,
        dish.group_name || dish.category,
        dish.name_fr || dish.name || '',
        dish.name_ar || dish.nameAr || '',
        dish.desc_fr || dish.desc || '',
        dish.desc_ar || dish.descAr || '',
        Number(dish.price || 0),
        dish.sizes_json || (dish.sizes ? JSON.stringify(dish.sizes) : null),
        dish.image_url || dish.image || 'assets/dish-placeholder.svg',
        dish.available === false || dish.available === 0 ? 0 : 1,
        Number(dish.sort_order || dish.sortOrder || 1)
      ).run();
    }

    // 3. Restore Restaurant Info
    for (const item of payload.restaurant) {
      await c.env.DB.prepare(
        'INSERT INTO restaurant (key, value) VALUES (?, ?)'
      ).bind(item.key, item.value).run();
    }

    await touchDatabaseVersion(c.env.DB);
    return c.json({ success: true, message: `Base de données restaurée avec succès (${payload.dishes.length} plats restaurés)` });
  } catch (err: any) {
    return c.json({ error: err.message || 'Erreur lors de la restauration de la base de données' }, 500);
  }
});

// --- Admin Protected CRUD Endpoints ---

// GET /api/admin/dishes (Returns ALL dishes including hidden/sold-out)
app.get('/api/admin/dishes', adminAuthMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM dishes ORDER BY id DESC'
  ).all();
  
  return c.json((results || []).map(formatDishRow));
});

// POST /api/admin/dishes (Create new dish)
app.post('/api/admin/dishes', adminAuthMiddleware, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { category, group, name, nameAr, desc, descAr, price, sizes, image, available, sortOrder, isPopular } = body;
  
  if (!category || !name || price === undefined) {
    return c.json({ error: 'Category, name (French), and base price are required' }, 400);
  }
  
  const groupName = group || category;
  const sizesJson = sizes && Array.isArray(sizes) && sizes.length ? JSON.stringify(sizes) : null;
  const isAvailable = available === false ? 0 : 1;
  const order = Number(sortOrder) || 0;
  const imageUrl = image || 'assets/dish-placeholder.svg';
  const popularVal = isPopular ? 1 : 0;
  
  let res;
  try {
    res = await c.env.DB.prepare(
      `INSERT INTO dishes (category, group_name, name_fr, name_ar, desc_fr, desc_ar, price, sizes_json, image_url, available, sort_order, is_popular, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(category, groupName, name, nameAr || '', desc || '', descAr || '', Number(price), sizesJson, imageUrl, isAvailable, order, popularVal).run();
  } catch (_) {
    res = await c.env.DB.prepare(
      `INSERT INTO dishes (category, group_name, name_fr, name_ar, desc_fr, desc_ar, price, sizes_json, image_url, available, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(category, groupName, name, nameAr || '', desc || '', descAr || '', Number(price), sizesJson, imageUrl, isAvailable, order).run();
  }
  
  const insertedId = res.meta.last_row_id;
  const newDish = await c.env.DB.prepare('SELECT * FROM dishes WHERE id = ?').bind(insertedId).first();
  await touchDatabaseVersion(c.env.DB);
  
  return c.json({ success: true, dish: formatDishRow(newDish) });
});

// PUT /api/admin/dishes/:id (Update existing dish)
app.put('/api/admin/dishes/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  const { category, group, name, nameAr, desc, descAr, price, sizes, image, available, sortOrder, isPopular } = body;
  
  const existing: any = await c.env.DB.prepare('SELECT * FROM dishes WHERE id = ?').bind(id).first();
  if (!existing) {
    return c.json({ error: 'Dish not found' }, 404);
  }
  
  const sizesJson = sizes && Array.isArray(sizes) && sizes.length ? JSON.stringify(sizes) : null;
  const isAvailable = available === false ? 0 : 1;
  const groupName = group || category || existing.group_name;
  const popularVal = isPopular !== undefined ? (isPopular ? 1 : 0) : (existing.is_popular || 0);
  
  try {
    await c.env.DB.prepare(
      `UPDATE dishes SET
        category = ?, group_name = ?, name_fr = ?, name_ar = ?, desc_fr = ?, desc_ar = ?,
        price = ?, sizes_json = ?, image_url = ?, available = ?, sort_order = ?, is_popular = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(
      category || existing.category,
      groupName,
      name || existing.name_fr,
      nameAr !== undefined ? nameAr : existing.name_ar,
      desc !== undefined ? desc : existing.desc_fr,
      descAr !== undefined ? descAr : existing.desc_ar,
      price !== undefined ? Number(price) : existing.price,
      sizesJson,
      image || existing.image_url,
      isAvailable,
      sortOrder !== undefined ? Number(sortOrder) : existing.sort_order,
      popularVal,
      id
    ).run();
  } catch (_) {
    await c.env.DB.prepare(
      `UPDATE dishes SET
        category = ?, group_name = ?, name_fr = ?, name_ar = ?, desc_fr = ?, desc_ar = ?,
        price = ?, sizes_json = ?, image_url = ?, available = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(
      category || existing.category,
      groupName,
      name || existing.name_fr,
      nameAr !== undefined ? nameAr : existing.name_ar,
      desc !== undefined ? desc : existing.desc_fr,
      descAr !== undefined ? descAr : existing.desc_ar,
      price !== undefined ? Number(price) : existing.price,
      sizesJson,
      image || existing.image_url,
      isAvailable,
      sortOrder !== undefined ? Number(sortOrder) : existing.sort_order,
      id
    ).run();
  }
  
  const updatedDish = await c.env.DB.prepare('SELECT * FROM dishes WHERE id = ?').bind(id).first();
  await touchDatabaseVersion(c.env.DB);
  return c.json({ success: true, dish: formatDishRow(updatedDish) });
});

// PATCH /api/admin/dishes/:id/toggle (Quick toggle available state)
app.patch('/api/admin/dishes/:id/toggle', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT available FROM dishes WHERE id = ?').bind(id).first<any>();
  
  if (!existing) {
    return c.json({ error: 'Dish not found' }, 404);
  }
  
  const newAvailable = existing.available ? 0 : 1;
  await c.env.DB.prepare(
    'UPDATE dishes SET available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
  ).bind(newAvailable, id).run();
  
  await touchDatabaseVersion(c.env.DB);
  return c.json({ success: true, available: Boolean(newAvailable) });
});

// DELETE /api/admin/dishes/:id (Delete dish)
app.delete('/api/admin/dishes/:id', adminAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const res = await c.env.DB.prepare('DELETE FROM dishes WHERE id = ?').bind(id).run();
  if (res.meta.changes === 0) {
    return c.json({ error: 'Dish not found' }, 404);
  }
  await touchDatabaseVersion(c.env.DB);
  return c.json({ success: true, message: 'Dish deleted successfully' });
});

// PUT /api/admin/restaurant (Update restaurant info)
app.put('/api/admin/restaurant', adminAuthMiddleware, async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  for (const [key, value] of Object.entries(body)) {
    const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO restaurant (key, value) VALUES (?, ?)'
    ).bind(key, valStr).run();
  }
  
  await touchDatabaseVersion(c.env.DB);
  return c.json({ success: true, message: 'Restaurant details updated successfully' });
});

// --- Image Upload & Storage Endpoints ---

// POST /api/admin/upload (Upload image file to D1)
app.post('/api/admin/upload', adminAuthMiddleware, async (c) => {
  try {
    const formData = await c.req.parseBody();
    const file = formData['file'];
    if (!file || typeof file === 'string') {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    if (bytes.length > 5 * 1024 * 1024) {
      return c.json({ error: 'File size exceeds 5MB limit' }, 400);
    }
    
    const ext = (file.name.split('.').pop() || 'webp').toLowerCase();
    const sanitizeExt = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) ? ext : 'webp';
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${sanitizeExt}`;
    const contentType = file.type || `image/${sanitizeExt}`;
    
    await c.env.DB.prepare(
      'INSERT INTO uploads (filename, content_type, data) VALUES (?, ?, ?)'
    ).bind(filename, contentType, bytes).run();
    
    const url = `/api/uploads/${filename}`;
    return c.json({ success: true, url, filename });
  } catch (err: any) {
    return c.json({ error: err.message || 'Upload failed' }, 500);
  }
});

// GET /api/admin/uploads (List all uploaded images for gallery browser)
app.get('/api/admin/uploads', adminAuthMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT filename, content_type, created_at FROM uploads ORDER BY id DESC'
  ).all();
  
  const uploads = (results || []).map((r: any) => ({
    filename: r.filename,
    url: `/api/uploads/${r.filename}`,
    created_at: r.created_at
  }));
  return c.json(uploads);
});

// GET /api/uploads/:filename (Serve uploaded image)
app.get('/api/uploads/:filename', async (c) => {
  const filename = c.req.param('filename');
  const row = await c.env.DB.prepare(
    'SELECT content_type, data FROM uploads WHERE filename = ?'
  ).bind(filename).first<any>();
  
  if (!row || !row.data) {
    return c.text('Image not found', 404);
  }
  
  const bytes = row.data instanceof Uint8Array ? row.data : new Uint8Array(row.data);
  return c.body(bytes, 200, {
    'Content-Type': row.content_type || 'image/webp',
    'Cache-Control': 'public, max-age=31536000, immutable'
  });
});

export default app;
