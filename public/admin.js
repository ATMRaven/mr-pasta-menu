(() => {
  'use strict';

  const TOKEN_KEY = 'mrp_admin_token';
  const USER_KEY = 'mrp_admin_user';

  const state = {
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: localStorage.getItem(USER_KEY) || null,
    dishes: [],
    restaurant: {},
    activeTab: 'dishesTab',
    searchQuery: '',
    categoryFilter: 'all',
    editingDishId: null
  };

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

  // DOM Elements
  const els = {
    loginSection: document.getElementById('loginSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    topNav: document.getElementById('topNav'),
    adminUsername: document.getElementById('adminUsername'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    loginError: document.getElementById('loginError'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Stats
    statTotalDishes: document.getElementById('statTotalDishes'),
    statActiveDishes: document.getElementById('statActiveDishes'),
    statDisabledDishes: document.getElementById('statDisabledDishes'),
    
    // Tabs
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // Dishes Table
    dishSearch: document.getElementById('dishSearch'),
    dishCategoryFilter: document.getElementById('dishCategoryFilter'),
    addDishBtn: document.getElementById('addDishBtn'),
    dishesTableBody: document.getElementById('dishesTableBody'),
    
    // Dish Modal
    dishModal: document.getElementById('dishModal'),
    dishModalTitle: document.getElementById('dishModalTitle'),
    closeDishModal: document.getElementById('closeDishModal'),
    cancelDishModal: document.getElementById('cancelDishModal'),
    dishForm: document.getElementById('dishForm'),
    dishId: document.getElementById('dishId'),
    dishCategory: document.getElementById('dishCategory'),
    dishGroup: document.getElementById('dishGroup'),
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
    dishAvailable: document.getElementById('dishAvailable'),
    dishSortOrder: document.getElementById('dishSortOrder'),
    sizesContainer: document.getElementById('sizesContainer'),
    addSizeBtn: document.getElementById('addSizeBtn'),

    // Gallery Modal
    galleryModal: document.getElementById('galleryModal'),
    closeGalleryModal: document.getElementById('closeGalleryModal'),
    cancelGalleryModal: document.getElementById('cancelGalleryModal'),
    galleryGrid: document.getElementById('galleryGrid'),
    galleryUploadBtn: document.getElementById('galleryUploadBtn'),
    
    // Forms
    restaurantForm: document.getElementById('restaurantForm'),
    passwordForm: document.getElementById('passwordForm'),
    passwordError: document.getElementById('passwordError'),
    createUserForm: document.getElementById('createUserForm'),
    newAdminUsername: document.getElementById('newAdminUsername'),
    newAdminPassword: document.getElementById('newAdminPassword'),
    createUserError: document.getElementById('createUserError'),
    createUserSuccess: document.getElementById('createUserSuccess'),
    
    // Backup & Restore
    downloadBackupBtn: document.getElementById('downloadBackupBtn'),
    triggerRestoreBtn: document.getElementById('triggerRestoreBtn'),
    restoreFileInput: document.getElementById('restoreFileInput'),
    restoreStatusText: document.getElementById('restoreStatusText')
  };

  async function downloadBackup() {
    try {
      const res = await apiFetch('/api/admin/backup');
      const blob = await res.blob();
      const filename = `mr-pasta-backup-${new Date().toISOString().slice(0, 10)}.json`;
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert(`Erreur téléchargement sauvegarde: ${err.message}`);
    }
  }

  async function restoreBackup(file) {
    if (!file) return;
    if (!confirm(`⚠️ ATTENTION :\n\nCette action va remplacer TOUTES les données de la base (plats, tarifs, infos du restaurant) par celles du fichier de sauvegarde "${file.name}".\n\nVoulez-vous vraiment effectuer cette restauration d'urgence ?`)) {
      els.restoreFileInput.value = '';
      return;
    }

    els.restoreStatusText.style.display = 'block';
    els.restoreStatusText.textContent = '⏳ Restauration de la base de données en cours…';
    els.restoreStatusText.style.color = 'var(--accent-gold)';

    try {
      const text = await file.text();
      const payload = JSON.parse(text);

      const res = await apiFetch('/api/admin/restore', {
        method: 'POST',
        body: payload
      });

      const data = await res.json();
      if (res.ok) {
        els.restoreStatusText.textContent = `✅ ${data.message}`;
        els.restoreStatusText.style.color = 'var(--accent)';
        await Promise.all([loadDishes(), loadRestaurantInfo()]);
      } else {
        throw new Error(data.error || 'Erreur lors de la restauration');
      }
    } catch (err) {
      els.restoreStatusText.textContent = `❌ ${err.message}`;
      els.restoreStatusText.style.color = 'var(--danger)';
    } finally {
      els.restoreFileInput.value = '';
    }
  }

  async function createAdminUser(e) {
    e.preventDefault();
    els.createUserError.style.display = 'none';
    els.createUserSuccess.style.display = 'none';

    const username = els.newAdminUsername.value.trim();
    const password = els.newAdminPassword.value;

    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        body: { username, password }
      });
      const data = await res.json();
      if (res.ok) {
        els.createUserSuccess.textContent = `✅ Compte administrateur '${username}' créé avec succès !`;
        els.createUserSuccess.style.display = 'block';
        els.createUserForm.reset();
      } else {
        els.createUserError.textContent = data.error || 'Erreur de création de compte';
        els.createUserError.style.display = 'block';
      }
    } catch (err) {
      els.createUserError.textContent = err.message;
      els.createUserError.style.display = 'block';
    }
  }

  // --- Upload & Gallery Functions ---
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
    const response = await fetch(url, options);
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
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');

      state.token = data.token;
      state.user = data.username;
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, data.username);

      initDashboard();
    } catch (err) {
      els.loginError.textContent = err.message;
      els.loginError.style.display = 'block';
    }
  }

  function logout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    els.loginSection.style.display = 'block';
    els.dashboardSection.style.display = 'none';
    els.topNav.style.display = 'none';
  }

  async function checkAuth() {
    if (!state.token) {
      logout();
      return;
    }
    try {
      const res = await apiFetch('/api/admin/me');
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
    els.loginSection.style.display = 'none';
    els.dashboardSection.style.display = 'block';
    els.topNav.style.display = 'flex';
    els.adminUsername.textContent = `👤 ${state.user}`;

    await Promise.all([loadDishes(), loadRestaurantInfo()]);
  }

  // --- Load & Render Dishes ---
  async function loadDishes() {
    try {
      const res = await apiFetch('/api/admin/dishes');
      state.dishes = await res.json();
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
      return;
    }

    els.dishesTableBody.innerHTML = filtered.map(dish => {
      const categoryLabel = CATEGORY_NAMES[dish.category] || dish.category;
      let priceLabel = `${Number(dish.price).toLocaleString('fr-FR')} DA`;
      if (dish.sizes && dish.sizes.length) {
        priceLabel = `Dès ${Math.min(...dish.sizes.map(s => Number(s.price))).toLocaleString('fr-FR')} DA (${dish.sizes.length} tailles)`;
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
    const dish = state.dishes.find(d => d.id === Number(id));
    if (!dish) return;
    if (!confirm(`Voulez-vous vraiment supprimer le plat "${dish.name}" ?`)) return;

    try {
      const res = await apiFetch(`/api/admin/dishes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        state.dishes = state.dishes.filter(d => d.id !== Number(id));
        updateStats();
        renderDishesTable();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // --- Dish Modal (Create & Edit) ---
  function openDishModal(dish = null) {
    state.editingDishId = dish ? dish.id : null;
    els.dishModalTitle.textContent = dish ? `Modifier : ${dish.name}` : 'Ajouter un nouveau Plat';

    els.dishId.value = dish ? dish.id : '';
    els.dishCategory.value = dish ? dish.category : 'pasta';
    els.dishGroup.value = dish ? (dish.group || '') : '';
    els.dishNameFr.value = dish ? dish.name : '';
    els.dishNameAr.value = dish ? (dish.nameAr || '') : '';
    els.dishDescFr.value = dish ? (dish.desc || '') : '';
    els.dishDescAr.value = dish ? (dish.descAr || '') : '';
    els.dishPrice.value = dish ? dish.price : '';
    els.dishImage.value = dish ? (dish.image || '') : '';
    els.dishImagePreview.src = dish ? (dish.image || 'assets/dish-placeholder.svg') : 'assets/dish-placeholder.svg';
    els.uploadStatusText.textContent = dish ? 'Image actuelle' : 'Aperçu de l\'image';
    els.uploadStatusText.style.color = 'var(--text-muted)';
    els.dishAvailable.checked = dish ? dish.available : true;
    els.dishSortOrder.value = dish ? (dish.sortOrder || 1) : (state.dishes.length + 1);

    // Sizes
    els.sizesContainer.innerHTML = '';
    if (dish && dish.sizes && dish.sizes.length) {
      dish.sizes.forEach(size => addSizeRow(size.name, size.price));
    }

    els.dishModal.classList.add('active');
  }

  function closeDishModal() {
    els.dishModal.classList.remove('active');
    state.editingDishId = null;
  }

  function addSizeRow(name = '', price = '') {
    const div = document.createElement('div');
    div.className = 'size-row grid-2';
    div.style.alignItems = 'center';
    div.innerHTML = `
      <input type="text" class="form-control size-name" placeholder="Nom taille (ex. Moyenne)" value="${escapeHtml(name)}">
      <div style="display: flex; gap: 0.5rem;">
        <input type="number" class="form-control size-price" placeholder="Prix (DA)" value="${price}">
        <button type="button" class="btn btn-danger btn-sm remove-size-btn">&times;</button>
      </div>
    `;
    div.querySelector('.remove-size-btn').addEventListener('click', () => div.remove());
    els.sizesContainer.appendChild(div);
  }

  async function saveDish(e) {
    e.preventDefault();

    // Parse sizes
    const sizeRows = els.sizesContainer.querySelectorAll('.size-row');
    const sizes = [];
    sizeRows.forEach(row => {
      const name = row.querySelector('.size-name').value.trim();
      const price = Number(row.querySelector('.size-price').value);
      if (name && !isNaN(price)) {
        sizes.push({ name, price });
      }
    });

    const payload = {
      category: els.dishCategory.value,
      group: els.dishGroup.value.trim() || els.dishCategory.value,
      name: els.dishNameFr.value.trim(),
      nameAr: els.dishNameAr.value.trim(),
      desc: els.dishDescFr.value.trim(),
      descAr: els.dishDescAr.value.trim(),
      price: Number(els.dishPrice.value),
      sizes: sizes.length ? sizes : null,
      image: els.dishImage.value.trim() || 'assets/dish-placeholder.svg',
      available: els.dishAvailable.checked,
      sortOrder: Number(els.dishSortOrder.value) || 999
    };

    try {
      const isEdit = Boolean(state.editingDishId);
      const url = isEdit ? `/api/admin/dishes/${state.editingDishId}` : '/api/admin/dishes';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, { method, body: payload });
      if (res.ok) {
        closeDishModal();
        await loadDishes();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // --- Load & Save Restaurant Info ---
  async function loadRestaurantInfo() {
    try {
      const res = await fetch('/api/restaurant');
      state.restaurant = await res.json();
      
      document.getElementById('restName').value = state.restaurant.name || '';
      document.getElementById('restNameAr').value = state.restaurant.nameAr || '';
      document.getElementById('restTagline').value = state.restaurant.tagline || '';
      document.getElementById('restTaglineAr').value = state.restaurant.taglineAr || '';
      document.getElementById('restPhoneDisplay').value = state.restaurant.phoneDisplay || '';
      document.getElementById('restPhoneInt').value = state.restaurant.phoneInternational || '';
      document.getElementById('restAddress').value = state.restaurant.address || '';
      document.getElementById('restAddressAr').value = state.restaurant.addressAr || '';
      document.getElementById('restOpens').value = state.restaurant.hours?.opens || '11:30';
      document.getElementById('restCloses').value = state.restaurant.hours?.closes || '23:00';
      document.getElementById('restMapsUrl').value = state.restaurant.mapsUrl || '';
      document.getElementById('restInstagram').value = state.restaurant.social?.instagram || '';
      document.getElementById('restFacebook').value = state.restaurant.social?.facebook || '';
    } catch (err) {
      console.error('Erreur chargement restaurant info', err);
    }
  }

  async function saveRestaurantInfo(e) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('restName').value.trim(),
      nameAr: document.getElementById('restNameAr').value.trim(),
      tagline: document.getElementById('restTagline').value.trim(),
      taglineAr: document.getElementById('restTaglineAr').value.trim(),
      phoneDisplay: document.getElementById('restPhoneDisplay').value.trim(),
      phoneInternational: document.getElementById('restPhoneInt').value.trim(),
      address: document.getElementById('restAddress').value.trim(),
      addressAr: document.getElementById('restAddressAr').value.trim(),
      hours: {
        opens: document.getElementById('restOpens').value.trim(),
        closes: document.getElementById('restCloses').value.trim(),
        days: 'Tous les jours',
        daysAr: 'كل أيام الأسبوع'
      },
      mapsUrl: document.getElementById('restMapsUrl').value.trim(),
      social: {
        instagram: document.getElementById('restInstagram').value.trim(),
        facebook: document.getElementById('restFacebook').value.trim()
      }
    };

    try {
      const res = await apiFetch('/api/admin/restaurant', { method: 'PUT', body: payload });
      if (res.ok) {
        alert('Informations du restaurant mises à jour avec succès !');
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  // --- Change Password ---
  async function changePassword(e) {
    e.preventDefault();
    els.passwordError.style.display = 'none';

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

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

    // Table Delegated Events (Toggle & Edit/Delete)
    els.dishesTableBody?.addEventListener('change', e => {
      if (e.target.matches('[data-toggle-id]')) {
        toggleDishAvailability(e.target.dataset.toggleId, e.target.checked);
      }
    });

    els.dishesTableBody?.addEventListener('click', e => {
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

  // --- Init ---
  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    checkAuth();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  });
})();
