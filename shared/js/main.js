// --- GLOBAL STATE MANAGER ---
class StoreEngine {
  constructor() {
    this.config = window.STORE_CONFIG || {
      storeId: 'demo-store',
      storeName: 'E-Ticaret Demo',
      products: []
    };
    
    this.cart = this.loadState('cart') || [];
    this.wishlist = this.loadState('wishlist') || [];
    this.checkoutStep = 1;
    
    // SVG Icons reused across components
    this.icons = {
      close: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
      trash: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
      heart: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
      star: `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
      check: `<svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    };

    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  // --- STATE PERSISTENCE ---
  loadState(key) {
    const data = localStorage.getItem(`${this.config.storeId}_${key}`);
    return data ? JSON.parse(data) : null;
  }

  saveState(key, value) {
    localStorage.setItem(`${this.config.storeId}_${key}`, JSON.stringify(value));
  }

  // --- INITIALIZATION ---
  init() {
    this.injectUIContainers();
    this.renderHeader();
    this.renderHero();
    this.renderCategories();
    this.renderProducts();
    this.renderFAQ();
    this.renderBlogs();
    this.renderFooter();
    this.setupEventListeners();
    this.updateCartBadges();
    this.startCountdown();
  }

  // Inject drawers, modals, toast wrapper
  injectUIContainers() {
    // Drawer Cart
    const drawerHTML = `
      <div id="drawer-backdrop" class="drawer-backdrop">
        <div class="drawer-cart">
          <div class="drawer-header">
            <h2>Alışveriş Sepeti (<span id="cart-count-header">0</span>)</h2>
            <button id="drawer-close" class="drawer-close-btn">${this.icons.close}</button>
          </div>
          <div class="drawer-body" id="cart-items-container">
            <!-- Dynamic Cart Items -->
          </div>
          <div class="drawer-footer">
            <div class="cart-subtotal">
              <span>Ara Toplam:</span>
              <span id="cart-total-price">0.00 TL</span>
            </div>
            <button id="cart-checkout-btn" class="btn btn-primary" style="width: 100%;">Ödemeye Geç</button>
            <div class="cart-trust-badges">
              <span>🔒 Güvenli Ödeme</span>
              <span>⚡ Hızlı Teslimat</span>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    // Modal Backdrop for QuickView, Wishlist, Checkout
    const modalHTML = `
      <div id="modal-backdrop" class="modal-backdrop">
        <button id="modal-close" class="modal-close">${this.icons.close}</button>
        <div id="modal-content" class="modal-container">
          <!-- Dynamic Modal Content -->
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Toast Container
    const toastHTML = `<div id="toast-container" class="toast-container"></div>`;
    document.body.insertAdjacentHTML('beforeend', toastHTML);
  }

  // --- RENDER DYNAMIC SECTIONS ---
  renderHeader() {
    const storeName = this.config.storeName;
    const header = document.querySelector('header');
    if (!header) return;

    header.className = 'sticky-header';
    header.innerHTML = `
      <div class="announcement-bar">
        <div class="container">${this.config.announcementText || '✨ 1500 TL üzeri alışverişlerinizde kargo ücretsiz!'}</div>
      </div>
      <div class="container">
        <div class="header-main">
          <a href="#" class="logo">
            <span>${storeName.split(' ')[0]}</span>${storeName.split(' ').slice(1).join(' ') || ''}
          </a>
          
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="global-search" placeholder="Aradığınız ürünü yazın...">
          </div>

          <nav class="header-nav">
            <a href="#" class="nav-link">Ana Sayfa</a>
            <div class="nav-link has-megamenu">
              Kategoriler
              <div class="megamenu">
                <div class="megamenu-column">
                  <h4>Öne Çıkanlar</h4>
                  <a href="#">Yeni Gelenler</a>
                  <a href="#">Çok Satanlar</a>
                  <a href="#">İndirimliler</a>
                </div>
                <div class="megamenu-column">
                  <h4>Popüler Kategoriler</h4>
                  ${this.config.categories.slice(0, 3).map(c => `<a href="#" class="cat-filter-link" data-cat="${c.name}">${c.name}</a>`).join('')}
                </div>
                <div class="megamenu-column">
                  <h4>Hizmetler</h4>
                  <a href="#">Sipariş Takibi</a>
                  <a href="#">İade ve Değişim</a>
                  <a href="#">Yardım & SSS</a>
                </div>
              </div>
            </div>
            <a href="#" class="nav-link">Kampanyalar</a>
            <a href="#" class="nav-link">İletişim</a>
          </nav>

          <div class="header-actions">
            <button class="action-btn" id="wishlist-trigger" title="Favoriler">
              ${this.icons.heart}
              <span class="action-badge" id="wishlist-count-badge">0</span>
            </button>
            <button class="action-btn" id="cart-trigger" title="Sepetim">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"></path><path d="M20 21a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"></path><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span class="action-badge" id="cart-count-badge">0</span>
            </button>
          </div>
        </div>
      </div>
      <div class="category-menu-row">
        <div class="container">
          <div class="category-menu-item active" data-category="all">Tüm Ürünler</div>
          ${this.config.categories.map(c => `
            <div class="category-menu-item" data-category="${c.name}">
              ${c.name}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderHero() {
    const hero = document.getElementById('hero-section');
    if (!hero || !this.config.heroSection) return;
    const h = this.config.heroSection;

    hero.className = 'hero-section';
    hero.innerHTML = `
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <span class="badge badge-success" style="margin-bottom: 16px;">%100 Güvenli Alışveriş</span>
            <h1>${h.title}</h1>
            <p>${h.subtitle}</p>
            <div class="hero-buttons">
              <a href="#products" class="btn btn-primary">${h.primaryBtnText || 'Koleksiyonu Keşfet'}</a>
              <a href="#about" class="btn btn-outline">${h.secondaryBtnText || 'Daha Fazla Bilgi'}</a>
            </div>
          </div>
          <div class="hero-image">
            <img src="${h.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600'}" alt="Hero Image">
          </div>
        </div>
      </div>
    `;
  }

  renderCategories() {
    const catSection = document.getElementById('categories-section');
    if (!catSection || !this.config.categories) return;

    catSection.className = 'categories-section';
    catSection.innerHTML = `
      <div class="container">
        <div class="section-header">
          <h2>Popüler Kategoriler</h2>
        </div>
        <div class="categories-grid">
          ${this.config.categories.map(c => `
            <div class="category-card" data-category="${c.name}">
              <div class="category-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              </div>
              <h3>${c.name}</h3>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderProducts(filterCategory = 'all', searchQuery = '') {
    const prodGrid = document.getElementById('products-grid');
    if (!prodGrid) return;

    let filtered = this.config.products;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase())));
    }

