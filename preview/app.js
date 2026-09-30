/**
 * "Use It First" (UIF) — Luxury Mobile Experience Engine
 * Featuring Studio Card Carousel, Real Bill Scanner & Donut Freshness Gauge
 */

// Core Pantry Inventory
let pantryItems = [
  {
    id: 'item-1',
    name: 'Amul Taaza Milk 1L',
    category: 'Dairy',
    quantity: '1 L',
    price: 68.0,
    location: 'FRIDGE',
    openStatus: 'OPENED',
    daysRemaining: 0,
    urgency: 'USE_TODAY',
    image: 'assets/milk.jpg',
  },
  {
    id: 'item-2',
    name: 'Artisan Paneer 200g',
    category: 'Dairy',
    quantity: '1 pack',
    price: 95.0,
    location: 'FRIDGE',
    openStatus: 'STORED',
    daysRemaining: 1,
    urgency: 'USE_TODAY',
    image: 'assets/paneer.jpg',
  },
  {
    id: 'item-3',
    name: 'Farm Spinach Bundle',
    category: 'Produce',
    quantity: '1 bundle',
    price: 35.0,
    location: 'FRIDGE',
    openStatus: 'STORED',
    daysRemaining: 4,
    urgency: 'THIS_WEEK',
    image: 'assets/spinach.jpg',
  },
  {
    id: 'item-4',
    name: 'Greek Yogurt Blueberry',
    category: 'Dairy',
    quantity: '2 cups',
    price: 120.0,
    location: 'FRIDGE',
    openStatus: 'STORED',
    daysRemaining: 6,
    urgency: 'THIS_WEEK',
  },
  {
    id: 'item-5',
    name: 'Daawat Basmati Rice 5kg',
    category: 'Pantry',
    quantity: '1 bag',
    price: 420.0,
    location: 'PANTRY',
    openStatus: 'STORED',
    daysRemaining: 182,
    urgency: 'LATER',
  },
  {
    id: 'item-6',
    name: 'Green Peas 1kg',
    category: 'Produce',
    quantity: '1 pack',
    price: 150.0,
    location: 'FREEZER',
    openStatus: 'STORED',
    daysRemaining: 138,
    urgency: 'LATER',
  },
];

let totalSavedINR = 1420.0;
let currentLocFilter = 'ALL';
let currentStateFilter = 'ALL';
let currentSearch = '';
let currentCarouselIndex = 0;

// Parsed draft items from bill OCR
let parsedDrafts = [
  { tempId: 'd1', name: 'Amul Butter 500g', loc: 'FRIDGE', days: 90, price: 275, isSelected: true },
  { tempId: 'd2', name: 'Greek Yogurt Natural', loc: 'FRIDGE', days: 12, price: 120, isSelected: true },
  { tempId: 'd3', name: 'Organic Bananas 1kg', loc: 'PANTRY', days: 3, price: 65, isSelected: true },
  { tempId: 'd4', name: 'Whole Wheat Bread', loc: 'PANTRY', days: 5, price: 50, isSelected: true },
];

// Modern Vector Category Icons (No Primitive Emojis)
function getCategoryIcon(cat) {
  const c = (cat || '').toLowerCase();
  if (c === 'dairy') {
    return `<div class="cat-svg-wrap dairy"><svg viewBox="0 0 24 24"><path d="M8 2h8v4l2 4v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V10l2-4V2z"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="2" x2="9" y2="6"/><line x1="15" y1="2" x2="15" y2="6"/></svg></div>`;
  }
  if (c === 'produce') {
    return `<div class="cat-svg-wrap produce"><svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg></div>`;
  }
  if (c === 'bakery') {
    return `<div class="cat-svg-wrap bakery"><svg viewBox="0 0 24 24"><path d="M3 14c0 4.42 3.58 8 8 8s8-3.58 8-8H3z"/><path d="M5.5 14A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 10"/><line x1="8" y1="14" x2="8.5" y2="9"/><line x1="12" y1="14" x2="12" y2="8"/><line x1="16" y1="14" x2="15.5" y2="9"/></svg></div>`;
  }
  if (c === 'meat') {
    return `<div class="cat-svg-wrap meat"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M15 9l3-3"/><path d="M9 15l-3 3"/></svg></div>`;
  }
  return `<div class="cat-svg-wrap pantry"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="3"/><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/></svg></div>`;
}

