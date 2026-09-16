/* ============================================================
   SAM'S CAFFÉ LOYALTY WEBAPP — App Logic
   Mock CRM + State Management
   ============================================================ */

// ── Mock User State ───────────────────────────────────────────
const AppState = {
  user: null,
  isLoggedIn: false,
  currentPage: 'home',

  init() {
    const saved = localStorage.getItem('sc-user');
    if (saved) {
      this.user = JSON.parse(saved);
      this.isLoggedIn = true;
    }
  },

  saveUser(userData) {
    this.user = userData;
    this.isLoggedIn = true;
    localStorage.setItem('sc-user', JSON.stringify(userData));
  },

  logout() {
    this.user = null;
    this.isLoggedIn = false;
    localStorage.removeItem('sc-user');
  }
};

// ── Mock CRM API ──────────────────────────────────────────────
const CRM = {
  // Mock delay to simulate real API calls
  delay: (ms) => new Promise(r => setTimeout(r, ms)),

  async getUser(phone) {
    await this.delay(600);
    // Mock user data — replace with real CRM endpoint
    return {
      id: 'USR-001',
      name: 'Ahmad Rizal',
      phone: phone,
      email: 'ahmad@example.com',
      points: 347,
      lifetimePoints: 1240,
      tier: 'silver',   // bronze | silver | gold
      joinDate: '2025-03-15',
      transactions: [
        { id: 'T001', type: 'earn', pts: +28, desc: 'Lunch visit', date: 'Today, 12:30 PM' },
        { id: 'T002', type: 'earn', pts: +14, desc: 'Coffee & cake', date: 'Yesterday, 3:00 PM' },
        { id: 'T003', type: 'redeem', pts: -100, desc: 'Free Coffee redeemed', date: '13 Sept 2026' },
        { id: 'T004', type: 'earn', pts: +42, desc: 'Birthday dinner', date: '10 Sept 2026' },
        { id: 'T005', type: 'earn', pts: +19, desc: 'Pasta & drinks', date: '8 Sept 2026' },
      ]
    };
  },

  async getPromos() {
    await this.delay(400);
    return [
      {
        id: 'P001', icon: '☕', iconClass: 'coffee',
        title: 'Free Coffee', titleBm: 'Kopi Percuma',
        desc: 'Redeem for any hot or iced coffee', descBm: 'Tukar untuk kopi panas atau ais',
        pts: 100, category: 'beverage', available: true
      },
      {
        id: 'P002', icon: '🏷️', iconClass: 'discount',
        title: '10% Off Your Bill', titleBm: 'Diskaun 10% Bil Anda',
        desc: 'Valid on total bill above RM30', descBm: 'Sah untuk bil melebihi RM30',
        pts: 250, category: 'discount', available: true
      },
      {
        id: 'P003', icon: '🍽️', iconClass: 'meal',
        title: 'Free Main Course', titleBm: 'Hidangan Utama Percuma',
        desc: 'Choose any western main on the menu', descBm: 'Pilih mana-mana hidangan utama Barat',
        pts: 500, category: 'food', available: true
      },
      {
        id: 'P004', icon: '🎂', iconClass: 'coffee',
        title: 'Birthday Free Slice', titleBm: 'Hirisan Kek Hari Jadi Percuma',
        desc: 'Free cake slice on your birthday month', descBm: 'Hirisan kek percuma pada bulan hari jadi anda',
        pts: 0, category: 'special', available: true, special: true
      },
      {
        id: 'P005', icon: '☕', iconClass: 'coffee',
        title: '2x Points Weekend', titleBm: 'Mata Berganda Hujung Minggu',
        desc: 'Double points every Sat & Sun this month', descBm: 'Mata berganda setiap Sabtu & Ahad bulan ini',
        pts: 0, category: 'special', available: true, special: true
      }
    ];
  },

  async redeemPromo(userId, promoId, pts) {
    await this.delay(800);
    // Mock: deduct points from state
    AppState.user.points = Math.max(0, AppState.user.points - pts);
    AppState.saveUser(AppState.user);
    return { success: true, newBalance: AppState.user.points, code: 'SC-' + Math.random().toString(36).substr(2, 6).toUpperCase() };
  }
};