    if (filtered.length === 0) {
      prodGrid.innerHTML = `<div class="text-center" style="grid-column: 1/-1; padding: 48px 0; color: var(--text-body);">Aradığınız kriterlere uygun ürün bulunamadı.</div>`;
      return;
    }

    prodGrid.innerHTML = filtered.map(p => {
      const isWishlisted = this.wishlist.includes(p.id) ? 'active' : '';
      const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
      const ratingStars = Array(5).fill(0).map((_, i) => `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="${i < Math.floor(p.rating || 5) ? '#FBBF24' : 'none'}" stroke="#FBBF24" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      `).join('');

      return `
        <div class="product-card" data-id="${p.id}">
          <div class="product-image-wrapper">
            ${discount > 0 ? `<div class="product-badge-discount">-${discount}% İndirim</div>` : ''}
            ${p.stock === 0 ? `<div class="product-badge-stock">Tükendi</div>` : ''}
            <button class="product-wishlist-btn ${isWishlisted}" data-id="${p.id}">
              ${this.icons.heart}
            </button>
            <img class="product-image" src="${p.image}" alt="${p.name}" loading="lazy">
            <button class="product-quickview-btn" data-id="${p.id}">Hızlı Bakış</button>
          </div>
          <div class="product-info">
            <div class="product-rating">
              <div class="stars">${ratingStars}</div>
              <span class="rating-count">(${p.reviews || 12})</span>
            </div>
            <h3 class="product-title">${p.name}</h3>
            <div class="product-prices">
              <span class="price-new">${p.price.toLocaleString('tr-TR')} TL</span>
              ${p.oldPrice ? `<span class="price-old">${p.oldPrice.toLocaleString('tr-TR')} TL</span>` : ''}
            </div>
            <button class="product-add-btn btn" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
              ${p.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderFAQ() {
    const faqContainer = document.getElementById('faq-container');
    if (!faqContainer || !this.config.faqs) return;

    faqContainer.innerHTML = this.config.faqs.map(f => `
      <div class="faq-item">
        <div class="faq-header">
          <span>${f.question}</span>
          <span class="faq-icon">▼</span>
        </div>
        <div class="faq-body">
          <p>${f.answer}</p>
        </div>
      </div>
    `).join('');
  }

  renderBlogs() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid || !this.config.blogs) return;

    blogGrid.innerHTML = this.config.blogs.map(b => `
      <div class="blog-card">
        <div class="blog-img">
          <img src="${b.image}" alt="${b.title}">
        </div>
        <div class="blog-info">
          <span class="blog-date">${b.date || '05 Temmuz 2026'}</span>
          <h3>${b.title}</h3>
          <p>${b.summary}</p>
          <a href="#" class="blog-read-more">Devamını Oku →</a>
        </div>
      </div>
    `).join('');
  }

  renderFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    footer.className = 'footer-main';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="#" class="logo" style="margin-bottom: 16px;">
              <span>${this.config.storeName.split(' ')[0]}</span>${this.config.storeName.split(' ').slice(1).join(' ') || ''}
            </a>
            <p>${this.config.storeDescription || 'Premium kalitede, modern e-ticaret deneyimi sunuyoruz.'}</p>
            <div class="social-links">
              <a href="#" class="social-link"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
              <a href="#" class="social-link"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
              <a href="#" class="social-link"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>
            </div>
          </div>
          <div class="footer-col">
            <h3>Alışveriş</h3>
            <ul class="footer-links">
              <li><a href="#">Çok Satanlar</a></li>
              <li><a href="#">Yeni Gelenler</a></li>
              <li><a href="#">İndirimler</a></li>
              <li><a href="#">Koleksiyonlar</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3>Destek</h3>
            <ul class="footer-links">
              <li><a href="#">Sıkça Sorulan Sorular</a></li>
              <li><a href="#">Kargo ve Teslimat</a></li>
              <li><a href="#">Kolay İade</a></li>
              <li><a href="#">Gizlilik Sözleşmesi</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h3>Kurumsal</h3>
            <ul class="footer-links">
              <li><a href="#">Hakkımızda</a></li>
              <li><a href="#">İletişim</a></li>
              <li><a href="#">Kariyer</a></li>
              <li><a href="#">İş Ortaklığı</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div>© 2026 ${this.config.storeName}. Tüm Hakları Saklıdır.</div>
          <div class="payment-methods">
            <span style="font-size: 20px; font-weight: bold; color: var(--text-body); opacity: 0.6;">Visa / Mastercard / Troy / Stripe</span>
          </div>
        </div>
      </div>
    `;
  }

  // --- COMPONENT EVENT BINDINGS ---
  setupEventListeners() {
    // Scroll Header effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.sticky-header');
      if (header) {
        if (window.scrollY > 20) {
          header.style.padding = '4px 0';
          header.style.boxShadow = 'var(--shadow-md)';
        } else {
          header.style.padding = '0';
          header.style.boxShadow = 'var(--shadow-sm)';
        }
      }
    });

