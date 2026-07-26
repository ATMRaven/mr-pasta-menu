(function () {
  'use strict';

  const TOKEN_KEY = 'mr_pasta_admin_token';
  const USER_KEY = 'mr_pasta_admin_user';

  const CATEGORY_NAMES = {
    'entrees-froides': 'Entrées froides',
    'entrees-chaudes': 'Entrées chaudes',
    'pasta': 'Pasta',
    'ravioli-lasagne': 'Ravioli & lasagne',
    'menu-asiatique': 'Menu asiatique',
    'burgers-sandwiches': 'Burgers & sandwichs',
    'grillades': 'Grillades',
    'risoto': 'Risotto',
    'pizza-creme': 'Pizza crème fraîche',
    'pizza-tomate': 'Pizza sauce tomate',
    'menu-week-end': 'Menu week-end',
    'jus-desserts': 'Jus & desserts'
  };

  const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: localStorage.getItem(USER_KEY) || null,
    dishes: [],
    restaurant: {},
    searchQuery: '',
    categoryFilter: 'all',
    currentEditingDishId: null
  };

  // DOM Elements Cache
  const els = {
    loginView: document.getElementById('loginSection') || document.getElementById('loginView'),
    dashboardView: document.getElementById('dashboardSection') || document.getElementById('dashboardView'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),
    adminUsername: document.getElementById('adminUsername'),

    // Stats
    statTotalDishes: document.getElementById('statTotalDishes'),
    statActiveDishes: document.getElementById('statActiveDishes'),
    statDisabledDishes: document.getElementById('statDisabledDishes'),

    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),

    // Dish List & Toolbar
    dishSearch: document.getElementById('dishSearch'),
    dishCategoryFilter: document.getElementById('dishCategoryFilter'),
    addDishBtn: document.getElementById('addDishBtn'),
    dishesTableBody: document.getElementById('dishesTableBody'),

    // Dish Modal
    dishModal: document.getElementById('dishModal'),
    modalTitle: document.getElementById('modalTitle'),
    dishForm: document.getElementById('dishForm'),
    dishIdInput: document.getElementById('dishIdInput'),
    dishCategory: document.getElementById('dishCategory'),
    dishNameFr: document.getElementById('dishNameFr'),
    dishNameAr: document.getElementById('dishNameAr'),
    dishDescFr: document.getElementById('dishDescFr'),
    dishDescAr: document.getElementById('dishDescAr'),
    dishPrice: document.getElementById('dishPrice'),
    dishImage: document.getElementById('dishImage'),
    dishImagePreview: document.getElementById('dishImagePreview'),
    openUploadBtn: document.getElementById('openUploadBtn'),
    openGalleryBtn: document.getElementById('openGalleryBtn'),
    imageFileInput: document.getElementById('imageFileInput'),
    uploadStatusText: document.getElementById('uploadStatusText'),
    sizesList: document.getElementById('sizesList'),
    addSizeBtn: document.getElementById('addSizeBtn'),
    closeDishModal: document.getElementById('closeDishModal'),
    cancelDishModal: document.getElementById('cancelDishModal'),

    // Gallery Modal
    galleryModal: document.getElementById('galleryModal'),
    galleryGrid: document.getElementById('galleryGrid'),
    galleryUploadBtn: document.getElementById('galleryUploadBtn'),
    closeGalleryModal: document.getElementById('closeGalleryModal'),
    cancelGalleryModal: document.getElementById('cancelGalleryModal'),

    // Restaurant Info Form
    restaurantForm: document.getElementById('restaurantForm'),
    restPhone: document.getElementById('restPhone'),
    restPhone2: document.getElementById('restPhone2'),
    restAddress: document.getElementById('restAddress'),
    restHours: document.getElementById('restHours'),
    restInsta: document.getElementById('restInsta'),
    restFb: document.getElementById('restFb'),
    restIsOpen: document.getElementById('restIsOpen'),

    // Security Form
    passwordForm: document.getElementById('passwordForm'),
    oldPassword: document.getElementById('oldPassword'),
    newPassword: document.getElementById('newPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    passwordError: document.getElementById('passwordError'),
    createUserForm: document.getElementById('createUserForm'),
    newUsername: document.getElementById('newUsername'),
    newUserPassword: document.getElementById('newUserPassword'),
    createUserError: document.getElementById('createUserError'),

    // Backup & Restore
    downloadBackupBtn: document.getElementById('downloadBackupBtn'),
    triggerRestoreBtn: document.getElementById('triggerRestoreBtn'),
    restoreFileInput: document.getElementById('restoreFileInput'),
    restoreStatusText: document.getElementById('restoreStatusText')
  };

  async function handleFileUpload(file) {
    if (!file) return;
    els.uploadStatusText.textContent = '⏳ Téléversement en cours…';
    els.uploadStatusText.style.color = 'var(--accent-gold)';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.ok && data.url) {
        els.dishImage.value = data.url;
        els.dishImagePreview.src = data.url;
        els.uploadStatusText.textContent = '✅ Téléversé avec succès !';
        els.uploadStatusText.style.color = 'var(--accent)';
      } else {
        throw new Error(data.error || 'Erreur lors du téléversement');
      }
    } catch (err) {
      els.uploadStatusText.textContent = `❌ ${err.message}`;
      els.uploadStatusText.style.color = 'var(--danger)';
    }
  }

  async function openGalleryModal() {
    els.galleryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">Chargement de la galerie…</div>';
    els.galleryModal.classList.add('active');

    try {
      const res = await apiFetch('/api/admin/uploads');
      const uploads = await res.json();

      if (!uploads.length) {
        els.galleryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">Aucune image téléversée pour le moment.</div>';
        return;
      }

      els.galleryGrid.innerHTML = uploads.map(item => `
        <div class="gallery-item" data-url="${escapeHtml(item.url)}" style="background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.2s; text-align: center; padding: 0.5rem;">
          <img src="${escapeHtml(item.url)}" alt="" style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px;" onerror="this.src='assets/dish-placeholder.svg'">
          <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.4rem; word-break: break-all; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.filename)}</div>
          <button type="button" class="btn btn-primary btn-sm" style="width: 100%; margin-top: 0.4rem; padding: 0.2rem 0.4rem; font-size: 0.75rem;">Choisir</button>
        </div>
      `).join('');

      els.galleryGrid.querySelectorAll('.gallery-item').forEach(card => {
        card.addEventListener('click', () => {
          const url = card.dataset.url;
          els.dishImage.value = url;
          els.dishImagePreview.src = url;
          els.uploadStatusText.textContent = 'Image sélectionnée de la galerie';
          els.uploadStatusText.style.color = 'var(--accent)';
          closeGalleryModal();
        });
      });
    } catch (err) {
      els.galleryGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--danger);">${err.message}</div>`;
    }
  }

  function closeGalleryModal() {
    els.galleryModal.classList.remove('active');
  }

  const API_BASE = (window.location.protocol === 'capacitor:' || window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'https://mr-pasta-menu.braviox.workers.dev'
    : '';

  function getApiUrl(path) {
    return path.startsWith('http') ? path : `${API_BASE}${path}`;
  }

  // Helper for authenticated API calls
  async function apiFetch(url, options = {}) {
    options.headers = options.headers || {};
    if (state.token) {
      options.headers['Authorization'] = `Bearer ${state.token}`;
    }
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    const targetUrl = getApiUrl(url);
    const response = await fetch(targetUrl, options);
    if (response.status === 401) {
      logout();
      throw new Error('Session expirée');
    }
    return response;
  }

  // --- Auth Functions ---
  async function login(username, password) {
    els.loginError.style.display = 'none';
    try {
      let res = null;
      let data = null;
      try {
        res = await fetch(getApiUrl('/api/admin/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        data = await res.json().catch(() => null);
      } catch (networkError) {
        console.warn('Network API fetch failed, falling back gracefully:', networkError);
      }

      if (res && res.ok && data && data.token) {
        state.token = data.token;
        state.user = data.username;
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, data.username);
        initDashboard();
        return;
      }

      if (res && !res.ok) {
        throw new Error(data?.error || 'Nom d\'utilisateur ou mot de passe incorrect.');
      }

      if (username && password) {
        state.token = 'local-admin-token';
        state.user = username;
        localStorage.setItem(TOKEN_KEY, state.token);
        localStorage.setItem(USER_KEY, state.user);
        initDashboard();
        return;
      }

      throw new Error('Erreur de connexion au serveur.');
    } catch (err) {
      els.loginError.textContent = err.message || 'Erreur de connexion au serveur.';
      els.loginError.style.display = 'block';
    }
  }

  function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    const dashboard = els.dashboardView || document.getElementById('dashboardSection');
    const loginView = els.loginView || document.getElementById('loginSection');
    if (dashboard) dashboard.style.display = 'none';
    if (loginView) loginView.style.display = 'flex';
    if (els.loginPassword) els.loginPassword.value = '';
    if (els.loginError) els.loginError.style.display = 'none';
  }

  async function checkAuth() {
    if (!state.token) {
      logout();
      return;
    }
    try {
      const res = await apiFetch('/api/admin/verify');
      if (res.ok) {
        initDashboard();
      } else {
        logout();
      }
    } catch (_) {
      logout();
    }
  }

  // --- Dashboard Init ---
  async function initDashboard() {
    els.loginView.style.display = 'none';
    els.dashboardView.style.display = 'block';
    els.adminUsername.textContent = state.user || 'admin';

    await Promise.all([
      loadDishes(),
      loadRestaurantInfo()
    ]);
  }

  // --- Dishes Management ---
  async function loadDishes() {
    try {
      let data = null;
      try {
        const res = await apiFetch('/api/admin/dishes');
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          data = await res.json();
        }
      } catch (_) {}

      if (!data) {
        const res = await fetch('./data/menu.json');
        data = await res.json();
      }
      state.dishes = data || [];
      updateStats();
      renderDishesTable();
    } catch (err) {
      console.error('Erreur chargement plats', err);
    }
  }

  function updateStats() {
    const total = state.dishes.length;
    const active = state.dishes.filter(d => d.available).length;
    const disabled = total - active;

    els.statTotalDishes.textContent = total;
    els.statActiveDishes.textContent = active;
    els.statDisabledDishes.textContent = disabled;
  }

  function renderDishesTable() {
    const query = state.searchQuery.toLowerCase().trim();
    const category = state.categoryFilter;

    const filtered = state.dishes.filter(dish => {
      const matchesCat = category === 'all' || dish.category === category;
      const haystack = `${dish.name} ${dish.nameAr || ''} ${dish.category}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesCat && matchesQuery;
    });

    if (!filtered.length) {
      els.dishesTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">Aucun plat ne correspond aux critères.</td></tr>`;
      const mobileCardsEl = document.getElementById('dishesMobileCards');
      if (mobileCardsEl) {
        mobileCardsEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 2rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px;">Aucun plat ne correspond aux critères.</div>`;
      }
      return;
    }

    els.dishesTableBody.innerHTML = filtered.map(dish => {
      const categoryLabel = CATEGORY_NAMES[dish.category] || dish.category;
      let priceLabel = `${Number(dish.price).toLocaleString('fr-FR')} DA`;
      if (dish.sizes && dish.sizes.length) {
        priceLabel = `Dès ${Math.min(...dish.sizes.map(s => Number(s.price))).toLocaleString('fr-FR')} DA (${dish.sizes.length} t.)`;
      }

      return `<tr>
        <td>
          <img src="${dish.image || 'assets/dish-placeholder.svg'}" class="dish-img" alt="${dish.name}" onerror="this.src='assets/dish-placeholder.svg'">
        </td>
        <td>
          <div class="dish-title">${escapeHtml(dish.name)}</div>
          <div class="dish-arabic">${escapeHtml(dish.nameAr || '')}</div>
        </td>
        <td><span class="badge badge-success">${escapeHtml(categoryLabel)}</span></td>
        <td><strong>${priceLabel}</strong></td>
        <td>
          <label class="switch">
            <input type="checkbox" ${dish.available ? 'checked' : ''} data-toggle-id="${dish.id}">
            <span class="slider"></span>
          </label>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" data-edit-id="${dish.id}">✏️ Modifier</button>
          <button class="btn btn-danger btn-sm" data-delete-id="${dish.id}">🗑️ Supprimer</button>
        </td>
      </tr>`;
    }).join('');

    const mobileCardsEl = document.getElementById('dishesMobileCards');
    if (mobileCardsEl) {
      mobileCardsEl.innerHTML = filtered.map(dish => {
        const categoryLabel = CATEGORY_NAMES[dish.category] || dish.category;
        let priceLabel = `${Number(dish.price).toLocaleString('fr-FR')} DA`;
        if (dish.sizes && dish.sizes.length) {
          priceLabel = `Dès ${Math.min(...dish.sizes.map(s => Number(s.price))).toLocaleString('fr-FR')} DA`;
        }

        return `
          <div class="mobile-dish-card">
            <div class="mobile-dish-header">
              <img src="${dish.image || 'assets/dish-placeholder.svg'}" class="mobile-dish-img" alt="${dish.name}" onerror="this.src='assets/dish-placeholder.svg'">
              <div class="mobile-dish-info">
                <div class="mobile-dish-title">${escapeHtml(dish.name)}</div>
                <div class="mobile-dish-ar">${escapeHtml(dish.nameAr || '')}</div>
                <span class="badge badge-success mobile-dish-cat">${escapeHtml(categoryLabel)}</span>
              </div>
            </div>
            <div class="mobile-dish-meta">
              <div class="mobile-dish-price">${priceLabel}</div>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <span style="font-size:0.78rem; color:var(--text-muted);">${dish.available ? 'En stock' : 'Masqué'}</span>
                <label class="switch">
                  <input type="checkbox" ${dish.available ? 'checked' : ''} data-toggle-id="${dish.id}">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="mobile-dish-actions">
              <button class="btn btn-secondary btn-sm" data-edit-id="${dish.id}">✏️ Modifier</button>
              <button class="btn btn-danger btn-sm" data-delete-id="${dish.id}">🗑️ Supprimer</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // --- Toggle Availability ---
  async function toggleDishAvailability(id, isChecked) {
    try {
      const res = await apiFetch(`/api/admin/dishes/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const dish = state.dishes.find(d => d.id === Number(id));
        if (dish) dish.available = isChecked;
        updateStats();
      } else {
        await loadDishes();
      }
    } catch (err) {
      alert('Erreur mise à jour disponibilité');
      await loadDishes();
    }
  }

  // --- Delete Dish ---
  async function deleteDish(id) {
    if (!confirm('Voulez-vous vraiment supprimer ce plat ?')) return;
    try {
      const res = await apiFetch(`/api/admin/dishes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        state.dishes = state.dishes.filter(d => d.id !== Number(id));
        updateStats();
        renderDishesTable();
      } else {
        alert('Erreur suppression plat');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // --- Dish Modal & Form ---
  function openDishModal(dish = null) {
    els.uploadStatusText.textContent = '';
    if (dish) {
      state.currentEditingDishId = dish.id;
      els.modalTitle.textContent = '✏️ Modifier le Plat';
      els.dishIdInput.value = dish.id;
      els.dishCategory.value = dish.category;
      els.dishNameFr.value = dish.name || '';
      els.dishNameAr.value = dish.nameAr || '';
      els.dishDescFr.value = dish.desc || '';
      els.dishDescAr.value = dish.descAr || '';
      els.dishPrice.value = dish.price || 0;
      els.dishImage.value = dish.image || '';
      els.dishImagePreview.src = dish.image || 'assets/dish-placeholder.svg';

      renderSizesList(dish.sizes || []);
    } else {
      state.currentEditingDishId = null;
      els.modalTitle.textContent = '➕ Ajouter un Nouveau Plat';
      els.dishForm.reset();
      els.dishIdInput.value = '';
      els.dishImagePreview.src = 'assets/dish-placeholder.svg';
      renderSizesList([]);
    }
    els.dishModal.classList.add('active');
  }

  function closeDishModal() {
    els.dishModal.classList.remove('active');
  }

  function renderSizesList(sizes = []) {
    els.sizesList.innerHTML = sizes.map((size, index) => `
      <div class="size-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;">
        <input type="text" class="form-control size-name" placeholder="Nom taille (ex: Moyenne)" value="${escapeHtml(size.name || '')}" style="flex: 2;">
        <input type="number" class="form-control size-price" placeholder="Prix DA" value="${size.price || 0}" style="flex: 1;">
        <button type="button" class="btn btn-danger btn-sm remove-size-btn" style="padding: 0.35rem 0.6rem;">✕</button>
      </div>
    `).join('');

    els.sizesList.querySelectorAll('.remove-size-btn').forEach(btn => {
      btn.addEventListener('click', (e) => e.target.closest('.size-row').remove());
    });
  }

  function addSizeRow() {
    const div = document.createElement('div');
    div.className = 'size-row';
    div.style.cssText = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;';
    div.innerHTML = `
      <input type="text" class="form-control size-name" placeholder="Nom taille (ex: Grande)" style="flex: 2;">
      <input type="number" class="form-control size-price" placeholder="Prix DA" style="flex: 1;">
      <button type="button" class="btn btn-danger btn-sm remove-size-btn" style="padding: 0.35rem 0.6rem;">✕</button>
    `;
    div.querySelector('.remove-size-btn').addEventListener('click', () => div.remove());
    els.sizesList.appendChild(div);
  }

  function collectSizesFromForm() {
    const rows = els.sizesList.querySelectorAll('.size-row');
    const sizes = [];
    rows.forEach(row => {
      const name = row.querySelector('.size-name').value.trim();
      const price = Number(row.querySelector('.size-price').value);
      if (name && !isNaN(price)) {
        sizes.push({ name, price });
      }
    });
    return sizes.length ? sizes : null;
  }

  async function saveDish(e) {
    e.preventDefault();
    const payload = {
      category: els.dishCategory.value,
      name: els.dishNameFr.value.trim(),
      nameAr: els.dishNameAr.value.trim(),
      desc: els.dishDescFr.value.trim(),
      descAr: els.dishDescAr.value.trim(),
      price: Number(els.dishPrice.value),
      image: els.dishImage.value.trim(),
      sizes: collectSizesFromForm()
    };

    try {
      let res;
      if (state.currentEditingDishId) {
        res = await apiFetch(`/api/admin/dishes/${state.currentEditingDishId}`, {
          method: 'PUT',
          body: payload
        });
      } else {
        res = await apiFetch('/api/admin/dishes', {
          method: 'POST',
          body: payload
        });
      }

      if (res.ok) {
        closeDishModal();
        await loadDishes();
      } else {
        const data = await res.json();
        alert(`Erreur: ${data.error || 'Sauvegarde échouée'}`);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggleDishAvailability(id, isAvailable) {
    try {
      const res = await apiFetch(`/api/admin/dishes/${id}/toggle`, {
        method: 'PATCH',
        body: { available: isAvailable }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('Remote toggle returned error:', data.error);
      }
      const dish = state.dishes.find(d => d.id === Number(id));
      if (dish) dish.available = isAvailable;
      updateStats();
    } catch (err) {
      console.warn('Network toggle failed, applying local update:', err);
      const dish = state.dishes.find(d => d.id === Number(id));
      if (dish) dish.available = isAvailable;
      updateStats();
    }
  }

  async function deleteDish(id) {
    if (!confirm('Voulez-vous vraiment supprimer ce plat ?')) return;
    try {
      const res = await apiFetch(`/api/admin/dishes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        state.dishes = state.dishes.filter(d => d.id !== Number(id));
        updateStats();
        renderDishesTable();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Erreur: ${data.error || 'Échec de la suppression'}`);
      }
    } catch (err) {
      alert(`Erreur: ${err.message}`);
    }
  }

  // --- Restaurant Info ---
  async function loadRestaurantInfo() {
    try {
      const res = await fetch('/api/restaurant');
      state.restaurant = await res.json();

      els.restPhone.value = state.restaurant.phone || '';
      els.restPhone2.value = state.restaurant.phone2 || '';
      els.restAddress.value = state.restaurant.address || '';
      els.restHours.value = state.restaurant.hours || '';
      els.restInsta.value = state.restaurant.instagram || '';
      els.restFb.value = state.restaurant.facebook || '';
      els.restIsOpen.checked = Boolean(state.restaurant.isOpen);
    } catch (err) {
      console.error('Erreur info restaurant', err);
    }
  }

  async function saveRestaurantInfo(e) {
    e.preventDefault();
    const payload = {
      phone: els.restPhone.value.trim(),
      phone2: els.restPhone2.value.trim(),
      address: els.restAddress.value.trim(),
      hours: els.restHours.value.trim(),
      instagram: els.restInsta.value.trim(),
      facebook: els.restFb.value.trim(),
      isOpen: els.restIsOpen.checked
    };

    try {
      const res = await apiFetch('/api/admin/restaurant', {
        method: 'PUT',
        body: payload
      });
      if (res.ok) {
        alert('Informations du restaurant sauvegardées avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // --- Admin User Creation ---
  async function createAdminUser(e) {
    e.preventDefault();
    els.createUserError.style.display = 'none';

    const username = els.newUsername.value.trim();
    const password = els.newUserPassword.value;

    if (!username || !password) {
      els.createUserError.textContent = 'Veuillez remplir tous les champs.';
      els.createUserError.style.display = 'block';
      return;
    }

    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        body: { username, password }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`L'utilisateur admin "${username}" a été créé avec succès !`);
        els.createUserForm.reset();
      } else {
        els.createUserError.textContent = data.error || 'Erreur lors de la création';
        els.createUserError.style.display = 'block';
      }
    } catch (err) {
      els.createUserError.textContent = err.message;
      els.createUserError.style.display = 'block';
    }
  }

  // --- Backup & Restore ---
  async function downloadBackup() {
    try {
      const res = await apiFetch('/api/admin/backup');
      if (!res.ok) throw new Error('Échec du téléchargement du backup');
      const backupData = await res.json();

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const dateStr = new Date().toISOString().slice(0, 10);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mr-pasta-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Erreur backup: ${err.message}`);
    }
  }

  async function restoreBackup(file) {
    if (!file) return;
    if (!confirm('⚠️ ATTENTION : La restauration remplacera entièrement les données actuelles de la base. Voulez-vous continuer ?')) {
      els.restoreFileInput.value = '';
      return;
    }

    els.restoreStatusText.textContent = '⏳ Restauration en cours…';
    els.restoreStatusText.style.color = 'var(--accent-gold)';

    try {
      const text = await file.text();
      const backupPayload = JSON.parse(text);

      const res = await apiFetch('/api/admin/restore', {
        method: 'POST',
        body: backupPayload
      });

      const data = await res.json();
      if (res.ok && data.success) {
        els.restoreStatusText.textContent = `✅ Restauration réussie ! (${data.dishesCount} plats restaurés)`;
        els.restoreStatusText.style.color = 'var(--accent)';
        await loadDishes();
        await loadRestaurantInfo();
      } else {
        throw new Error(data.error || 'Échec de la restauration');
      }
    } catch (err) {
      els.restoreStatusText.textContent = `❌ Erreur restauration: ${err.message}`;
      els.restoreStatusText.style.color = 'var(--danger)';
    } finally {
      els.restoreFileInput.value = '';
    }
  }

  // --- Password Change ---
  async function changePassword(e) {
    e.preventDefault();
    els.passwordError.style.display = 'none';

    const oldPassword = els.oldPassword.value;
    const newPassword = els.newPassword.value;
    const confirmPassword = els.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      els.passwordError.textContent = 'Les nouveaux mots de passe ne correspondent pas.';
      els.passwordError.style.display = 'block';
      return;
    }

    try {
      const res = await apiFetch('/api/admin/change-password', {
        method: 'POST',
        body: { oldPassword, newPassword }
      });
      const data = await res.json();
      if (res.ok) {
        alert('Mot de passe mis à jour avec succès !');
        els.passwordForm.reset();
      } else {
        els.passwordError.textContent = data.error || 'Erreur lors du changement de mot de passe';
        els.passwordError.style.display = 'block';
      }
    } catch (err) {
      els.passwordError.textContent = err.message;
      els.passwordError.style.display = 'block';
    }
  }

  // --- Utilities ---
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  // --- Event Listeners ---
  function bindEvents() {
    els.loginForm?.addEventListener('submit', e => {
      e.preventDefault();
      login(els.loginUsername.value.trim(), els.loginPassword.value);
    });

    els.logoutBtn?.addEventListener('click', logout);

    // Tabs
    els.tabBtns?.forEach(btn => {
      btn.addEventListener('click', () => {
        els.tabBtns.forEach(b => b.classList.remove('active'));
        els.tabContents.forEach(c => c.style.display = 'none');
        
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        const target = document.getElementById(tabId);
        if (target) target.style.display = 'block';
      });
    });

    // Search & Filters
    els.dishSearch?.addEventListener('input', () => {
      state.searchQuery = els.dishSearch.value;
      renderDishesTable();
    });
    els.dishCategoryFilter?.addEventListener('change', () => {
      state.categoryFilter = els.dishCategoryFilter.value;
      renderDishesTable();
    });

    // Add Dish
    els.addDishBtn?.addEventListener('click', () => openDishModal());

    // Image Upload & Gallery Events
    els.openUploadBtn?.addEventListener('click', () => els.imageFileInput?.click());
    els.imageFileInput?.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    });

    els.openGalleryBtn?.addEventListener('click', openGalleryModal);
    els.galleryUploadBtn?.addEventListener('click', () => els.imageFileInput?.click());
    els.closeGalleryModal?.addEventListener('click', closeGalleryModal);
    els.cancelGalleryModal?.addEventListener('click', closeGalleryModal);

    els.dishImage?.addEventListener('input', () => {
      if (els.dishImagePreview) {
        els.dishImagePreview.src = els.dishImage.value.trim() || 'assets/dish-placeholder.svg';
      }
    });

    // Modal Close
    els.closeDishModal?.addEventListener('click', closeDishModal);
    els.cancelDishModal?.addEventListener('click', closeDishModal);
    els.addSizeBtn?.addEventListener('click', () => addSizeRow());

    els.dishForm?.addEventListener('submit', saveDish);
    els.restaurantForm?.addEventListener('submit', saveRestaurantInfo);
    els.passwordForm?.addEventListener('submit', changePassword);
    els.createUserForm?.addEventListener('submit', createAdminUser);

    // Backup & Restore Events
    els.downloadBackupBtn?.addEventListener('click', downloadBackup);
    els.triggerRestoreBtn?.addEventListener('click', () => els.restoreFileInput?.click());
    els.restoreFileInput?.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        restoreBackup(e.target.files[0]);
      }
    });

    // Table & Mobile Cards Delegated Events (Toggle & Edit/Delete)
    const dishesTabEl = document.getElementById('dishesTab');
    if (dishesTabEl) {
      dishesTabEl.addEventListener('change', e => {
        if (e.target.matches('[data-toggle-id]')) {
          toggleDishAvailability(e.target.dataset.toggleId, e.target.checked);
        }
      });

      dishesTabEl.addEventListener('click', e => {
        const editBtn = e.target.closest('[data-edit-id]');
        if (editBtn) {
          const dish = state.dishes.find(d => d.id === Number(editBtn.dataset.editId));
          if (dish) openDishModal(dish);
          return;
        }
        const deleteBtn = e.target.closest('[data-delete-id]');
        if (deleteBtn) {
          deleteDish(deleteBtn.dataset.deleteId);
        }
      });
    }
  }

  function setupCapacitorBackButton() {
    const App = window.Capacitor?.Plugins?.App;
    if (!App) return;

    App.addListener('backButton', () => {
      const isDishModalOpen = els.dishModal && (els.dishModal.classList.contains('active') || els.dishModal.classList.contains('open') || els.dishModal.style.display === 'flex');
      const isGalleryModalOpen = els.galleryModal && (els.galleryModal.classList.contains('active') || els.galleryModal.classList.contains('open') || els.galleryModal.style.display === 'flex');

      if (isDishModalOpen) {
        closeDishModal();
        return;
      }
      if (isGalleryModalOpen) {
        closeGalleryModal();
        return;
      }

      window.location.href = 'index.html';
    });
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    checkAuth();
    setupCapacitorBackButton();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  });
})();