// ── Navigation ────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  const tab = document.getElementById('tab-' + pageId);
  if (page) page.classList.add('active');
  if (tab) tab.classList.add('active');

  AppState.currentPage = pageId;
  window.scrollTo(0, 0);

  // Load page data
  if (pageId === 'home') renderHome();
  if (pageId === 'promos') renderPromos();
  if (pageId === 'profile') renderProfile();
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Tier Info ─────────────────────────────────────────────────
function getTierInfo(tier) {
  const tiers = {
    bronze: { label: 'Bronze', next: 'Silver', emoji: '🥉', nextPts: 500, class: 'tier-bronze' },
    silver: { label: 'Silver', next: 'Gold', emoji: '🥈', nextPts: 1500, class: 'tier-silver' },
    gold:   { label: 'Gold', next: null, emoji: '🥇', nextPts: null, class: 'tier-gold' },
  };
  return tiers[tier] || tiers.bronze;
}

// ── Render Home ───────────────────────────────────────────────
function renderHome() {
  const u = AppState.user;
  if (!u) return;
  const tier = getTierInfo(u.tier);
  const pct = Math.min(100, Math.round((u.points / 500) * 100));

  document.getElementById('h-greeting').textContent = `Welcome back, ${u.name.split(' ')[0]} 👋`;
  document.getElementById('h-points').textContent = u.points;
  document.getElementById('h-points-ring').style.setProperty('--pct', pct + '%');
  document.getElementById('h-tier-badge').innerHTML = `<span class="tier-badge ${tier.class}">${tier.emoji} ${tier.label}</span>`;

  // Progress to next tier
  if (tier.next) {
    const progress = Math.round((u.lifetimePoints / tier.nextPts) * 100);
    document.getElementById('h-progress-fill').style.width = Math.min(100, progress) + '%';
    document.getElementById('h-tier-progress-text').textContent = `${u.lifetimePoints} / ${tier.nextPts} pts to ${tier.next}`;
  }

  // Recent activity
  const actFeed = document.getElementById('h-activity');
  actFeed.innerHTML = u.transactions.slice(0, 3).map(t => `
    <div class="activity-item">
      <div class="activity-icon ${t.type}">${t.type === 'earn' ? '💰' : '🎁'}</div>
      <div class="activity-info">
        <div class="activity-title">${t.desc}</div>
        <div class="activity-date">${t.date}</div>
      </div>
      <div class="activity-pts ${t.type}">${t.pts > 0 ? '+' : ''}${t.pts} pts</div>
    </div>
  `).join('');
}

// ── Render Promos ─────────────────────────────────────────────
async function renderPromos() {
  const container = document.getElementById('promos-list');
  if (!container) return;
  container.innerHTML = '<p style="padding:20px;color:var(--text-soft);">Loading promos...</p>';

  const promos = await CRM.getPromos();
  const userPts = AppState.user?.points || 0;

  container.innerHTML = promos.map(p => `
    <div class="promo-card ${p.pts > userPts && !p.special ? 'locked' : ''}" id="promo-${p.id}" style="${p.pts > userPts && !p.special ? 'opacity:0.55;' : ''}">
      <div class="promo-icon ${p.iconClass}">${p.icon}</div>
      <div class="promo-info">
        <div class="promo-title">${p.title}</div>
        <div class="promo-desc">${p.desc}</div>
      </div>
      ${p.special
        ? `<span style="background:rgba(74,103,65,0.12);color:var(--green);font-size:0.72rem;font-weight:700;padding:5px 10px;border-radius:999px;white-space:nowrap;">Active</span>`
        : `<div>
            <div class="promo-pts">${p.pts} pts</div>
            <button class="btn btn-sm btn-inline ${p.pts <= userPts ? 'btn-gold' : 'btn-outline'} mt-4" 
              onclick="openRedeemModal('${p.id}', '${p.title}', ${p.pts})"
              ${p.pts > userPts ? 'disabled' : ''}
              id="redeem-btn-${p.id}">
              ${p.pts <= userPts ? 'Redeem' : 'Need more pts'}
            </button>
           </div>`
      }
    </div>
  `).join('');
}

// ── Render Profile ────────────────────────────────────────────
function renderProfile() {
  const u = AppState.user;
  if (!u) return;
  const tier = getTierInfo(u.tier);
  document.getElementById('prof-name').textContent = u.name;
  document.getElementById('prof-phone').textContent = u.phone;
  document.getElementById('prof-points').textContent = u.points + ' pts';
  document.getElementById('prof-tier').innerHTML = `<span class="tier-badge ${tier.class}">${tier.emoji} ${tier.label} Member</span>`;
  document.getElementById('prof-joined').textContent = 'Member since ' + new Date(u.joinDate).toLocaleDateString('en-MY', { year: 'numeric', month: 'long' });
}

// ── Redeem Modal ──────────────────────────────────────────────
let redeemTarget = null;