    // Drawer Cart Open/Close
    const backdrop = document.getElementById('drawer-backdrop');
    document.getElementById('cart-trigger')?.addEventListener('click', () => {
      this.renderCartItems();
      backdrop.classList.add('active');
    });
    document.getElementById('drawer-close')?.addEventListener('click', () => {
      backdrop.classList.remove('active');
    });
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('active');
    });

    // Modal close bindings
    const modalBackdrop = document.getElementById('modal-backdrop');
    document.getElementById('modal-close')?.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });
    modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) modalBackdrop.classList.remove('active');
    });

    // Search listeners
    const searchInput = document.getElementById('global-search');
    searchInput?.addEventListener('input', (e) => {
      const val = e.target.value;
      const activeCatItem = document.querySelector('.category-menu-item.active');
      const activeCat = activeCatItem ? activeCatItem.getAttribute('data-category') : 'all';
      this.renderProducts(activeCat, val);
    });

    // Category Menu Filtering
    document.addEventListener('click', (e) => {
      const item = e.target.closest('.category-menu-item');
      if (item) {
        document.querySelectorAll('.category-menu-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        const cat = item.getAttribute('data-category');
        this.renderProducts(cat, searchInput ? searchInput.value : '');
        
        // Smooth scroll to products
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
      }

      // Megamenu filter clicks
      const filterLink = e.target.closest('.cat-filter-link');
      if (filterLink) {
        e.preventDefault();
        const cat = filterLink.getAttribute('data-cat');
        const targetMenu = document.querySelector(`.category-menu-item[data-category="${cat}"]`);
        if (targetMenu) {
          targetMenu.click();
        }
      }

      // Add to Cart from product grid
      const addBtn = e.target.closest('.product-add-btn');
      if (addBtn) {
        const id = addBtn.getAttribute('data-id');
        this.addToCart(id);
      }

      // Wishlist toggle button click
      const wishBtn = e.target.closest('.product-wishlist-btn');
      if (wishBtn) {
        const id = wishBtn.getAttribute('data-id');
        this.toggleWishlist(id, wishBtn);
      }

      // Quickview Button
      const quickBtn = e.target.closest('.product-quickview-btn');
      if (quickBtn) {
        const id = quickBtn.getAttribute('data-id');
        this.openQuickView(id);
      }

      // Category Card Click
      const catCard = e.target.closest('.category-card');
      if (catCard) {
        const cat = catCard.getAttribute('data-category');
        const targetMenu = document.querySelector(`.category-menu-item[data-category="${cat}"]`);
        if (targetMenu) {
          targetMenu.click();
        }
      }

      // FAQ accordion
      const faqHeader = e.target.closest('.faq-header');
      if (faqHeader) {
        const item = faqHeader.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      }
    });

    // Wishlist trigger click
    document.getElementById('wishlist-trigger')?.addEventListener('click', () => {
      this.openWishlistModal();
    });

    // Checkout button click
    document.getElementById('cart-checkout-btn')?.addEventListener('click', () => {
      backdrop.classList.remove('active');
      this.openCheckoutModal();
    });

    // Newsletter submit handler
    const newsForm = document.getElementById('newsletter-form');
    newsForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsForm.querySelector('input');
      if (input && input.value) {
        input.value = '';
        this.showToast('Başarıyla bültene kayıt olundu! İndirim kodunuz mailinize gönderildi.', 'success');
      }
    });
  }

  // --- CART OPERATIONS ---
  addToCart(id, qty = 1) {
    const prod = this.config.products.find(p => p.id === id);
    if (!prod) return;

    const cartItem = this.cart.find(item => item.id === id);
    if (cartItem) {
      cartItem.qty += qty;
    } else {
      this.cart.push({ ...prod, qty });
    }

    this.saveState('cart', this.cart);
    this.updateCartBadges();
    this.showToast(`${prod.name} sepete eklendi!`, 'success');
    
    // Automatically open drawer cart
    setTimeout(() => {
      this.renderCartItems();
      document.getElementById('drawer-backdrop').classList.add('active');
    }, 200);
  }

  updateQuantity(id, change) {
    const item = this.cart.find(item => item.id === id);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
      this.cart = this.cart.filter(i => i.id !== id);
    }

    this.saveState('cart', this.cart);
    this.updateCartBadges();
    this.renderCartItems();
  }

  removeFromCart(id) {
    this.cart = this.cart.filter(item => item.id !== id);
    this.saveState('cart', this.cart);
    this.updateCartBadges();
    this.renderCartItems();
    this.showToast('Ürün sepetten kaldırıldı.', 'warning');
  }

  updateCartBadges() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const cartBadge = document.getElementById('cart-count-badge');
    const headerCount = document.getElementById('cart-count-header');
    
    if (cartBadge) cartBadge.innerText = totalCount;
    if (headerCount) headerCount.innerText = totalCount;

    const wishlistBadge = document.getElementById('wishlist-count-badge');
    if (wishlistBadge) wishlistBadge.innerText = this.wishlist.length;
  }

  renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <p>Sepetiniz şu anda boş.</p>
        </div>
      `;
      if (totalEl) totalEl.innerText = '0.00 TL';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    if (checkoutBtn) checkoutBtn.disabled = false;

    let total = 0;
    container.innerHTML = this.cart.map(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `
        <div class="cart-item">
          <img class="cart-item-img" src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <div class="cart-item-price">${item.price.toLocaleString('tr-TR')} TL</div>
            <div class="cart-item-actions">
              <div class="quantity-selector">
                <button class="quantity-btn" onclick="store.updateQuantity('${item.id}', -1)">-</button>
                <div class="quantity-val">${item.qty}</div>
                <button class="quantity-btn" onclick="store.updateQuantity('${item.id}', 1)">+</button>
              </div>
              <button class="cart-item-remove" onclick="store.removeFromCart('${item.id}')">Kaldır</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (totalEl) totalEl.innerText = `${total.toLocaleString('tr-TR')} TL`;
  }

  // --- WISHLIST OPERATIONS ---
  toggleWishlist(id, btn) {
    const index = this.wishlist.indexOf(id);
    const prod = this.config.products.find(p => p.id === id);
    if (!prod) return;

    if (index > -1) {
      this.wishlist.splice(index, 1);
      btn?.classList.remove('active');
      this.showToast('Ürün favorilerden çıkarıldı.', 'warning');
    } else {
      this.wishlist.push(id);
      btn?.classList.add('active');
      this.showToast(`${prod.name} favorilere eklendi!`, 'success');
    }

    this.saveState('wishlist', this.wishlist);
    this.updateCartBadges();
    
    // Synch product-grid wishlist hearts
    document.querySelectorAll(`.product-wishlist-btn[data-id="${id}"]`).forEach(el => {
      if (index > -1) el.classList.remove('active');
      else el.classList.add('active');
    });
  }

  openWishlistModal() {
    const modalContent = document.getElementById('modal-content');
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (!modalContent || !modalBackdrop) return;

    if (this.wishlist.length === 0) {
      modalContent.innerHTML = `
        <div class="wishlist-modal-body text-center">
          <h2>Favori Listem</h2>
          <p style="padding: 24px 0; color: var(--text-body);">Favori listeniz henüz boş.</p>
        </div>
      `;
    } else {
      const itemsHTML = this.wishlist.map(id => {
        const p = this.config.products.find(prod => prod.id === id);
        if (!p) return '';
        return `
          <div class="wishlist-item" id="wish-item-${p.id}">
            <img class="wishlist-item-img" src="${p.image}" alt="${p.name}">
            <div class="wishlist-item-info">
              <h4>${p.name}</h4>
              <span>${p.price.toLocaleString('tr-TR')} TL</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="store.addFromWishlistToCart('${p.id}')">Sepete Ekle</button>
            <button class="wishlist-item-remove-btn btn" onclick="store.removeWishlistItem('${p.id}')">${this.icons.trash}</button>
          </div>
        `;
      }).join('');

      modalContent.innerHTML = `
        <div class="wishlist-modal-body">
          <h2>Favori Listem</h2>
          <div class="wishlist-items-grid">
            ${itemsHTML}
          </div>
        </div>
      `;
    }

    modalBackdrop.classList.add('active');
  }

  addFromWishlistToCart(id) {
    this.addToCart(id);
    this.removeWishlistItem(id);
  }

  removeWishlistItem(id) {
    const index = this.wishlist.indexOf(id);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      this.saveState('wishlist', this.wishlist);
      this.updateCartBadges();
      
      const itemEl = document.getElementById(`wish-item-${id}`);
      if (itemEl) itemEl.remove();
      
      const wishBtn = document.querySelector(`.product-wishlist-btn[data-id="${id}"]`);
      if (wishBtn) wishBtn.classList.remove('active');

      if (this.wishlist.length === 0) {
        document.getElementById('modal-content').innerHTML = `
          <div class="wishlist-modal-body text-center">
            <h2>Favori Listem</h2>
            <p style="padding: 24px 0; color: var(--text-body);">Favori listeniz henüz boş.</p>
          </div>
        `;
      }
    }
  }

  // --- QUICK VIEW MODAL ---
  openQuickView(id) {
    const prod = this.config.products.find(p => p.id === id);
    if (!prod) return;

    const modalContent = document.getElementById('modal-content');
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (!modalContent || !modalBackdrop) return;

    const ratingStars = Array(5).fill(0).map((_, i) => `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="${i < Math.floor(prod.rating || 5) ? '#FBBF24' : 'none'}" stroke="#FBBF24" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    `).join('');

    modalContent.innerHTML = `
      <div class="quickview-grid">
        <div class="quickview-img">
          <img src="${prod.image}" alt="${prod.name}">
        </div>
        <div class="quickview-details">
          <h2>${prod.name}</h2>
          <div class="quickview-rating">
            <div class="stars">${ratingStars}</div>
            <span class="rating-count">(${prod.reviews || 12} Değerlendirme)</span>
          </div>
          <div class="quickview-price">
            <span class="price-new">${prod.price.toLocaleString('tr-TR')} TL</span>
            ${prod.oldPrice ? `<span class="price-old">${prod.oldPrice.toLocaleString('tr-TR')} TL</span>` : ''}
          </div>
          <p class="quickview-desc">${prod.desc || 'Bu ürün, yüksek kaliteli malzemelerden üretilmiştir ve modern çizgileriyle yaşam tarzınıza uyum sağlar. Mükemmel dayanıklılık ve estetik tasarım bir arada.'}</p>
          
          <div class="quickview-action-row">
            <div class="quantity-selector">
              <button class="quantity-btn" id="qv-qty-minus">-</button>
              <div class="quantity-val" id="qv-qty-val">1</div>
              <button class="quantity-btn" id="qv-qty-plus">+</button>
            </div>
            <button class="btn btn-primary" id="qv-add-cart-btn" data-id="${prod.id}" style="flex-grow: 1;">Sepete Ekle</button>
          </div>
          <span style="font-size: 13px; font-weight: 500; color: ${prod.stock > 0 ? 'var(--success)' : 'var(--error)'}">
            ● ${prod.stock > 0 ? 'Stokta Var (24 saatte kargoda)' : 'Stok Tükendi'}
          </span>
        </div>
      </div>
    `;

    let qvQty = 1;
    document.getElementById('qv-qty-minus').addEventListener('click', () => {
      if (qvQty > 1) {
        qvQty--;
        document.getElementById('qv-qty-val').innerText = qvQty;
      }
    });
    document.getElementById('qv-qty-plus').addEventListener('click', () => {
      qvQty++;
      document.getElementById('qv-qty-val').innerText = qvQty;
    });

    document.getElementById('qv-add-cart-btn').addEventListener('click', () => {
      this.addToCart(prod.id, qvQty);
      modalBackdrop.classList.remove('active');
    });

    modalBackdrop.classList.add('active');
  }

  // --- CHECKOUT SINGLE PAGE PROCESS ---
  openCheckoutModal() {
    if (this.cart.length === 0) {
      this.showToast('Ödeme adımlarına geçmek için sepetinizde en az bir ürün bulunmalıdır.', 'error');
      return;
    }

    const modalContent = document.getElementById('modal-content');
    const modalBackdrop = document.getElementById('modal-backdrop');
    if (!modalContent || !modalBackdrop) return;

    this.checkoutStep = 1;

    modalContent.className = 'modal-container checkout-modal';
    modalContent.innerHTML = `
      <div class="checkout-grid">
        <div class="checkout-form-side">
          <div class="checkout-progress">
            <div class="checkout-step active" id="ch-step-1">
              <div class="checkout-step-num">1</div>
              Adres
            </div>
            <div class="checkout-step" id="ch-step-2">
              <div class="checkout-step-num">2</div>
              Kargo & Ödeme
            </div>
            <div class="checkout-step" id="ch-step-3">
              <div class="checkout-step-num">3</div>
              Onay
            </div>
          </div>

          <div id="checkout-section-1" class="checkout-section active">
            <h3>Teslimat Bilgileri</h3>
            <div class="form-group-row">
              <div class="form-group">
                <label for="ch-name">Adınız</label>
                <input type="text" id="ch-name" placeholder="Örn. Ahmet">
              </div>
              <div class="form-group">
                <label for="ch-surname">Soyadınız</label>
                <input type="text" id="ch-surname" placeholder="Örn. Yılmaz">
              </div>
            </div>
            <div class="form-group">
              <label for="ch-email">E-Posta Adresi</label>
              <input type="email" id="ch-email" placeholder="ahmet@example.com">
            </div>
            <div class="form-group">
              <label for="ch-phone">Telefon Numarası</label>
              <input type="tel" id="ch-phone" placeholder="0555 555 55 55">
            </div>
            <div class="form-group">
              <label for="ch-address">Açık Adres</label>
              <textarea id="ch-address" rows="3" placeholder="Mahalle, sokak, no, daire..."></textarea>
            </div>
            <div class="form-group-row">
              <div class="form-group">
                <label for="ch-city">Şehir</label>
                <input type="text" id="ch-city" placeholder="İstanbul">
              </div>
              <div class="form-group">
                <label for="ch-zip">Posta Kodu</label>
                <input type="text" id="ch-zip" placeholder="34000">
              </div>
            </div>
            <div class="checkout-btn-row">
              <div></div>
              <button class="btn btn-primary" onclick="store.nextCheckoutStep()">Devam Et</button>
            </div>
          </div>

          <div id="checkout-section-2" class="checkout-section">
            <h3>Kargo & Ödeme Seçenekleri</h3>
            <div class="form-group" style="margin-bottom: 24px;">
              <label>Kargo Yöntemi</label>
              <div class="shipping-options">
                <label class="shipping-option">
                  <input type="radio" name="shipping" checked>
                  <div class="shipping-option-details">
                    <span>Standart Teslimat (2-3 İş Günü)</span>
                    <span>Ücretsiz</span>
                  </div>
                </label>
                <label class="shipping-option">
                  <input type="radio" name="shipping">
                  <div class="shipping-option-details">
                    <span>Express Teslimat (Ertesi Gün)</span>
                    <span>49.90 TL</span>
                  </div>
                </label>
              </div>
            </div>

            <h3 style="margin-top: 32px;">Kart Bilgileri</h3>
            <div class="form-group">
              <label for="card-holder">Kart Üzerindeki İsim</label>
              <input type="text" id="card-holder" placeholder="Ahmet Yılmaz">
            </div>
            <div class="form-group">
              <label for="card-number">Kart Numarası</label>
              <input type="text" id="card-number" placeholder="4355 **** **** ****" maxlength="19">
            </div>
            <div class="form-group-row">
              <div class="form-group">
                <label for="card-expiry">Son Kullanma Tarihi</label>
                <input type="text" id="card-expiry" placeholder="AA/YY" maxlength="5">
              </div>
              <div class="form-group">
                <label for="card-cvc">CVC / CVV</label>
                <input type="text" id="card-cvc" placeholder="***" maxlength="3">
              </div>
            </div>
            <div class="checkout-btn-row">
              <button class="btn btn-outline" onclick="store.prevCheckoutStep()">Geri Dön</button>
              <button class="btn btn-primary" onclick="store.nextCheckoutStep()">Siparişi Tamamla</button>
            </div>
          </div>

          <div id="checkout-section-3" class="checkout-section">
            <div class="checkout-success-view">
              <div class="success-icon-wrapper">
                ${this.icons.check}
              </div>
              <h2>Siparişiniz Alındı!</h2>
              <p>Tebrikler, siparişiniz başarıyla oluşturulmuştur. Sipariş özetiniz ve faturanız kayıtlı e-posta adresinize gönderilecektir.</p>
              <button class="btn btn-primary" onclick="store.closeCheckoutAndClearCart()">Alışverişe Devam Et</button>
            </div>
          </div>
        </div>

        <div class="checkout-summary-side" id="checkout-summary-side">
          <!-- Dynamic Summary -->
        </div>
      </div>
    `;

    this.renderCheckoutSummary();
    modalBackdrop.classList.add('active');
  }

  renderCheckoutSummary() {
    const container = document.getElementById('checkout-summary-side');
    if (!container) return;

    let subtotal = 0;
    const itemsHTML = this.cart.map(item => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;
      return `
        <div style="display: flex; gap: 12px; margin-bottom: 16px;">
          <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;">
          <div style="flex-grow: 1;">
            <h4 style="font-size: 13px; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${item.name}</h4>
            <span style="font-size: 12px; color: var(--text-body);">${item.qty} adet</span>
          </div>
          <span style="font-size: 13px; font-weight: 700; color: var(--text-heading);">${itemTotal.toLocaleString('tr-TR')} TL</span>
        </div>
      `;
    }).join('');

    const shipping = 0; // Free
    const total = subtotal + shipping;

    container.innerHTML = `
      <h3 style="font-size: 16px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">Sipariş Özeti</h3>
      <div style="max-height: 220px; overflow-y: auto; margin-bottom: 24px;">
        ${itemsHTML}
      </div>
      <div class="coupon-box">
        <input type="text" id="coupon-code" placeholder="Kupon Kodu">
        <button class="btn btn-outline btn-sm" onclick="store.applyCoupon()">Uygula</button>
      </div>
      <div style="border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; font-size: 14px;">
        <div style="display: flex; justify-content: space-between;">
          <span>Ara Toplam</span>
          <span style="font-weight: 600;">${subtotal.toLocaleString('tr-TR')} TL</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Kargo Ücreti</span>
          <span style="font-weight: 600; color: var(--success);">Ücretsiz</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 6px; color: var(--text-heading);">
          <span>Genel Toplam</span>
          <span style="color: var(--primary);">${total.toLocaleString('tr-TR')} TL</span>
        </div>
      </div>
    `;
  }

  applyCoupon() {
    const code = document.getElementById('coupon-code')?.value;
    if (code) {
      this.showToast('Kupon başarıyla uygulandı! %10 indirim kazandınız.', 'success');
      // Simulated discount
      const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const discount = subtotal * 0.1;
      const total = subtotal - discount;
      
      const summaryHTML = `
        <div style="display: flex; justify-content: space-between;">
          <span>Ara Toplam</span>
          <span style="font-weight: 600;">${subtotal.toLocaleString('tr-TR')} TL</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--success);">
          <span>%10 Kupon İndirimi</span>
          <span>-${discount.toLocaleString('tr-TR')} TL</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Kargo Ücreti</span>
          <span style="font-weight: 600; color: var(--success);">Ücretsiz</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 800; border-top: 1px dashed var(--border); padding-top: 12px; margin-top: 6px; color: var(--text-heading);">
          <span>Genel Toplam</span>
          <span style="color: var(--primary);">${total.toLocaleString('tr-TR')} TL</span>
        </div>
      `;
      // Update totals container in the sidebar
      const totalsContainer = document.querySelector('.checkout-summary-side > div:last-child');
      if (totalsContainer) {
        totalsContainer.innerHTML = summaryHTML;
      }
    }
  }

  nextCheckoutStep() {
    if (this.checkoutStep === 1) {
      // Validate step 1 fields
      const name = document.getElementById('ch-name').value;
      const surname = document.getElementById('ch-surname').value;
      const address = document.getElementById('ch-address').value;
      
      if (!name || !surname || !address) {
        this.showToast('Lütfen gerekli tüm alanları doldurun.', 'error');
        return;
      }
    } else if (this.checkoutStep === 2) {
      // Validate card fields
      const cardNum = document.getElementById('card-number').value;
      if (!cardNum || cardNum.length < 15) {
        this.showToast('Lütfen geçerli bir kart numarası girin.', 'error');
        return;
      }
    }

    // Advance
    document.getElementById(`checkout-section-${this.checkoutStep}`).classList.remove('active');
    document.getElementById(`ch-step-${this.checkoutStep}`).classList.remove('active');
    
    this.checkoutStep++;
    
    document.getElementById(`checkout-section-${this.checkoutStep}`).classList.add('active');
    document.getElementById(`ch-step-${this.checkoutStep}`).classList.add('active');

    if (this.checkoutStep === 3) {
      // Hide close button and summary side on success screen
      document.getElementById('modal-close').style.display = 'none';
      document.getElementById('checkout-summary-side').style.display = 'none';
      document.querySelector('.checkout-form-side').style.gridColumn = '1 / -1';
    }
  }

  prevCheckoutStep() {
    if (this.checkoutStep > 1) {
      document.getElementById(`checkout-section-${this.checkoutStep}`).classList.remove('active');
      document.getElementById(`ch-step-${this.checkoutStep}`).classList.remove('active');
      
      this.checkoutStep--;
      
      document.getElementById(`checkout-section-${this.checkoutStep}`).classList.add('active');
      document.getElementById(`ch-step-${this.checkoutStep}`).classList.add('active');
    }
  }

  closeCheckoutAndClearCart() {
    this.cart = [];
    this.saveState('cart', this.cart);
    this.updateCartBadges();
    
    // Restore layout styles
    document.getElementById('modal-close').style.display = 'flex';
    document.getElementById('modal-backdrop').classList.remove('active');
    
    // Refresh products grid if there is stock limits or just refresh state
    this.renderProducts();
    this.showToast('Siparişiniz başarıyla tamamlandı. Teşekkür ederiz!', 'success');
  }

  // --- FLASH SALE COUNTDOWN ---
  startCountdown() {
    const dayEl = document.getElementById('cd-day');
    const hourEl = document.getElementById('cd-hour');
    const minEl = document.getElementById('cd-min');
    const secEl = document.getElementById('cd-sec');
    if (!dayEl && !hourEl && !minEl && !secEl) return;

    let time = 3 * 24 * 60 * 60 + 14 * 60 * 60; // 3 Days, 14 hours countdown helper
    setInterval(() => {
      if (time > 0) time--;

      const d = Math.floor(time / (24 * 3600));
      const h = Math.floor((time % (24 * 3600)) / 3600);
      const m = Math.floor((time % 3600) / 60);
      const s = time % 60;

      if (dayEl) dayEl.innerText = String(d).padStart(2, '0');
      if (hourEl) hourEl.innerText = String(h).padStart(2, '0');
      if (minEl) minEl.innerText = String(m).padStart(2, '0');
      if (secEl) secEl.innerText = String(s).padStart(2, '0');
    }, 1000);
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const id = 'toast_' + Math.random().toString(36).substr(2, 9);
    let typeIcon = '';
    if (type === 'success') typeIcon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    else if (type === 'warning') typeIcon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    else typeIcon = `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

    const html = `
      <div id="${id}" class="toast toast-${type}">
        <span class="toast-icon toast-icon-${type}">${typeIcon}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    const el = document.getElementById(id);
    
    // Animate In
    setTimeout(() => el.classList.add('active'), 50);

    // Remove toast after 3s
    setTimeout(() => {
      el.classList.remove('active');
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }
}

// Instantiate globally
window.store = new StoreEngine();
