# Mr Pasta — Menu digital

A rebuilt, mobile-first digital menu for **Mr Pasta, Sétif**. The site is self-contained: all food photography, the restaurant photo, icons, menu data, QR generator, and scanner assets are stored locally.

## What is included

- `index.html` — customer-facing digital menu
- `styles.css` / `app.js` — responsive interface and interactions
- `data/menu.json` — 212 dishes, prices, Arabic names, sizes, and descriptions
- `assets/dishes/` — 212 optimized local WebP images sourced from the restaurant’s published menu
- `srv.html` — optional staff QR scanner and local order list
- `manifest.json` / `sw.js` — installable PWA and offline runtime cache
- `data/image-sources.json` — source URL recorded for every dish image
- `DATA_SOURCES.md` — verification notes

## Run locally

The menu loads JSON with `fetch()`, so serve the folder over HTTP rather than opening `index.html` with `file://`.

```bash
cd mr-pasta-menu
python3 -m http.server 8080
```

Then open:

- Menu: `http://localhost:8080/`
- Staff scanner: `http://localhost:8080/srv.html`

## Deploy

Upload the **contents** of this folder to the final web directory (for example, the directory serving `https://braviox.com/mr-pasta/`). All asset paths are relative and work from a subdirectory.

For production:

1. Use HTTPS. Camera scanning in `srv.html` requires HTTPS outside localhost.
2. Keep the folder structure unchanged.
3. If menu data changes, update `data/menu.json` and increment the cache name in `sw.js`.
4. Test the Google Maps, phone, Instagram, and Facebook links after deployment.

## Updating a menu item

Each entry in `data/menu.json` uses this shape:

```json
{
  "id": 121,
  "name": "Violetta",
  "nameAr": "فيوليتا",
  "category": "pizza-creme",
  "group": "pizza-creme",
  "price": 800,
  "desc": "…",
  "descAr": "…",
  "sizes": [{"name": "L", "price": 800}],
  "image": "assets/dishes/121.webp",
  "available": true
}
```

Set `available` to `false` to hide an item without deleting it.

## QR order workflow

The customer can create a QR summary of the cart. **No order is transmitted automatically.** The staff member scans the QR in `srv.html`; the scanner recalculates every price against the local menu and flags a mismatch. Orders remain only in that browser’s `localStorage`.

This is not a networked POS or kitchen system. A backend would be required for automatic order submission, multi-device synchronization, payments, authentication, and permanent order records.