function openRedeemModal(promoId, title, pts) {
  redeemTarget = { promoId, title, pts };
  document.getElementById('redeem-modal-title').textContent = title;
  document.getElementById('redeem-modal-pts').textContent = pts + ' points';
  document.getElementById('redeem-modal-balance').textContent = `Your balance: ${AppState.user.points} pts → ${AppState.user.points - pts} pts after`;
  document.getElementById('redeem-modal').classList.add('open');
}

function closeRedeemModal() {
  document.getElementById('redeem-modal').classList.remove('open');
  redeemTarget = null;
}

async function confirmRedeem() {
  if (!redeemTarget) return;
  const btn = document.getElementById('confirm-redeem-btn');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  const result = await CRM.redeemPromo(AppState.user.id, redeemTarget.promoId, redeemTarget.pts);

  closeRedeemModal();
  if (result.success) {
    // Show success code
    document.getElementById('success-code').textContent = result.code;
    document.getElementById('success-item').textContent = redeemTarget.title;
    document.getElementById('success-new-pts').textContent = result.newBalance + ' pts';
    document.getElementById('success-modal').classList.add('open');
    renderHome();
  }
  btn.textContent = 'Confirm Redeem';
  btn.disabled = false;
}

// ── WhatsApp Login Flow ───────────────────────────────────────
async function initiateWALogin() {
  const phone = document.getElementById('login-phone').value.trim();
  if (!phone) { showToast('Please enter your phone number'); return; }

  // Open WhatsApp with a pre-filled verification message
  const waLink = `https://wa.me/60123456789?text=Hi+Sam%27s+Caff%C3%A9%21+Please+verify+my+loyalty+account+for+${encodeURIComponent(phone)}`;
  window.open(waLink, '_blank');

  // Show OTP step after 1.5s (in real app, bot would send this)
  document.getElementById('login-step-1').style.display = 'none';
  document.getElementById('login-step-2').style.display = 'block';

  // Auto-fill mock OTP after 2s
  setTimeout(() => {
    const inputs = document.querySelectorAll('.otp-input');
    const mockOtp = '481623';
    inputs.forEach((inp, i) => { inp.value = mockOtp[i] || ''; });
    showToast('📩 OTP received from WhatsApp!');
  }, 2200);
}

async function verifyOTP() {
  const inputs = document.querySelectorAll('.otp-input');
  const otp = Array.from(inputs).map(i => i.value).join('');
  if (otp.length < 6) { showToast('Please enter the full OTP'); return; }

  const btn = document.getElementById('verify-btn');
  btn.textContent = 'Verifying...';
  btn.disabled = true;

  // Mock API call
  const phone = document.getElementById('login-phone').value || '+60 12-345 6789';
  const userData = await CRM.getUser(phone);
  AppState.saveUser(userData);

  showToast('✅ Welcome to Sam\'s Loyalty!');
  setTimeout(() => {
    document.getElementById('onboard-screen').style.display = 'none';
    document.getElementById('app-screen').style.display = 'block';
    showPage('home');
  }, 800);
}

// ── Demo Mode — Auto-skip login ───────────────────────────────
const DEMO_USER = {
  id: 'USR-001',
  name: 'Ahmad Rizal',
  phone: '+60 12-345 6789',
  email: 'ahmad@example.com',
  points: 347,
  lifetimePoints: 1240,
  tier: 'silver',
  joinDate: '2025-03-15',
  transactions: [
    { id: 'T001', type: 'earn', pts: +28, desc: 'Lunch visit', date: 'Today, 12:30 PM' },
    { id: 'T002', type: 'earn', pts: +14, desc: 'Coffee & cake', date: 'Yesterday, 3:00 PM' },
    { id: 'T003', type: 'redeem', pts: -100, desc: 'Free Coffee redeemed', date: '13 Sept 2026' },
    { id: 'T004', type: 'earn', pts: +42, desc: 'Birthday dinner', date: '10 Sept 2026' },
    { id: 'T005', type: 'earn', pts: +19, desc: 'Pasta & drinks', date: '8 Sept 2026' },
  ]
};

// ── OTP Auto-advance ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();

  // MVP Demo: auto-login with demo user, skip onboarding
  if (!AppState.isLoggedIn) {
    AppState.saveUser(DEMO_USER);
  }

  document.getElementById('onboard-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  showPage('home');

  // OTP input auto-advance
  document.querySelectorAll('.otp-input').forEach((input, idx, arr) => {
    input.addEventListener('input', () => {
      if (input.value && idx < arr.length - 1) arr[idx + 1].focus();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && idx > 0) arr[idx - 1].focus();
    });
  });

  // Close modals on overlay click
  document.getElementById('redeem-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'redeem-modal') closeRedeemModal();
  });
});