function getLocationLabel(loc) {
  switch (loc) {
    case 'FRIDGE': return 'Fridge';
    case 'FREEZER': return 'Freezer';
    case 'PANTRY': return 'Kitchen';
    default: return loc;
  }
}

// =============================================================================
// HERO CAROUSEL CONTROLLER
// =============================================================================
window.switchCarousel = function(index) {
  const cards = document.querySelectorAll('.hero-card');
  const dots = document.querySelectorAll('.c-dot');
  if (index >= cards.length) index = 0;
  if (index < 0) index = cards.length - 1;

  currentCarouselIndex = index;

  cards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });

  const counter = document.getElementById('carouselCounter');
  if (counter) counter.innerText = `${index + 1} of ${cards.length}`;
};

// Automatic carousel rotation every 6 seconds
setInterval(() => {
  const cards = document.querySelectorAll('.hero-card');
  if (cards.length > 0) {
    switchCarousel((currentCarouselIndex + 1) % cards.length);
  }
}, 6000);

// Live Countdown Timer (Ticks Every Second)
let secondsRemaining1 = 4 * 3600 + 12 * 60 + 36;
let secondsRemaining2 = 22 * 3600 + 45 * 60 + 10;

function formatHMS(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

setInterval(() => {
  if (secondsRemaining1 > 0) secondsRemaining1--;
  if (secondsRemaining2 > 0) secondsRemaining2--;

  const el1 = document.getElementById('cd1');
  const el2 = document.getElementById('cd2');
  if (el1) el1.innerText = formatHMS(secondsRemaining1);
  if (el2) el2.innerText = formatHMS(secondsRemaining2);
}, 1000);

window.quickCookCarouselItem = function(id, name) {
  switchNavTab('tabViewChef');
  showToast(`Zero-Waste Chef activated for ${name}!`);
};

// =============================================================================
// BOTTOM NAVIGATION CONTROLLER (Pixel-Perfect Dynamic Glass Capsule)
// =============================================================================
window.positionNavActivePill = function() {
  const activeBtn = document.querySelector('.nav-tab-btn.active');
  const activePill = document.getElementById('navActivePill');
  if (activeBtn && activePill) {
    const left = activeBtn.offsetLeft;
    const top = activeBtn.offsetTop;
    const width = activeBtn.offsetWidth;
    const height = activeBtn.offsetHeight;
    activePill.style.width = `${width}px`;
    activePill.style.height = `${height}px`;
    activePill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }
};

window.switchNavTab = function(tabId) {
  // Switch tabs
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');

  // Update Nav Buttons
  const navButtons = document.querySelectorAll('.nav-tab-btn');
  navButtons.forEach(btn => btn.classList.remove('active'));

  const activeBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  // Move glass active pill to the exact dynamic bounding box
  positionNavActivePill();
};

// =============================================================================
// INVENTORY & DONUT GAUGE RENDERING
// =============================================================================
function updateMetrics() {
  const total = pantryItems.length;
  const todayCount = pantryItems.filter(i => i.urgency === 'USE_TODAY').length;
  const weekCount = pantryItems.filter(i => i.urgency === 'THIS_WEEK').length;
  const laterCount = pantryItems.filter(i => i.urgency === 'LATER').length;
  const expiredCount = pantryItems.filter(i => i.urgency === 'EXPIRED').length;

  let score = 100;
  if (total > 0) {
    const points = laterCount * 100 + weekCount * 60 + todayCount * 20 + expiredCount * 0;
    score = Math.round(points / total);
  }

  const scoreEl = document.getElementById('donutScoreNum');
  if (scoreEl) scoreEl.innerText = score;

  const totalEl = document.getElementById('donutSavedTotal');
  if (totalEl) totalEl.innerText = `₹${totalSavedINR.toFixed(2)}`;

  // Counters
  document.getElementById('countLocAll').innerText = pantryItems.length;
  document.getElementById('countLocFridge').innerText = pantryItems.filter(i => i.location === 'FRIDGE').length;
  document.getElementById('countLocPantry').innerText = pantryItems.filter(i => i.location === 'PANTRY').length;
  document.getElementById('countLocFreezer').innerText = pantryItems.filter(i => i.location === 'FREEZER').length;

  document.getElementById('countStateAll').innerText = pantryItems.length;
  document.getElementById('countStateStored').innerText = pantryItems.filter(i => i.openStatus === 'STORED' && i.urgency !== 'EXPIRED').length;
  document.getElementById('countStateOpened').innerText = pantryItems.filter(i => i.openStatus === 'OPENED' && i.urgency !== 'EXPIRED').length;
  document.getElementById('countStateExpired').innerText = pantryItems.filter(i => i.urgency === 'EXPIRED').length;
}

function renderInventoryList() {
  const container = document.getElementById('itemsListContainer');
  if (!container) return;
  container.innerHTML = '';

  const filtered = pantryItems.filter(item => {
    if (currentLocFilter !== 'ALL' && item.location !== currentLocFilter) return false;
    if (currentStateFilter === 'STORED' && item.openStatus !== 'STORED') return false;
    if (currentStateFilter === 'OPENED' && item.openStatus !== 'OPENED') return false;
    if (currentStateFilter === 'EXPIRED' && item.urgency !== 'EXPIRED') return false;

    if (currentSearch.trim().length > 0) {
      const q = currentSearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }
    return true;
  });

  const priorityOrder = { USE_TODAY: 1, THIS_WEEK: 2, LATER: 3, EXPIRED: 4 };
  filtered.sort((a, b) => priorityOrder[a.urgency] - priorityOrder[b.urgency]);

  document.getElementById('listCounterLabel').innerText = `Showing ${filtered.length} of ${pantryItems.length}`;
  document.getElementById('emptyState').style.display = filtered.length === 0 ? 'block' : 'none';

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';

    let badgeClass = 'badge-green';
    let urgencyLabel = `<svg class="badge-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> ${item.daysRemaining}d Left`;

    if (item.urgency === 'USE_TODAY') {
      badgeClass = 'badge-red';
      urgencyLabel = `<svg class="badge-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${item.daysRemaining === 0 ? 'Use Today' : item.daysRemaining + 'd Left'}`;
    } else if (item.urgency === 'THIS_WEEK') {
      badgeClass = 'badge-amber';
      urgencyLabel = `<svg class="badge-svg" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${item.daysRemaining}d Left`;
    } else if (item.urgency === 'EXPIRED') {
      badgeClass = 'badge-gray';
      urgencyLabel = `<svg class="badge-svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Expired`;
    }

    const thumbHtml = item.image
      ? `<img src="${item.image}" alt="${item.name}" class="item-thumb-img">`
      : getCategoryIcon(item.category);

    card.innerHTML = `
      <div class="item-thumb-box">
        ${thumbHtml}
      </div>

      <div class="item-details-col">
        <div class="item-name-row">
          <span class="item-name" title="${item.name}">${item.name}</span>
          ${item.openStatus === 'OPENED' ? '<span class="badge-opened">Opened</span>' : ''}
        </div>
        <div class="item-meta-sub">
          ${item.quantity} • ${getLocationLabel(item.location)}
        </div>
      </div>

      <div class="item-right-col">
        <span class="item-price-val">₹${item.price.toFixed(0)}</span>
        <span class="urgency-badge ${badgeClass}">${urgencyLabel}</span>
        <div class="item-actions-row">
          <button class="mini-action-btn btn-cook" onclick="consumePantryItem('${item.id}')" title="Cooked" aria-label="Cooked">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="mini-action-btn btn-seal" onclick="togglePantrySeal('${item.id}')" title="${item.openStatus === 'STORED' ? 'Mark Opened' : 'Mark Sealed'}" aria-label="Toggle Seal">
            ${item.openStatus === 'STORED'
              ? '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
              : '<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>'}
          </button>
          <button class="mini-action-btn btn-del" onclick="discardPantryItem('${item.id}')" title="Discard" aria-label="Discard">
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// User Actions
window.consumePantryItem = function(id) {
  const target = pantryItems.find(i => i.id === id);
  if (!target) return;
  totalSavedINR += target.price;

  pantryItems = pantryItems.filter(i => i.id !== id);
  showToast(`✓ Cooked ${target.name}! Saved ₹${target.price.toFixed(0)}`);
  updateMetrics();
  renderInventoryList();
};

window.discardPantryItem = function(id) {
  const target = pantryItems.find(i => i.id === id);
  if (!target) return;

  pantryItems = pantryItems.filter(i => i.id !== id);
  showToast(`Discarded ${target.name}`);
  updateMetrics();
  renderInventoryList();
};

window.togglePantrySeal = function(id) {
  const target = pantryItems.find(i => i.id === id);
  if (!target) return;

  if (target.openStatus === 'STORED') {
    target.openStatus = 'OPENED';
    target.daysRemaining = Math.min(target.daysRemaining, 3);
    if (target.daysRemaining <= 0) target.urgency = 'EXPIRED';
    else if (target.daysRemaining <= 2) target.urgency = 'USE_TODAY';
    else if (target.daysRemaining <= 7) target.urgency = 'THIS_WEEK';
    showToast(`🔓 Seal opened! Shelf-life accelerated to ${target.daysRemaining} days`);
  } else {
    target.openStatus = 'STORED';
    showToast(`🔒 Sealed item`);
  }

  updateMetrics();
  renderInventoryList();
};

function showToast(message) {
  const toast = document.getElementById('toastPopup');
  if (!toast) return;
  toast.innerText = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// =============================================================================
// CAMERA SCANNER & OCR INGESTION (Working Real & Demo Scanner)
// =============================================================================
window.openScannerModal = function() {
  const modal = document.getElementById('cameraModal');
  if (modal) modal.classList.add('visible');
};

window.closeScannerModal = function() {
  const modal = document.getElementById('cameraModal');
  if (modal) modal.classList.remove('visible');
};

let torchActive = false;
window.toggleTorch = function() {
  torchActive = !torchActive;
  const btn = document.getElementById('btnTorchToggle');
  const box = document.getElementById('viewfinderBox');
  if (btn) btn.classList.toggle('active', torchActive);
  if (box) box.style.background = torchActive ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.05)';
};

// Real File Upload Trigger (Allows camera photo on mobile devices)
window.triggerRealFileUpload = function() {
  const fileInput = document.getElementById('realReceiptFileInput');
  if (fileInput) fileInput.click();
};

// Scanner Mode Switching (Receipt vs Barcode & Nutrition)
let currentScanMode = 'receipt';
window.setScannerMode = function(mode) {
  currentScanMode = mode;
  const tabReceipt = document.getElementById('tabModeReceipt');
  const tabBarcode = document.getElementById('tabModeBarcode');
  if (tabReceipt) tabReceipt.classList.toggle('active', mode === 'receipt');
  if (tabBarcode) tabBarcode.classList.toggle('active', mode === 'barcode');

  const paper = document.getElementById('mockReceiptPaper');
  const barcode = document.getElementById('barcodeTargetOverlay');
  const hint = document.getElementById('viewfinderHint');

  if (mode === 'barcode') {
    if (paper) paper.style.display = 'none';
    if (barcode) barcode.style.display = 'flex';
    if (hint) hint.innerText = 'Align product barcode inside frame';
  } else {
    if (paper) paper.style.display = 'flex';
    if (barcode) barcode.style.display = 'none';
    if (hint) hint.innerText = 'Align bill or tap "Upload Photo" below';
  }
};

// Shutter Click -> Show Verification Modal OR Nutrition Modal
window.captureAndReview = function() {
  const hint = document.getElementById('viewfinderHint');

  if (currentScanMode === 'barcode') {
    if (hint) hint.innerText = "Scanning Barcode: 8901262010054...";
    setTimeout(() => {
      closeScannerModal();
      const nModal = document.getElementById('nutritionModal');
      if (nModal) nModal.classList.add('visible');
      if (hint) hint.innerText = 'Align product barcode inside frame';
    }, 750);
    return;
  }

  if (hint) hint.innerText = "OCR Processing: Extracted 4 items...";
  setTimeout(() => {
    closeScannerModal();
    renderVerificationDrafts();
    const vModal = document.getElementById('verificationModal');
    if (vModal) vModal.classList.add('visible');
    if (hint) hint.innerText = 'Align bill or tap "Upload Photo" below';
  }, 750);
};

// Barcode Nutrition Modal Actions
window.closeNutritionModal = function() {
  const modal = document.getElementById('nutritionModal');
  if (modal) modal.classList.remove('visible');
};

window.addScannedBarcodeToPantry = function() {
  pantryItems.unshift({
    id: `barcode-${Date.now()}`,
    name: 'Epigamia Greek Yogurt (Vanilla 400g)',
    category: 'Dairy',
    quantity: '400g tub',
    price: 130,
    location: 'FRIDGE',
    openStatus: 'STORED',
    daysRemaining: 14,
    urgency: 'LATER',
  });
  closeNutritionModal();
  closeScannerModal();
  showToast('Added Greek Yogurt with nutrition data to Fridge!');
  updateMetrics();
  renderInventoryList();
};

// Demo Auto-Scan Animation
window.simulateAutoScan = function() {
  const hint = document.getElementById('viewfinderHint');

  if (currentScanMode === 'barcode') {
    if (hint) hint.innerText = "Scanning product barcode...";
    setTimeout(() => {
      captureAndReview();
    }, 1200);
    return;
  }

  const boxes = document.querySelectorAll('.b-box');
  if (hint) hint.innerText = "Scanning bill line-items...";

  boxes.forEach((box, i) => {
    setTimeout(() => {
      box.style.borderColor = "#38BDF8";
      box.style.background = "rgba(56, 189, 248, 0.3)";
    }, i * 350);
  });

  setTimeout(() => {
    captureAndReview();
  }, 1600);
};

// Review Modal Handling
window.closeVerificationModal = function() {
  const vModal = document.getElementById('verificationModal');
  if (vModal) vModal.classList.remove('visible');
};

function renderVerificationDrafts() {
  const container = document.getElementById('verificationItemsContainer');
  if (!container) return;
  container.innerHTML = '';

  parsedDrafts.forEach(draft => {
    const card = document.createElement('div');
    card.className = 'draft-card';
    card.innerHTML = `
      <div class="draft-top">
        <input type="checkbox" class="draft-checkbox" ${draft.isSelected ? 'checked' : ''} onchange="toggleDraftSelect('${draft.tempId}')">
        <input type="text" class="draft-name-input" value="${draft.name}" oninput="updateDraftName('${draft.tempId}', this.value)">
        <span style="font-size: 13px; font-weight: 800; color: #2563EB">₹${draft.price}</span>
      </div>
      <div class="draft-controls-row">
        <select class="draft-loc-select" onchange="updateDraftLoc('${draft.tempId}', this.value)">
          <option value="FRIDGE" ${draft.loc === 'FRIDGE' ? 'selected' : ''}>Fridge</option>
          <option value="PANTRY" ${draft.loc === 'PANTRY' ? 'selected' : ''}>Kitchen</option>
          <option value="FREEZER" ${draft.loc === 'FREEZER' ? 'selected' : ''}>Freezer</option>
        </select>
        <div class="draft-stepper">
          <button onclick="adjustDraftDays('${draft.tempId}', -1)">−</button>
          <span>${draft.days} days</span>
          <button onclick="adjustDraftDays('${draft.tempId}', 1)">+</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  updateVerificationSummary();
}

window.toggleDraftSelect = function(id) {
  const item = parsedDrafts.find(d => d.tempId === id);
  if (item) item.isSelected = !item.isSelected;
  updateVerificationSummary();
};

window.updateDraftName = function(id, val) {
  const item = parsedDrafts.find(d => d.tempId === id);
  if (item) item.name = val;
};

window.updateDraftLoc = function(id, val) {
  const item = parsedDrafts.find(d => d.tempId === id);
  if (item) item.loc = val;
};

window.adjustDraftDays = function(id, delta) {
  const item = parsedDrafts.find(d => d.tempId === id);
  if (item) {
    item.days = Math.max(1, item.days + delta);
    renderVerificationDrafts();
  }
};

function updateVerificationSummary() {
  const selected = parsedDrafts.filter(d => d.isSelected);
  const total = selected.reduce((sum, d) => sum + d.price, 0);
  const countEl = document.getElementById('draftSelectedCount');
  const totalEl = document.getElementById('draftTotalAmount');
  if (countEl) countEl.innerText = `${selected.length} items selected`;
  if (totalEl) totalEl.innerText = `Total: ₹${total}`;
}

window.confirmImportItems = function() {
  const selected = parsedDrafts.filter(d => d.isSelected);
  selected.forEach((draft, idx) => {
    let urgency = 'LATER';
    if (draft.days <= 0) urgency = 'EXPIRED';
    else if (draft.days <= 2) urgency = 'USE_TODAY';
    else if (draft.days <= 7) urgency = 'THIS_WEEK';

    pantryItems.unshift({
      id: `imported-${Date.now()}-${idx}`,
      name: draft.name,
      category: 'Produce',
      quantity: '1 unit',
      price: draft.price,
      location: draft.loc,
      openStatus: 'STORED',
      daysRemaining: draft.days,
      urgency,
    });
  });

  closeVerificationModal();
  showToast(`Added ${selected.length} scanned items to your pantry!`);
  updateMetrics();
  renderInventoryList();
};

// Logo Manifesto Modal
window.closeLogoModal = function() {
  const modal = document.getElementById('logoModal');
  if (modal) modal.classList.remove('visible');
};

// =============================================================================
// DOM EVENT WIRING
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  updateMetrics();
  renderInventoryList();

  // Logo Trigger
  const logoBtn = document.getElementById('btnLogoModalTrigger');
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      document.getElementById('logoModal').classList.add('visible');
    });
  }

  // Real File Upload Handler
  const fileInput = document.getElementById('realReceiptFileInput');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        showToast(`Analyzing real receipt: ${file.name}...`);
        const reader = new FileReader();
        reader.onload = (event) => {
          const paper = document.getElementById('mockReceiptPaper');
          if (paper) {
            paper.innerHTML = `
              <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; border-radius: 8px;">
                <img src="${event.target.result}" style="max-width: 100%; max-height: 240px; object-fit: contain; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25);" alt="Uploaded Receipt">
                <span style="font-size: 11px; color: #16A34A; font-weight: 700; margin-top: 8px; background: rgba(34, 197, 94, 0.15); padding: 2px 8px; border-radius: 10px;">✓ Real Image Loaded</span>
              </div>
            `;
          }
        };
        reader.readAsDataURL(file);

        const hint = document.getElementById('viewfinderHint');
        if (hint) hint.innerText = `Analyzing "${file.name}" with OCR...`;

        setTimeout(() => {
          captureAndReview();
        }, 1400);
      }
    });
  }

  // Search
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      if (clearSearchBtn) clearSearchBtn.style.display = currentSearch.length > 0 ? 'block' : 'none';
      renderInventoryList();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      clearSearchBtn.style.display = 'none';
      renderInventoryList();
    });
  }

  // Location Tabs
  document.querySelectorAll('.loc-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.loc-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLocFilter = btn.getAttribute('data-loc');
      document.getElementById('listSectionTitle').innerText =
        currentLocFilter === 'ALL' ? 'Pantry Inventory' : `${getLocationLabel(currentLocFilter)} Items`;
      renderInventoryList();
    });
  });

  // State Chips
  document.querySelectorAll('.state-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.state-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStateFilter = btn.getAttribute('data-state');
      renderInventoryList();
    });
  });

  // Chef Cook in Tab 3
  const chefCookBtn = document.getElementById('btnChefTabCook');
  if (chefCookBtn) {
    chefCookBtn.addEventListener('click', () => {
      const urgentItems = pantryItems.filter(i => i.urgency === 'USE_TODAY');
      urgentItems.forEach(i => {
        totalSavedINR += i.price;
      });
      pantryItems = pantryItems.filter(i => i.urgency !== 'USE_TODAY');
      showToast('Recipe cooked! Saved ₹185 waste!');
      updateMetrics();
      renderInventoryList();
      switchNavTab('tabViewHome');
    });
  }

  // Restore Theme preference if saved
  const savedTheme = localStorage.getItem('uif-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('theme-light');
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');
    if (sun) sun.style.display = 'none';
    if (moon) moon.style.display = 'block';
  }

  // Initialize dynamic nav active pill positioning
  positionNavActivePill();
  requestAnimationFrame(positionNavActivePill);
  setTimeout(positionNavActivePill, 100);
  window.addEventListener('resize', positionNavActivePill);
});

