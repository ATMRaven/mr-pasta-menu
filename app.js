(() => {
  'use strict';

  const CATEGORIES = [
    'entrees-froides', 'entrees-chaudes', 'pasta', 'ravioli-lasagne',
    'menu-asiatique', 'burgers-sandwiches', 'grillades', 'risoto',
    'pizza-creme', 'pizza-tomate', 'menu-week-end', 'jus-desserts'
  ];

  const copy = {
    fr: {
      eyebrow: 'Bienvenue chez Mr Pasta', heroTitle: 'L’Italie au cœur de Sétif.',
      heroText: 'Pasta, pizzas artisanales, grillades et douceurs — découvrez les 212 créations de notre carte.',
      viewMenu: 'Voir le menu', directions: 'Itinéraire', hoursLabel: 'Horaires', addressShort: 'Avenue du 1er Novembre',
      dishes: 'plats', menuOfficial: 'Menu officiel', ourMenu: 'Notre carte', chooseDish: 'Qu’est-ce qui vous ferait plaisir ?',
      search: 'Rechercher un plat, un ingrédient…', reset: 'Réinitialiser', noResultsTitle: 'Aucun plat trouvé',
      noResultsText: 'Essayez un autre mot ou affichez toute la carte.', seeAll: 'Voir tout le menu', footerTagline: 'Restaurant de gastronomie italienne à Sétif.',
      visitUs: 'Nous trouver', contact: 'Contact', openingHours: 'Horaires', everyDay: 'Tous les jours',
      pricesNotice: 'Prix en dinars algériens • Photos du menu officiel', yourOrder: 'Votre commande',
      practicalInfo: 'Informations pratiques', address: 'Adresse', phone: 'Téléphone',
      dataNote: 'Informations vérifiées à partir de la fiche Google Maps et des pages officielles de Mr Pasta.',
      summary: 'Récapitulatif', emptyCart: 'Votre panier est vide', emptyCartText: 'Ajoutez les plats qui vous font envie.',
      tableNumber: 'Numéro de table (optionnel)', total: 'Total', createQr: 'Créer le QR de commande',
      qrHelp: 'Présentez ensuite le code au serveur. Aucune commande n’est envoyée automatiquement.',
      clearCart: 'Vider la commande', chooseSize: 'Choisissez la taille', price: 'Prix', add: 'Ajouter',
      qrReady: 'Votre QR est prêt', showServer: 'Présentez ce code au serveur pour transmettre votre sélection.',
      downloadQr: 'Enregistrer le QR', backToMenu: 'Retour au menu', all: 'Tout', startingAt: 'Dès',
      resultOne: 'plat', resultMany: 'plats', added: 'Ajouté à votre commande', cleared: 'Commande vidée',
      cartUpdated: 'Commande mise à jour', open: 'Ouvert maintenant', closed: 'Fermé • ouvre à 11:30',
      selectSize: 'Sélectionnez une taille', qrError: 'Impossible de créer le QR sur cet appareil.',
      categories: {
        'entrees-froides': 'Entrées froides', 'entrees-chaudes': 'Entrées chaudes', pasta: 'Pasta',
        'ravioli-lasagne': 'Ravioli & lasagne', 'menu-asiatique': 'Menu asiatique',
        'burgers-sandwiches': 'Burgers & sandwichs', grillades: 'Grillades', risoto: 'Risotto',
        'pizza-creme': 'Pizza crème fraîche', 'pizza-tomate': 'Pizza sauce tomate',
        'menu-week-end': 'Menu week-end', 'jus-desserts': 'Jus & desserts'
      },
      groups: {
        'pasta-rouge': 'Sauce rouge', 'pasta-blanche': 'Sauce blanche', supplements: 'Suppléments',
        'asian-salades': 'Salades', 'asian-noodles': 'Nouilles', 'asian-sushi': 'Sushi', burgers: 'Burgers',
        roulets: 'Roulets', calzones: 'Calzone pizza', panozzo: 'Panozzo', 'club-sandwiches': 'Club sandwich',
        'tacos-roulets': 'Tacos & roulets', 'grill-poulet': 'Poulet', 'grill-boeuf': 'Bœuf',
        'pizza-creme': 'Pizzas crème fraîche', 'pizza-tomate': 'Pizzas sauce tomate',
        'weekend-paella': 'Paella', 'weekend-autres': 'Spécialités du week-end', boissons: 'Boissons fraîches',
        crepes: 'Crêpes, gaufres & pancakes', desserts: 'Desserts', cafes: 'Cafés & boissons chaudes'
      }
    },
    ar: {
      eyebrow: 'مرحباً بكم في مستر باسطا', heroTitle: 'إيطاليا في قلب سطيف.',
      heroText: 'باستا، بيتزا حرفية، مشاوي وحلويات — اكتشفوا 212 طبقاً في قائمتنا.',
      viewMenu: 'عرض القائمة', directions: 'الاتجاهات', hoursLabel: 'ساعات العمل', addressShort: 'شارع أول نوفمبر',
      dishes: 'طبق', menuOfficial: 'القائمة الرسمية', ourMenu: 'قائمتنا', chooseDish: 'ماذا تشتهي اليوم؟',
      search: 'ابحث عن طبق أو مكوّن…', reset: 'إعادة الضبط', noResultsTitle: 'لم نعثر على أي طبق',
      noResultsText: 'جرّب كلمة أخرى أو اعرض القائمة كاملة.', seeAll: 'عرض كل القائمة', footerTagline: 'مطعم متخصص في المأكولات الإيطالية بسطيف.',
      visitUs: 'موقعنا', contact: 'اتصل بنا', openingHours: 'ساعات العمل', everyDay: 'كل أيام الأسبوع',
      pricesNotice: 'الأسعار بالدينار الجزائري • صور من القائمة الرسمية', yourOrder: 'طلبك',
      practicalInfo: 'معلومات عملية', address: 'العنوان', phone: 'الهاتف',
      dataNote: 'تم التحقق من المعلومات عبر خرائط Google والصفحات الرسمية لمطعم مستر باسطا.',
      summary: 'ملخص الطلب', emptyCart: 'سلة الطلب فارغة', emptyCartText: 'أضف الأطباق التي ترغب بها.',
      tableNumber: 'رقم الطاولة (اختياري)', total: 'المجموع', createQr: 'إنشاء رمز QR للطلب',
      qrHelp: 'اعرض الرمز على النادل. لا يتم إرسال الطلب تلقائياً.', clearCart: 'إفراغ الطلب',
      chooseSize: 'اختر الحجم', price: 'السعر', add: 'أضف', qrReady: 'رمز الطلب جاهز',
      showServer: 'اعرض هذا الرمز على النادل لإرسال اختياراتك.', downloadQr: 'حفظ الرمز', backToMenu: 'العودة إلى القائمة',
      all: 'الكل', startingAt: 'ابتداءً من', resultOne: 'طبق', resultMany: 'أطباق', added: 'تمت الإضافة إلى طلبك',
      cleared: 'تم إفراغ الطلب', cartUpdated: 'تم تحديث الطلب', open: 'مفتوح الآن', closed: 'مغلق • يفتح 11:30',
      selectSize: 'اختر الحجم أولاً', qrError: 'تعذّر إنشاء رمز QR على هذا الجهاز.',
      categories: {
        'entrees-froides': 'مقبلات باردة', 'entrees-chaudes': 'مقبلات ساخنة', pasta: 'باستا',
        'ravioli-lasagne': 'رافيولي ولازانيا', 'menu-asiatique': 'القائمة الآسيوية',
        'burgers-sandwiches': 'برغر وساندويتش', grillades: 'مشاوي', risoto: 'ريزوتو',
        'pizza-creme': 'بيتزا بالكريمة', 'pizza-tomate': 'بيتزا بصلصة الطماطم',
        'menu-week-end': 'قائمة نهاية الأسبوع', 'jus-desserts': 'عصائر وحلويات'
      },
      groups: {
        'pasta-rouge': 'صلصة حمراء', 'pasta-blanche': 'صلصة بيضاء', supplements: 'إضافات',
        'asian-salades': 'سلطات', 'asian-noodles': 'نودلز', 'asian-sushi': 'سوشي', burgers: 'برغر',
        roulets: 'رول', calzones: 'كالزون بيتزا', panozzo: 'بانوزو', 'club-sandwiches': 'كلوب ساندويتش',
        'tacos-roulets': 'تاكوس ورول', 'grill-poulet': 'دجاج', 'grill-boeuf': 'لحم بقري',
        'pizza-creme': 'بيتزا بالكريمة الطازجة', 'pizza-tomate': 'بيتزا بصلصة الطماطم',
        'weekend-paella': 'بايلا', 'weekend-autres': 'أطباق نهاية الأسبوع', boissons: 'مشروبات باردة',
        crepes: 'كريب ووافل وبانكيك', desserts: 'حلويات', cafes: 'قهوة ومشروبات ساخنة'
      }
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const money = value => `${Number(value || 0).toLocaleString('fr-FR')} DA`;
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;

  const state = {
    menu: [], restaurant: null, map: new Map(), lang: localStorage.getItem('mrp-lang') === 'ar' ? 'ar' : 'fr',
    category: 'all', query: '', cart: loadCart(), selectedItem: null, selectedSize: null, currentLayer: null,
    restoreFocus: null
  };

  const els = {};

  function loadCart() {
    try {
      const cart = JSON.parse(localStorage.getItem('mrp-cart') || '[]');
      return Array.isArray(cart) ? cart.filter(row => row && Number.isInteger(row.id) && row.quantity > 0) : [];
    } catch (_) { return []; }
  }

  function saveCart() {
    localStorage.setItem('mrp-cart', JSON.stringify(state.cart));
  }

  function getText(item, key) {
    if (state.lang === 'ar') {
      if (key === 'name') return item.nameAr || item.name;
      if (key === 'desc') return item.descAr || item.desc || '';
    }
    return item[key] || '';
  }

  function categoryLabel(key) { return copy[state.lang].categories[key] || key; }
  function groupLabel(key) { return copy[state.lang].groups[key] || categoryLabel(key); }
  function basePrice(item) { return item.sizes?.length ? Math.min(...item.sizes.map(size => Number(size.price))) : Number(item.price); }
  function priceLabel(item) { return item.sizes?.length ? `${copy[state.lang].startingAt} ${money(basePrice(item))}` : money(item.price); }

  function applyLanguage() {
    const t = copy[state.lang];
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('mrp-lang', state.lang);
    $$('[data-i18n]').forEach(node => {
      const value = t[node.dataset.i18n];
      if (value != null) node.textContent = value;
    });
    $$('[data-i18n-placeholder]').forEach(node => {
      const value = t[node.dataset.i18nPlaceholder];
      if (value != null) node.placeholder = value;
    });
    $$('.lang-button').forEach(button => {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (state.restaurant) {
      const address = state.lang === 'ar' ? state.restaurant.addressAr : state.restaurant.address;
      els.footerAddress.textContent = address;
      els.drawerAddress.textContent = address;
    }
    updateOpenStatus();
    renderCategories();
    renderMenu();
    renderCart();
    if (state.selectedItem && els.itemModal.classList.contains('open')) fillItemModal(state.selectedItem);
  }

  function renderCategories() {
    const t = copy[state.lang];
    const buttons = ['all', ...CATEGORIES].map(key => {
      const label = key === 'all' ? t.all : categoryLabel(key);
      return `<button type="button" class="category-button${state.category === key ? ' active' : ''}" data-category="${escapeHtml(key)}" aria-pressed="${state.category === key}">${escapeHtml(label)}</button>`;
    }).join('');
    els.categoryNav.innerHTML = buttons;
  }

  function filteredMenu() {
    const query = normalize(state.query);
    return state.menu.filter(item => {
      if (item.available === false) return false;
      if (state.category !== 'all' && item.category !== state.category) return false;
      if (!query) return true;
      const haystack = normalize([item.name, item.nameAr, item.desc, item.descAr, categoryLabel(item.category), groupLabel(item.group)].join(' '));
      return haystack.includes(query);
    });
  }

  function cardMarkup(item) {
    const name = getText(item, 'name');
    const secondary = state.lang === 'ar' ? item.name : item.nameAr;
    const desc = getText(item, 'desc');
    return `<article class="dish-card" data-id="${item.id}">
      <button type="button" class="dish-open" aria-label="${escapeHtml(name)} — ${escapeHtml(priceLabel(item))}">
        <div class="dish-media">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(name)}" width="720" height="540" loading="lazy" decoding="async">
          <span class="dish-price">${escapeHtml(priceLabel(item))}</span>
        </div>
        <div class="dish-content">
          <h4>${escapeHtml(name)}</h4>
          <p class="dish-name-ar" ${state.lang === 'fr' ? 'lang="ar" dir="rtl"' : ''}>${escapeHtml(secondary || '')}</p>
          <p class="dish-description">${escapeHtml(desc)}</p>
        </div>
      </button>
      <button type="button" class="dish-add" aria-label="${escapeHtml(copy[state.lang].add)} — ${escapeHtml(name)}" data-add="${item.id}">${icon('plus')}</button>
    </article>`;
  }

  function renderMenu() {
    if (!state.menu.length) return;
    const items = filteredMenu();
    const t = copy[state.lang];
    els.resultsText.textContent = `${items.length} ${items.length === 1 ? t.resultOne : t.resultMany}`;
    els.resetFilters.hidden = !state.query && state.category === 'all';
    els.emptyState.hidden = items.length !== 0;
    els.menuContent.hidden = items.length === 0;

    const groupBy = state.category === 'all' || state.query ? item => item.category : item => item.group;
    const groups = new Map();
    items.forEach(item => {
      const key = groupBy(item);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    });

    let keys;
    if (state.category === 'all' || state.query) keys = CATEGORIES.filter(key => groups.has(key));
    else keys = [...groups.keys()];

    els.menuContent.innerHTML = keys.map(key => {
      const groupItems = groups.get(key);
      const label = state.category === 'all' || state.query ? categoryLabel(key) : groupLabel(key);
      return `<section class="menu-group" data-group="${escapeHtml(key)}">
        <div class="group-heading"><h3>${escapeHtml(label)}</h3><span>${groupItems.length} ${groupItems.length === 1 ? t.resultOne : t.resultMany}</span></div>
        <div class="menu-grid">${groupItems.map(cardMarkup).join('')}</div>
      </section>`;
    }).join('');

    $$('img', els.menuContent).forEach(img => img.addEventListener('error', () => { img.src = 'assets/dish-placeholder.svg'; }, { once: true }));
  }

  function selectCategory(category) {
    state.category = CATEGORIES.includes(category) ? category : 'all';
    renderCategories();
    renderMenu();
    const active = $(`.category-button[data-category="${state.category}"]`, els.categoryNav);
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    const top = els.menuTools.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top + 140) document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  }

  function resetFilters() {
    state.category = 'all';
    state.query = '';
    els.searchInput.value = '';
    els.clearSearch.hidden = true;
    renderCategories();
    renderMenu();
  }

  function fillItemModal(item) {
    state.selectedItem = item;
    state.selectedSize = item.sizes?.length ? 0 : null;
    els.itemImage.src = item.image || 'assets/dish-placeholder.svg';
    els.itemImage.alt = getText(item, 'name');
    els.itemCategory.textContent = categoryLabel(item.category);
    els.itemName.textContent = getText(item, 'name');
    els.itemArabic.textContent = state.lang === 'ar' ? item.name : (item.nameAr || '');
    els.itemDescription.textContent = getText(item, 'desc');
    els.sizePicker.hidden = !item.sizes?.length;
    els.sizeOptions.innerHTML = (item.sizes || []).map((size, index) => `<label class="size-option">
      <input type="radio" name="dish-size" value="${index}" ${index === 0 ? 'checked' : ''}>
      <span><b>${escapeHtml(size.name)}</b><small>${escapeHtml(money(size.price))}</small></span>
    </label>`).join('');
    updateModalPrice();
  }

  function updateModalPrice() {
    const item = state.selectedItem;
    if (!item) return;
    const value = state.selectedSize != null && item.sizes?.[state.selectedSize] ? item.sizes[state.selectedSize].price : item.price;
    els.itemPrice.textContent = money(value);
  }

  function openItem(item) {
    fillItemModal(item);
    openLayer(els.itemModal);
  }

  function itemCartKey(id, sizeIndex) { return `${id}:${sizeIndex == null ? 'n' : sizeIndex}`; }

  function addToCart(item, sizeIndex = null) {
    if (!item) return;
    if (item.sizes?.length && sizeIndex == null) { openItem(item); return; }
    const key = itemCartKey(item.id, sizeIndex);
    const existing = state.cart.find(row => row.key === key);
    if (existing) existing.quantity += 1;
    else state.cart.push({ key, id: item.id, sizeIndex, quantity: 1 });
    saveCart();
    renderCart();
    toast(`${getText(item, 'name')} — ${copy[state.lang].added}`);
  }

  function cartDetails(row) {
    const item = state.map.get(row.id);
    if (!item) return null;
    const size = row.sizeIndex != null ? item.sizes?.[row.sizeIndex] : null;
    const unit = Number(size?.price ?? item.price);
    return { item, size, unit, subtotal: unit * row.quantity };
  }

  function cartTotal() {
    return state.cart.reduce((sum, row) => sum + (cartDetails(row)?.subtotal || 0), 0);
  }

  function renderCart() {
    state.cart = state.cart.filter(row => state.map.has(row.id) && row.quantity > 0);
    saveCart();
    const totalQuantity = state.cart.reduce((sum, row) => sum + row.quantity, 0);
    const total = cartTotal();
    els.cartFab.hidden = totalQuantity === 0;
    els.cartCount.textContent = totalQuantity;
    els.cartFabTotal.textContent = money(total);
    els.cartTotal.textContent = money(total);
    els.cartEmpty.hidden = state.cart.length > 0;
    els.cartFooter.hidden = state.cart.length === 0;
    els.cartItems.innerHTML = state.cart.map(row => {
      const detail = cartDetails(row);
      if (!detail) return '';
      const { item, size, subtotal } = detail;
      return `<article class="cart-item" data-key="${escapeHtml(row.key)}">
        <img src="${escapeHtml(item.image)}" alt="" width="66" height="66" loading="lazy">
        <div class="cart-item-main">
          <div class="cart-item-top"><h3>${escapeHtml(getText(item, 'name'))}</h3><strong class="cart-item-price">${escapeHtml(money(subtotal))}</strong></div>
          <div class="cart-item-meta">${size ? escapeHtml(size.name) + ' · ' : ''}${escapeHtml(money(detail.unit))}</div>
          <div class="cart-item-bottom">
            <div class="quantity-stepper">
              <button type="button" data-qty="minus" aria-label="Diminuer">${icon('minus')}</button>
              <b>${row.quantity}</b>
              <button type="button" data-qty="plus" aria-label="Augmenter">${icon('plus')}</button>
            </div>
          </div>
        </div>
      </article>`;
    }).join('');
    $$('img', els.cartItems).forEach(img => img.addEventListener('error', () => { img.src = 'assets/dish-placeholder.svg'; }, { once: true }));
  }

  function updateQuantity(key, delta) {
    const row = state.cart.find(entry => entry.key === key);
    if (!row) return;
    row.quantity += delta;
    if (row.quantity <= 0) state.cart = state.cart.filter(entry => entry.key !== key);
    saveCart();
    renderCart();
  }

  function clearCart() {
    state.cart = [];
    saveCart();
    renderCart();
    toast(copy[state.lang].cleared);
  }

  function createOrderQR() {
    if (!state.cart.length) return;
    if (typeof window.QRious !== 'function') { toast(copy[state.lang].qrError); return; }
    const table = String(els.tableNumber.value || '').replace(/\D/g, '').slice(0, 3) || '-';
    const random = window.crypto?.getRandomValues ? [...crypto.getRandomValues(new Uint8Array(3))].map(v => v.toString(36)).join('').slice(0, 5) : Math.random().toString(36).slice(2, 7);
    const orderId = `${Date.now().toString(36).slice(-5)}${random}`.toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000);
    const items = state.cart.map(row => `${row.id}.${row.sizeIndex == null ? 'n' : row.sizeIndex}.${row.quantity}`).join(',');
    const payload = `MP2|${orderId}|${timestamp}|${table}|${items}|${cartTotal()}`;
    try {
      const qr = new QRious({ value: payload, size: 360, level: 'M', foreground: '#09170f', background: '#ffffff', padding: 16 });
      els.qrCode.replaceChildren(qr.canvas);
      els.qrOrderId.textContent = `#${orderId}${table !== '-' ? ` · T${table}` : ''}`;
      els.qrTotal.textContent = money(cartTotal());
      closeLayer(false);
      window.setTimeout(() => openLayer(els.qrModal), 60);
    } catch (_) { toast(copy[state.lang].qrError); }
  }

  function dataURLtoBlob(dataurl) {
    try {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (_) { return null; }
  }

  async function downloadQR() {
    const canvas = $('canvas', els.qrCode);
    if (!canvas) return;
    hapticTap('medium');
    const dataUrl = canvas.toDataURL('image/png');
    const filename = `mr-pasta-${els.qrOrderId.textContent.replace(/[^a-z0-9]/gi, '')}.png`;

    // 1. Try Capacitor Filesystem plugin to write directly into device Pictures / Storage
    try {
      const Filesystem = window.Capacitor?.Plugins?.Filesystem;
      if (Filesystem) {
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        await Filesystem.writeFile({
          path: `Download/${filename}`,
          data: base64Data,
          directory: 'EXTERNAL_STORAGE',
          recursive: true
        });
        toast(state.lang === 'ar' ? 'تم حفظ رمز QR في المعرض' : 'QR Code enregistré dans la Galerie !');
        return;
      }
    } catch (_) {
      try {
        const Filesystem = window.Capacitor?.Plugins?.Filesystem;
        if (Filesystem) {
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: 'DOCUMENTS',
            recursive: true
          });
          toast(state.lang === 'ar' ? 'تم حفظ رمز QR في المستندات' : 'QR Code enregistré dans vos Documents !');
          return;
        }
      } catch (_) {}
    }

    // 2. Try Native Web Share API
    try {
      const blob = dataURLtoBlob(dataUrl);
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Mr Pasta QR Code',
            text: 'Code QR de commande Mr Pasta'
          });
          toast(state.lang === 'ar' ? 'تمت مشاركة رمز QR' : 'QR Code partagé');
          return;
        }
      }
    } catch (_) {}

    // 3. Fallback anchor link
    try {
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 200);
      toast(state.lang === 'ar' ? 'تم حفظ رمز QR' : 'QR Code enregistré');
    } catch (_) {
      toast(state.lang === 'ar' ? 'اضغط مطولاً على الصورة لحفظها' : 'Appuyez longuement sur le QR pour enregistrer');
    }
  }

  function openLayer(layer) {
    if (!layer) return;
    if (state.currentLayer && state.currentLayer !== layer) closeLayer(false);
    state.restoreFocus = document.activeElement;
    state.currentLayer = layer;
    els.backdrop.hidden = false;
    requestAnimationFrame(() => els.backdrop.classList.add('visible'));
    layer.classList.add('open');
    layer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('layer-open');
    window.setTimeout(() => $('.close-layer', layer)?.focus(), 80);

    try {
      if (!history.state?.modalOpen) {
        history.pushState({ modalOpen: true }, '');
      }
    } catch (_) {}
  }

  function closeLayer(restore = true) {
    const layer = state.currentLayer;
    if (!layer) return;
    layer.classList.remove('open');
    layer.setAttribute('aria-hidden', 'true');
    els.backdrop.classList.remove('visible');
    document.body.classList.remove('layer-open');
    window.setTimeout(() => { if (!state.currentLayer) els.backdrop.hidden = true; }, 320);
    state.currentLayer = null;
    if (restore) state.restoreFocus?.focus?.();
  }

  function setupCapacitorBackButton() {
    const App = window.Capacitor?.Plugins?.App;
    if (!App) return;

    App.addListener('backButton', () => {
      if (state.currentLayer) {
        closeLayer();
        return;
      }

      const now = Date.now();
      if (state.lastBackTap && now - state.lastBackTap < 2000) {
        App.exitApp();
      } else {
        state.lastBackTap = now;
        toast(state.lang === 'ar' ? 'اضغط مرة أخرى للخروج' : 'Appuyez à nouveau pour quitter');
      }
    });
  }

  function hapticTap(style = 'light') {
    try {
      const Haptics = window.Capacitor?.Plugins?.Haptics;
      if (Haptics) Haptics.impact({ style: style.toUpperCase() });
    } catch (_) {}
  }

  function setupStatusBar() {
    try {
      const StatusBar = window.Capacitor?.Plugins?.StatusBar;
      if (StatusBar) {
        StatusBar.setStyle({ style: 'DARK' });
        StatusBar.setBackgroundColor({ color: '#0a1911' });
        StatusBar.setOverlaysWebView({ overlay: false });
      }
    } catch (_) {}
  }

  function hideSplashScreen() {
    try {
      const SplashScreen = window.Capacitor?.Plugins?.SplashScreen;
      if (SplashScreen) SplashScreen.hide();
    } catch (_) {}
  }

  function toast(message) {
    hapticTap('light');
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    els.toastRegion.append(node);
    window.setTimeout(() => node.remove(), 2800);
  }

  function updateOpenStatus() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const isOpen = minutes >= 11 * 60 + 30 && minutes < 23 * 60;
    els.openStatus.classList.toggle('closed', !isOpen);
    $('b', els.openStatus).textContent = isOpen ? copy[state.lang].open : copy[state.lang].closed;
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('mrp-theme', next);
    $('meta[name="theme-color"]').content = next === 'dark' ? '#08120d' : '#0a1911';
  }

  function cacheElements() {
    Object.assign(els, {
      loading: $('#loadingScreen'), openStatus: $('#openStatus'), dishCount: $('#dishCount'),
      categoryNav: $('#categoryNav'), searchInput: $('#searchInput'), clearSearch: $('#clearSearch'),
      menuTools: $('#menuTools'), menuContent: $('#menuContent'), resultsText: $('#resultsText'),
      resetFilters: $('#resetFilters'), emptyState: $('#emptyState'), emptyReset: $('#emptyReset'),
      footerAddress: $('#footerAddress'), drawerAddress: $('#drawerAddress'),
      infoDrawer: $('#infoDrawer'), cartDrawer: $('#cartDrawer'), itemModal: $('#itemModal'), qrModal: $('#qrModal'),
      backdrop: $('#backdrop'), cartFab: $('#cartFab'), cartCount: $('#cartCount'), cartFabTotal: $('#cartFabTotal'),
      cartItems: $('#cartItems'), cartEmpty: $('#cartEmpty'), cartFooter: $('#cartFooter'), cartTotal: $('#cartTotal'),
      tableNumber: $('#tableNumber'), itemImage: $('#itemImage'), itemCategory: $('#itemCategory'),
      itemName: $('#itemName'), itemArabic: $('#itemArabic'), itemDescription: $('#itemDescription'),
      sizePicker: $('#sizePicker'), sizeOptions: $('#sizeOptions'), itemPrice: $('#itemPrice'),
      qrCode: $('#qrCode'), qrOrderId: $('#qrOrderId'), qrTotal: $('#qrTotal'), toastRegion: $('#toastRegion')
    });
  }

  function bindEvents() {
    $('#infoButton').addEventListener('click', () => openLayer(els.infoDrawer));
    $('#themeButton').addEventListener('click', toggleTheme);
    els.cartFab.addEventListener('click', () => openLayer(els.cartDrawer));
    els.backdrop.addEventListener('click', () => closeLayer());
    $$('.close-layer').forEach(button => button.addEventListener('click', () => closeLayer()));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLayer(); });

    $$('.lang-button').forEach(button => button.addEventListener('click', () => {
      state.lang = button.dataset.lang === 'ar' ? 'ar' : 'fr';
      applyLanguage();
    }));

    els.categoryNav.addEventListener('click', event => {
      const button = event.target.closest('[data-category]');
      if (button) selectCategory(button.dataset.category);
    });

    els.searchInput.addEventListener('input', () => {
      state.query = els.searchInput.value;
      els.clearSearch.hidden = !state.query;
      renderMenu();
    });
    els.clearSearch.addEventListener('click', () => {
      state.query = '';
      els.searchInput.value = '';
      els.clearSearch.hidden = true;
      els.searchInput.focus();
      renderMenu();
    });
    els.resetFilters.addEventListener('click', resetFilters);
    els.emptyReset.addEventListener('click', resetFilters);

    els.menuContent.addEventListener('click', event => {
      const addButton = event.target.closest('[data-add]');
      if (addButton) {
        const item = state.map.get(Number(addButton.dataset.add));
        if (item?.sizes?.length) openItem(item); else addToCart(item);
        return;
      }
      const card = event.target.closest('.dish-card');
      if (card) openItem(state.map.get(Number(card.dataset.id)));
    });

    els.sizeOptions.addEventListener('change', event => {
      if (event.target.name === 'dish-size') {
        state.selectedSize = Number(event.target.value);
        updateModalPrice();
      }
    });
    $('#itemAddButton').addEventListener('click', () => {
      if (!state.selectedItem) return;
      if (state.selectedItem.sizes?.length && state.selectedSize == null) { toast(copy[state.lang].selectSize); return; }
      addToCart(state.selectedItem, state.selectedSize);
      closeLayer();
    });

    els.cartItems.addEventListener('click', event => {
      const button = event.target.closest('[data-qty]');
      const row = event.target.closest('.cart-item');
      if (button && row) updateQuantity(row.dataset.key, button.dataset.qty === 'plus' ? 1 : -1);
    });
    $('#clearCartButton').addEventListener('click', clearCart);
    $('#createQrButton').addEventListener('click', createOrderQR);
    $('#downloadQr').addEventListener('click', downloadQR);

    const stickyCheck = () => els.menuTools.classList.toggle('stuck', els.menuTools.getBoundingClientRect().top <= 0);
    window.addEventListener('scroll', stickyCheck, { passive: true });
    stickyCheck();
  }

  let currentVersion = null;

  async function checkLiveUpdate() {
    if (document.visibilityState !== 'visible') return;
    try {
      const headers = {};
      if (currentVersion) {
        headers['If-None-Match'] = `"${currentVersion}"`;
      }
      const res = await fetch('/api/menu/version', { headers, cache: 'no-store' });
      if (res.status === 304) return; // 304 Not Modified: 0 bytes transfer, super fast!
      if (!res.ok) return;

      const data = await res.json();
      if (!currentVersion) {
        currentVersion = data.version;
        return;
      }
      if (data.version !== currentVersion) {
        currentVersion = data.version;
        const [menuResponse, restaurantResponse] = await Promise.all([
          fetch('/api/menu', { cache: 'no-store' }),
          fetch('/api/restaurant', { cache: 'no-store' })
        ]);
        if (menuResponse.ok && restaurantResponse.ok) {
          state.menu = await menuResponse.json();
          state.restaurant = await restaurantResponse.json();
          state.map = new Map(state.menu.map(item => [Number(item.id), item]));
          els.dishCount.textContent = state.menu.length;
          applyLanguage();
          renderCategories();
          renderMenu();
          renderCart();
          showToast(state.lang === 'ar' ? '✨ تم تحديث القائمة في الوقت الفعلي' : '✨ Menu mis à jour en temps réel !');
        }
      }
    } catch (_) {}
  }

  function setupLiveSync() {
    setInterval(checkLiveUpdate, 2500); // 2.5s fast polling with 304 ETag efficiency
    window.addEventListener('focus', checkLiveUpdate);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkLiveUpdate();
    });
    // Instant update trigger when user touches or interacts with the menu
    let lastTouchCheck = 0;
    const instantTrigger = () => {
      const now = Date.now();
      if (now - lastTouchCheck > 2000) {
        lastTouchCheck = now;
        checkLiveUpdate();
      }
    };
    window.addEventListener('touchstart', instantTrigger, { passive: true });
    window.addEventListener('click', instantTrigger, { passive: true });
  }

  async function init() {
    cacheElements();
    bindEvents();
    $('#year').textContent = new Date().getFullYear();

    try {
      let menuData = null;
      let restaurantData = null;

      try {
        const [menuResponse, restaurantResponse] = await Promise.all([
          fetch('/api/menu', { cache: 'no-store' }),
          fetch('/api/restaurant', { cache: 'no-store' })
        ]);
        if (menuResponse.ok && restaurantResponse.ok) {
          menuData = await menuResponse.json();
          restaurantData = await restaurantResponse.json();
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to static files', err);
      }

      if (!menuData || !restaurantData) {
        const [menuResponse, restaurantResponse] = await Promise.all([
          fetch('./data/menu.json', { cache: 'no-store' }),
          fetch('./data/restaurant.json', { cache: 'no-store' })
        ]);
        if (!menuResponse.ok || !restaurantResponse.ok) throw new Error('Data unavailable');
        menuData = await menuResponse.json();
        restaurantData = await restaurantResponse.json();
      }

      state.menu = menuData;
      state.restaurant = restaurantData;
      state.map = new Map(state.menu.map(item => [Number(item.id), item]));
      els.dishCount.textContent = state.menu.length;
      els.menuContent.setAttribute('aria-busy', 'false');
      applyLanguage();
      renderCart();
      setupLiveSync();
      checkLiveUpdate();
      setupCapacitorBackButton();
      setupStatusBar();
      hideSplashScreen();
      window.addEventListener('popstate', () => {
        if (state.currentLayer) closeLayer(false);
      });
      els.itemImage.addEventListener('error', () => { els.itemImage.src = 'assets/dish-placeholder.svg'; });
      window.setTimeout(() => els.loading.classList.add('done'), 250);
      window.setTimeout(() => els.loading.remove(), 850);
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
    } catch (error) {
      console.error(error);
      els.loading.querySelector('p').textContent = state.lang === 'ar' ? 'تعذّر تحميل القائمة. أعد المحاولة.' : 'Impossible de charger le menu. Réessayez.';
      els.loading.querySelector('.loader')?.remove();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