// =============================================================================
// THEME CONTROLLER (Dark / Light Luxury Mode)
// =============================================================================
window.toggleTheme = function() {
  const isLight = document.body.classList.toggle('theme-light');
  const sun = document.querySelector('.sun-icon');
  const moon = document.querySelector('.moon-icon');
  if (sun && moon) {
    sun.style.display = isLight ? 'none' : 'block';
    moon.style.display = isLight ? 'block' : 'none';
  }
  localStorage.setItem('uif-theme', isLight ? 'light' : 'dark');
  showToast(isLight ? 'Switched to Light Luxury Mode' : 'Switched to Dark OLED Mode');
  positionNavActivePill();
};

// =============================================================================
// ZERO-WASTE CHEF RECIPE DATABASE BY DIETARY PREFERENCE
// =============================================================================
const recipesByDiet = {
  all: {
    title: 'Quick Rescue Palak Paneer',
    score: '★ 94% Waste Rescue Score',
    desc: 'A creamy, nutrient-dense 20-minute Palak Paneer utilizing your expiring milk, paneer, and fresh spinach.',
    time: '20 mins',
    kcal: '380 kcal',
    saved: 'Saves ₹185 waste',
    chips: [
      { text: 'Milk (Expires Today)', urgent: true },
      { text: 'Paneer 200g (1d left)', urgent: true },
      { text: 'Spinach (3d left)', urgent: false }
    ],
    steps: [
      'Blanch spinach in boiling salted water for 2 minutes; blend into a smooth green purée.',
      'Heat 1 tbsp cooking oil in a skillet; sauté cumin seeds, garlic, and sliced onions until golden.',
      'Pour in the spinach purée and simmer for 3 minutes on medium flame.',
      'Cube the paneer and gently fold into the warm gravy; cook for 2 minutes.',
      'Serve hot with warm roti, paratha, or steamed rice. Enjoy zero-waste dining!'
    ]
  },
  vegetarian: {
    title: 'Rich Mughlai Shahi Paneer & Saag',
    score: '★ 96% Waste Rescue Score',
    desc: 'Silky, aromatic paneer simmered in a spiced tomato-cashew reduction, enriched with your expiring fresh milk.',
    time: '22 mins',
    kcal: '410 kcal',
    saved: 'Saves ₹195 waste',
    chips: [
      { text: 'Paneer 200g (1d left)', urgent: true },
      { text: 'Amul Milk 1L (Expires Today)', urgent: true },
      { text: 'Spinach Garnish (3d left)', urgent: false }
    ],
    steps: [
      'Blend soaked cashews with 1/2 cup expiring milk into a silky rescue cream.',
      'Sauté ginger, garlic paste, and Kashmiri chili in butter until fragrant.',
      'Add pureed gravy base and remaining milk; simmer on low heat for 5 minutes.',
      'Gently fold in fresh paneer cubes and crushed kasuri methi.',
      'Garnish with finely shredded fresh spinach and serve hot.'
    ]
  },
  vegan: {
    title: 'Crispy Garlic Tofu & Wilted Green Bowl',
    score: '★ 91% Waste Rescue Score',
    desc: '100% plant-based rescue stir-fry packed with dark greens, sesame seeds, and plant proteins.',
    time: '14 mins',
    kcal: '290 kcal',
    saved: 'Saves ₹140 waste',
    chips: [
      { text: 'Spinach Bundle (3d left)', urgent: false },
      { text: 'Pantry Sesame Oil', urgent: false },
      { text: 'Garlic Cloves', urgent: false }
    ],
    steps: [
      'Press and cube firm tofu; pan-sear in sesame oil until edges are deeply golden and crisp.',
      'Toss in sliced garlic, chili flakes, and your fresh spinach leaves.',
      'Flash-sauté on high heat for 90 seconds until spinach wilts but retains emerald brightness.',
      'Drizzle with light soy sauce and toasted sesame seeds. Serve immediately!'
    ]
  },
  keto: {
    title: 'Garlic Butter Paneer & Herb Greens Skillet',
    score: '★ 95% Waste Rescue Score',
    desc: 'Ultra-low carb keto skillet (4g net carbs) loaded with wholesome fats and nutrient-rich greens.',
    time: '12 mins',
    kcal: '430 kcal',
    saved: 'Saves ₹185 waste',
    chips: [
      { text: 'Paneer 200g (1d left)', urgent: true },
      { text: 'Farm Spinach (3d left)', urgent: false },
      { text: 'Grass-Fed Butter', urgent: false }
    ],
    steps: [
      'Melt 2 tbsp grass-fed butter in a heavy-bottom cast iron skillet.',
      'Pan-sear paneer cubes with black pepper and sea salt until lightly crusted.',
      'Add washed spinach leaves directly into the sizzling garlic butter.',
      'Cook for 2 minutes until tender. Enjoy a delicious zero-carb, zero-waste feast!'
    ]
  },
  protein: {
    title: 'Power-Packed Paneer & Green Bhurji Scramble',
    score: '★ 98% Waste Rescue Score',
    desc: 'A 34g protein athlete breakfast or post-workout dinner transforming expiring milk and paneer.',
    time: '15 mins',
    kcal: '460 kcal',
    saved: 'Saves ₹200 waste',
    chips: [
      { text: 'Paneer 200g (1d left)', urgent: true },
      { text: 'Milk 1L (Expires Today)', urgent: true },
      { text: 'Spinach Leaves', urgent: false }
    ],
    steps: [
      'Crumble the fresh paneer finely with your hands.',
      'Sauté diced onions, tomatoes, and chopped green chilies in 1 tsp olive oil.',
      'Add scrambled paneer, 2 tbsp milk for moisture, and shredded spinach leaves.',
      'Stir vigorously on medium heat for 3 minutes until aromatic and fluffy.',
      'Plate with a dash of chaat masala and fresh coriander.'
    ]
  },
  glutenfree: {
    title: 'Gluten-Free Herbed Spinach & Paneer Pilaf',
    score: '★ 93% Waste Rescue Score',
    desc: 'Naturally wheat-free fragrant rice pilaf infusing expiring greens and cottage cheese.',
    time: '20 mins',
    kcal: '360 kcal',
    saved: 'Saves ₹175 waste',
    chips: [
      { text: 'Spinach Purée (3d left)', urgent: false },
      { text: 'Paneer 200g (1d left)', urgent: true },
      { text: 'Basmati Rice', urgent: false }
    ],
    steps: [
      'Rinse basmati rice; cook until grains are fluffy and separate.',
      'In a wide pan, temper mustard seeds and curry leaves in ghee.',
      'Pour in spinach purée and sauté paneer cubes for 3 minutes.',
      'Gently fold in warm rice, ensuring every grain is coated in vibrant emerald sauce.',
      'Serve warm with cooling cucumber raita.'
    ]
  }
};

window.filterChefDiet = function(dietKey) {
  document.querySelectorAll('.diet-chip').forEach(chip => {
    chip.classList.toggle('active', chip.getAttribute('data-diet') === dietKey);
  });

  const recipe = recipesByDiet[dietKey] || recipesByDiet.all;
  const titleEl = document.getElementById('chefTabRecipeTitle');
  const descEl = document.getElementById('chefTabRecipeDesc');

  if (titleEl) titleEl.innerText = recipe.title;
  if (descEl) descEl.innerText = recipe.desc;

  const statRow = document.querySelector('.recipe-hero-card .recipe-stats-row');
  if (statRow) {
    statRow.innerHTML = `
      <span class="r-stat">
        <svg class="stat-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${recipe.time}
      </span>
      <span class="r-stat">
        <svg class="stat-svg" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>
        ${recipe.kcal}
      </span>
      <span class="r-stat">
        <svg class="stat-svg" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        ${recipe.saved}
      </span>
    `;
  }

  const chipsList = document.querySelector('.recipe-hero-card .rescued-chips-list');
  if (chipsList) {
    chipsList.innerHTML = recipe.chips.map(c =>
      `<span class="r-chip ${c.urgent ? 'urgent-chip' : 'warning-chip'}">${c.text}</span>`
    ).join('');
  }

  const stepsList = document.querySelector('.recipe-hero-card .steps-ol');
  if (stepsList) {
    stepsList.innerHTML = recipe.steps.map(s => `<li>${s}</li>`).join('');
  }

  showToast(`Zero-Waste Chef tuned for ${dietKey.toUpperCase()} diet!`);
};
