'use strict';
/* =====================================================================
   Atharha (أثرها) - app logic connected to Supabase
   Depends on: config.js, supabase-js, content.js
   ===================================================================== */

const CFG = window.ATHARHA_CONFIG;
const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'atharha-auth' }
});

/* ================= state ================= */
const S = {
  screen: 'loading', q: 0, ans: {}, draft: null, uid: null, profile: null,
  products: [], adopted: new Set(), leaves: 0, tab: 'result',
  learnSeg: 'facts', commSeg: 'posts', lbSeg: 'people', flipped: new Set(),
  trivia: { i: 0, done: {} }, plastic: 4, history: [], retest: false,
  challenge: { no: 0, days: 0, today: false, claimed: false },
  team: null, teamForm: { color: 0 }, feed: [], board: { people: [], teams: [] },
  stats: { users: 0, swaps: 0, teams: 0 }, postImg: null, img: null, busy: false
};

/* ================= helpers ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const todayRiyadh = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);

function toast(t) {
  const L = $('#layer'); const old = L.querySelector('.toast'); if (old) old.remove();
  const e = document.createElement('div'); e.className = 'toast'; e.textContent = t; L.appendChild(e);
  setTimeout(() => e.remove(), 2600);
}
function confetti(n = 18) {
  if (reduceMotion) return; const L = $('#layer');
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div'); d.className = 'confetti'; const s = 12 + Math.random() * 14;
    d.style.cssText = `left:${Math.random() * 100}vw;width:${s}px;height:${s}px;animation-duration:${1.4 + Math.random() * 1.4}s;animation-delay:${Math.random() * .3}s;color:${['var(--kelp)', 'var(--sun)', 'var(--reef)', 'var(--sea2)'][i % 4]}`;
    d.innerHTML = I.leaf; L.appendChild(d); setTimeout(() => d.remove(), 3200);
  }
}
const levelOf = l => { let i = 0; LEVELS.forEach((v, k) => { if (l >= v[1]) i = k }); return i };
function levelUp(i) {
  confetti(30); const d = document.createElement('div'); d.className = 'levelup';
  d.innerHTML = `<div class="sheet"><div class="plant">${PLANTS[i]}</div><span class="eyebrow">مستوى جديد</span><h2>صرتي ${LEVELS[i][0]}!</h2><p class="note">كل بديل تعتمدينه يكبّر أثرك الطيب.</p><button class="btn sea" data-close-layer>يا سلام</button></div>`;
  $('#layer').appendChild(d);
}
function friendlyError(e) {
  const m = (e && (e.message || e.error_description)) || '';
  if (/links_not_allowed/.test(m)) return 'ممنوع الروابط والإيميلات في المشاركات';
  if (/phone_not_allowed/.test(m)) return 'ممنوع أرقام الجوال في المشاركات';
  if (/Failed to fetch|NetworkError|network/i.test(m)) return 'تأكدي من اتصالك بالإنترنت وحاولي مرة ثانية';
  if (/anonymous/i.test(m)) return 'التسجيل متوقف مؤقتًا، حاولي بعد شوي';
  return 'صار خطأ، حاولي مرة ثانية';
}
async function call(promise) {
  const { data, error } = await promise;
  if (error) { console.error(error); throw error; }
  return data;
}

/* ================= server actions ================= */
async function award(action, ref = '', why = '') {
  try {
    const before = levelOf(S.leaves);
    const total = await call(sb.rpc('award', { p_action: action, p_ref: String(ref) }));
    const gained = total - S.leaves; S.leaves = total;
    if (S.screen === 'app') { const y = scrollY; render(); scrollTo(0, y); }
    const b = $('.leaves'); if (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    const after = levelOf(S.leaves);
    if (after > before) setTimeout(() => levelUp(after), 350);
    else if (gained > 0) toast(`+${gained} ورقة${why ? ' · ' + why : ''}`);
  } catch (e) { toast(friendlyError(e)); }
}

async function loadAll() {
  const uid = S.uid;
  const [prof, assess, prods, swaps, events] = await Promise.all([
    call(sb.from('profiles').select('*').eq('id', uid).maybeSingle()),
    call(sb.from('assessments').select('answers,score,is_retest,created_at').eq('user_id', uid).order('created_at')),
    call(sb.from('products').select('name,indicators').eq('user_id', uid).order('created_at')),
    call(sb.from('swaps').select('swap_id').eq('user_id', uid)),
    call(sb.from('leaf_events').select('action,ref').eq('user_id', uid))
  ]);
  S.profile = prof; if (!prof) return false;
  S.leaves = prof.leaves;
  S.products = prods.map(p => ({ name: p.name, hits: p.indicators || [] }));
  S.adopted = new Set(swaps.map(s => s.swap_id));
  const MO = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  S.history = assess.map((a, i) => ({ score: a.score, label: i ? MO[new Date(a.created_at).getMonth()] : 'البداية' }));
  if (assess.length) S.ans = assess[assess.length - 1].answers || {};
  S.trivia.done = {};
  events.filter(e => e.action === 'trivia').forEach(e => { S.trivia.done[+e.ref] = { ok: true } });
  S.challenge.no = events.filter(e => e.action === 'challenge_done').length;
  await loadChallenge();
  return assess.length > 0;
}
async function loadChallenge() {
  const rows = await call(sb.from('challenge_days').select('day').eq('user_id', S.uid).eq('challenge_no', S.challenge.no));
  S.challenge.days = rows.length;
  S.challenge.today = rows.some(r => r.day === todayRiyadh());
  S.challenge.claimed = false;
}
async function loadCommunity() {
  try {
    const [feed, people, teams, stats, team] = await Promise.all([
      call(sb.rpc('feed')), call(sb.rpc('leaderboard_people', { p_limit: 30 })),
      call(sb.rpc('leaderboard_teams', { p_limit: 20 })), call(sb.rpc('community_stats')), call(sb.rpc('my_team'))
    ]);
    S.feed = feed; S.board = { people, teams }; S.stats = stats[0] || S.stats; S.team = team[0] || null;
    if (S.tab === 'community' || S.tab === 'challenges') { const y = scrollY; render(); scrollTo(0, y); }
  } catch (e) { toast(friendlyError(e)); }
}
const imageUrl = path => path ? sb.storage.from('post-images').getPublicUrl(path).data.publicUrl : '';

async function shrinkImage(dataUrl, max = 1080) {
  const img = new Image(); img.src = dataUrl; await img.decode();
  const k = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return await new Promise(r => c.toBlob(r, 'image/jpeg', .82));
}

/* ================= scoring ================= */
function compute() {
  const by = {}; for (const k in SOURCES) by[k] = 0;
  for (const q of QUESTIONS) { if (!q.src) continue; const a = S.ans[q.id]; if (a !== undefined) by[q.src] += q.o[+a][2] }
  by.products = prodPts();
  const reduced = SWAPS.filter(s => S.adopted.has(s.id)).reduce((s, w) => s + w.red(S.ans), 0);
  const raw = Object.values(by).reduce((a, b) => a + b, 0);
  return { by, raw, score: Math.max(0, raw - reduced), reduced };
}
const level = s => s < 30 ? ['منخفض', 'low'] : s < 60 ? ['متوسط', 'mid'] : ['مرتفع', 'high'];
const avColor = n => ['var(--sea2)', 'var(--reef)', 'var(--kelp)', 'var(--sun)'][[...String(n)].reduce((a, c) => a + c.charCodeAt(0), 0) % 4];

/* ================= screens ================= */
function topbar() {
  return `<div class="bar"><div class="brand">${I.logo}<span>أثرها</span></div>${S.profile ? `<button class="leaves" data-account aria-label="حسابي وأوراقي">${I.leaf}<span>${S.leaves}</span></button>` : ''}</div>`
}
function go(screen) { S.screen = screen; render(); scrollTo(0, 0) }

function loading() { return `${topbar()}<section class="screen" style="align-items:center;justify-content:center;min-height:60vh"><div style="width:120px">${PLANTS[0]}</div><p class="note">لحظة...</p></section>` }

function welcome() {
  return `${topbar()}
<section class="screen">
  <div class="hero">
    <div class="big" style="color:var(--onsea)">${I.logo}</div>
    <h1>كم أثر «الكيميائيات الأبدية» عليك؟</h1>
    <p>مواد PFAS ما تتحلل، وتتراكم في الماء والتربة وأجسامنا. جاوبي على أسئلة سريعة، وافحصي منتجاتك، واعرفي نسبة تعرّضك، واجمعي أوراق مع كل بديل مستدام.</p>
    <svg class="waves" viewBox="0 0 400 90" preserveAspectRatio="none"><path d="M0 40c50-20 100 20 150 0s100-20 150 0 70 15 100 5v45H0Z" fill="currentColor"/></svg>
  </div>
  <div class="facts"><div class="fact"><b>١٠</b><span>أسئلة</span></div><div class="fact"><b>٣</b><span>دقائق</span></div><div class="fact"><b>٤</b><span>مستويات تكبر فيها</span></div></div>
  <div class="card" style="flex-direction:row;align-items:center;gap:12px"><div style="width:64px;flex:none">${PLANTS[0]}</div><p class="note" style="font-size:.85rem">تبدئين <b style="color:var(--kelp)">بذرة</b>، ومع كل بديل تعتمدينه تكبرين لين تصيرين <b style="color:var(--kelp)">واحة</b>.</p></div>
  <button class="btn" data-go="account">ابدئي</button>
  <a class="demo" href="privacy.html" target="_blank" rel="noopener">سياسة الخصوصية</a>
</section>`}

const HEALTH = ['أمراض الغدة الدرقية', 'أمراض الكبد', 'أمراض الكلى', 'ارتفاع الكوليسترول', 'ضعف المناعة', 'حمل أو رضاعة', 'لا يوجد', 'أفضّل عدم الإجابة'];
function account() {
  const u = S.draft || {}; const sel = (id, opts, v) => `<select id="f-${id}"><option value="">اختاري</option>${opts.map(a => `<option ${v === a ? 'selected' : ''}>${a}</option>`).join('')}</select>`;
  const ref = new URLSearchParams(location.search).get('ref') || u.ref || '';
  return `${topbar()}
<section class="screen">
  <div><h2>أنشئي حسابك</h2><p class="note">بياناتك تنحفظ بأمان، وتقدرين تحذفين حسابك في أي وقت.</p></div>
  <form class="card" id="acc" novalidate>
    <span class="eyebrow">بياناتك</span>
    <div class="field"><label for="f-name">الاسم</label><input id="f-name" autocomplete="name" maxlength="40" value="${esc(u.name)}"><span class="err" id="e-name"></span></div>
    <div class="field"><label for="f-email">البريد الإلكتروني</label><input id="f-email" type="email" inputmode="email" dir="ltr" autocomplete="email" value="${esc(u.email)}"><span class="err" id="e-email"></span></div>
    <div class="field"><label for="f-phone">رقم الجوال (اختياري)</label><input id="f-phone" type="tel" inputmode="tel" dir="ltr" placeholder="05XXXXXXXX" value="${esc(u.phone)}"><small>نتواصل معك عليه إذا فزتي بجائزة.</small><span class="err" id="e-phone"></span></div>
    <div class="two">
      <div class="field"><label for="f-age">العمر</label>${sel('age', ['أقل من 18', '18 - 24', '25 - 34', '35 - 44', '45 فأكثر'], u.age)}<span class="err" id="e-age"></span></div>
      <div class="field"><label for="f-edu">التعليم</label>${sel('edu', ['متوسط أو أقل', 'ثانوي', 'جامعي', 'دراسات عليا'], u.edu)}</div>
    </div>
    <div class="two">
      <div class="field"><label for="f-dist">الحي في جدة</label><input id="f-dist" maxlength="40" placeholder="مثل: الروضة" value="${esc(u.dist)}"></div>
      <div class="field"><label for="f-fam">أفراد الأسرة</label>${sel('fam', ['1 - 2', '3 - 4', '5 - 6', '7 فأكثر'], u.fam)}</div>
    </div>
    <div class="field"><label for="f-ref">كود دعوة (اختياري)</label><input id="f-ref" dir="ltr" maxlength="12" placeholder="AZH-1234" value="${esc(ref)}"></div>
    <span class="eyebrow">صحتك (اختياري)</span>
    <label class="consent"><input type="checkbox" id="f-consent" ${u.consent ? 'checked' : ''}><span>أوافق على حفظ بياناتي واستخدامها بدون اسمي في دراسة بيئية توعوية عن التعرّض لمواد PFAS في البيوت، كما في <a href="privacy.html" target="_blank" rel="noopener">سياسة الخصوصية</a>، وأقدر أحذف حسابي في أي وقت.<span id="minor" hidden> وبما إن عمري أقل من 18، وافق ولي أمري على مشاركتي.</span></span></label>
    <span class="err" id="e-consent"></span>
    <button class="btn sea" type="submit" id="acc-btn">التالي: الأسئلة</button>
  </form>
</section>`}

function quiz() {
  const q = QUESTIONS[S.q]; const a = S.ans[q.id];
  const opts = q.type === 'plastic'
    ? `<div class="plastics">${q.o.map((o, i) => `<button class="ptile" data-opt="${i}" aria-pressed="${a === String(i)}">${i < 7 ? I.bottle(o[0]) : I.jar}<span>${o[i < 7 ? 1 : 0]}</span></button>`).join('')}</div>`
    : `<div class="opts">${q.o.map((o, i) => `<button class="opt" data-opt="${i}" aria-pressed="${a === String(i)}"><span class="dot"></span><span>${o[0]}${o[1] ? `<em>${o[1]}</em>` : ''}</span></button>`).join('')}</div>`;
  return `${topbar()}
<section class="screen">
  <div class="progress" aria-label="سؤال ${S.q + 1} من ${QUESTIONS.length}">${QUESTIONS.map((_, i) => `<i class="${i <= S.q ? 'on' : ''}"></i>`).join('')}</div>
  <div class="qhead"><div class="qicon">${I[q.icon]}</div><span class="eyebrow">${S.retest ? 'إعادة الاختبار · ' : ''}سؤال ${S.q + 1} من ${QUESTIONS.length}</span><h2>${q.t}</h2><p>${q.h}</p></div>
  ${opts}
  <div class="row"><button class="btn ghost" data-back>${S.q ? 'السابق' : 'رجوع'}</button><button class="btn sea" data-next ${a === undefined ? 'disabled' : ''}>${S.q === QUESTIONS.length - 1 ? (S.retest ? 'احسبي نسبتي الجديدة' : 'التالي: افحصي منتجاتك') : 'التالي'}</button></div>
</section>`}

function scanBody() {
  return `
  <div class="card">
    <label class="drop" for="f-img">${S.img ? `<img src="${S.img}" alt="صورة الملصق"><b>تم إرفاق الصورة</b>` : `${I.cam}<b>صوّري ملصق المكونات</b>`}<span class="note">صوّري المكونات، وانسخي النص منها بعدسة قوقل والصقيه تحت</span></label>
    <input type="file" id="f-img" accept="image/*" hidden>
    <div class="field"><label for="f-pname">اسم المنتج</label><input id="f-pname" maxlength="80" placeholder="مثل: ماسكرا"></div>
    <div class="field"><label for="f-ing">المكونات</label><textarea id="f-ing" class="ltr" maxlength="4000" placeholder="Ingredients: ..."></textarea></div>
    <span class="note">أو جربي منتج جاهز:</span>
    <div class="samples">${SAMPLES.map((s, i) => `<button class="chip" data-sample="${i}">${s[0]}</button>`).join('')}</div>
    <button class="btn sea" data-analyze>افحصي المنتج <span class="pts" style="color:inherit">${I.leaf}+5</span></button>
  </div>
  ${S.products.length ? `<div class="card"><span class="eyebrow">منتجاتك (${S.products.length})</span><div class="plist">${S.products.map(p => `<div class="prow"><b>${esc(p.name)}</b>${p.hits.length ? `<div class="found">${p.hits.map(h => `<span class="tag">${esc(h)}</span>`).join('')}</div>` : '<span class="ok">خالي</span>'}</div>`).join('')}</div></div>` : ''}`
}
function scanStep() {
  return `${topbar()}
<section class="screen">
  <div class="qhead"><div class="qicon">${I.cam}</div><span class="eyebrow">الخطوة الأخيرة</span><h2>افحصي منتجات من بيتك</h2><p>كل منتج فيه PFAS يرفع نسبتك. تقدرين تتخطين وتضيفين لاحقًا.</p></div>
  ${scanBody()}
  <button class="btn" data-finish>احسبي نسبتي</button>
</section>`}
function calculating() {
  return `${topbar()}<section class="screen" style="align-items:center;justify-content:center;min-height:60vh;text-align:center">
<div style="width:140px">${PLANTS[1]}</div><h2>نحسب أثرها عليك...</h2><p class="note">نجمع إجاباتك مع نتائج الفحص</p></section>`}

/* ================= tab: result ================= */
function chartSvg() {
  const h = S.history; if (h.length < 2) return `<p class="note">بعد شهر أعيدي الاختبار وشوفي نسبتك كيف نزلت هنا.</p>`;
  const W = 320, H = 130, p = 24, xs = i => p + i * (W - 2 * p) / (h.length - 1), ys = v => H - p - (v / 100) * (H - 2 * p);
  const pts = h.map((v, i) => `${xs(i)},${ys(v.score)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="تطور نسبة التعرض">
${[0, 50, 100].map(v => `<line x1="${p}" x2="${W - p}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)"/><text x="${W - p + 4}" y="${ys(v) + 4}" font-size="9" fill="var(--muted)">${v}</text>`).join('')}
<polygon points="${xs(0)},${ys(0)} ${pts} ${xs(h.length - 1)},${ys(0)}" fill="var(--kelp)" opacity=".12"/>
<polyline points="${pts}" fill="none" stroke="var(--kelp)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
${h.map((v, i) => `<circle cx="${xs(i)}" cy="${ys(v.score)}" r="${i === h.length - 1 ? 6 : 4}" fill="${i === h.length - 1 ? 'var(--kelp)' : 'var(--card)'}" stroke="var(--kelp)" stroke-width="2"/><text x="${xs(i)}" y="${ys(v.score) - 12}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">${v.score}%</text><text x="${xs(i)}" y="${H - 6}" text-anchor="middle" font-size="9" fill="var(--muted)">${v.label}</text>`).join('')}
</svg>`}
function levelCard() {
  const i = levelOf(S.leaves), next = LEVELS[i + 1]; const pct = next ? Math.round((S.leaves - LEVELS[i][1]) / (next[1] - LEVELS[i][1]) * 100) : 100;
  return `<div class="level"><div class="plant">${PLANTS[i]}</div><div style="display:flex;flex-direction:column;gap:6px;min-width:0">
  <span class="eyebrow">مستواك</span><h3>${LEVELS[i][0]}</h3>
  <div class="track"><i style="width:${pct}%"></i></div>
  <span class="note">${next ? `باقي ${next[1] - S.leaves} ورقة وتصيرين ${next[0]}` : 'وصلتي أعلى مستوى!'}</span>
  <div class="ladder">${LEVELS.map((l, k) => k <= i ? `<b>${l[0]}</b>` : `<span>${l[0]}</span>`).join('')}</div></div></div>`
}
function resultTab() {
  const r = compute(), [lv, cls] = level(r.score); const C = 2 * Math.PI * 92, off = C * (1 - r.score / 100);
  const col = cls === 'low' ? 'var(--kelp)' : cls === 'mid' ? 'var(--sun)' : 'var(--reef)';
  const unlocked = SWAPS.filter(s => s.when(S.ans));
  return `<section class="screen">
  <div class="card gaugewrap">
    <span class="eyebrow">نسبة تعرّضك لمواد PFAS</span>
    <div class="gauge"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="92" stroke="var(--line)" stroke-width="18" fill="none"/><circle cx="110" cy="110" r="92" stroke="${col}" stroke-width="18" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset 1s ease"/></svg>
      <div class="num"><b>${r.score}%</b><span>من 100</span></div></div>
    <span class="pill ${cls}">تعرّض ${lv}</span>
    ${r.reduced ? `<p class="ok">نزلت نسبتك ${r.reduced}% بفضل بدائلك</p>` : ''}
    <div class="row" style="width:100%"><button class="btn soft sm" data-share>${I.share}شاركي نتيجتك</button><button class="btn soft sm" data-tab-go="challenges">${I.leaf}بدائلك (${unlocked.length})</button></div>
  </div>
  ${levelCard()}
  <div class="card"><span class="eyebrow">من وين يجي التعرّض؟</span>
    ${Object.entries(SOURCES).map(([k, [n, max]]) => `<div class="src"><span>${n}</span><div class="track"><i style="width:${Math.round(r.by[k] / max * 100)}%"></i></div><span class="v">${r.by[k]}</span></div>`).join('')}
    <p class="note">النسبة تقدير توعوي مبني على مصادر التعرّض المعروفة، وليست تحليل دم.</p>
  </div>
  <div class="card chart"><div class="row" style="justify-content:space-between"><span class="eyebrow">تقدّمك</span><button class="btn ghost sm" data-retest>أعيدي الاختبار <span class="pts" style="color:inherit">${I.leaf}+30</span></button></div>${chartSvg()}
  <p class="note">أوراق إعادة الاختبار تنحسب مرة كل شهر.</p></div>
</section>`}

const scanTab = () => `<section class="screen"><div><h2>افحصي منتج</h2><p class="note">كل منتج تضيفينه يحدّث نسبتك ويعطيك 5 أوراق (لين 10 منتجات باليوم).</p></div>${scanBody()}</section>`;

/* ================= tab: learn ================= */
function learnTab() {
  const seg = `<div class="seg">${[['facts', 'تعرفين إن؟'], ['trivia', 'صح أو خطأ'], ['plastic', 'البلاستيك والتدوير']].map(([k, n]) => `<button data-learn="${k}" aria-pressed="${S.learnSeg === k}">${n}</button>`).join('')}</div>`;
  let body = '';
  if (S.learnSeg === 'facts') body = `<p class="note">اضغطي على البطاقة عشان تقلبينها.</p><div class="flipgrid">${FACTS.map((f, i) => `<button class="flip" data-flip="${i}" aria-pressed="${S.flipped.has(i)}"><div class="in"><div class="f"><b>${f[0]}</b><span>${f[1]}</span><small>اقلبيني</small></div><div class="b"><span>${f[2]}</span><cite>المصدر: ${f[3]}</cite></div></div></button>`).join('')}</div>`;
  if (S.learnSeg === 'trivia') {
    const t = S.trivia, i = t.i % TRIVIA.length, q = TRIVIA[i], d = t.done[i]; const right = Object.values(t.done).filter(x => x.ok).length;
    body = `<div class="row" style="justify-content:space-between"><span class="eyebrow">سؤال ${i + 1} من ${TRIVIA.length}</span><span class="pts">${I.check}${right} صح</span></div>
    <div class="tf ${d && !d.ok ? 'shake' : ''}"><span class="eyebrow">صح أو خطأ؟</span><p class="claim">${q[0]}</p>
    ${d ? `<div class="res ${d.ok ? 'right' : 'wrong'}"><b>${d.ok ? 'إجابتك صح!' : 'إجابتك غلط'}</b><br>${q[2]}</div><button class="btn sea" data-tnext>${i === TRIVIA.length - 1 ? 'من البداية' : 'السؤال التالي'}</button>`
        : `<div class="ans"><button class="btn" style="background:var(--kelp)" data-tf="1">صح</button><button class="btn" data-tf="0">خطأ</button></div>`}</div>`
  }
  if (S.learnSeg === 'plastic') {
    const p = PLASTIC[S.plastic];
    body = `<p class="note">اضغطي على الرقم اللي تحت العلبة.</p>
    <div class="plastics" style="grid-template-columns:repeat(7,minmax(0,1fr));gap:5px">${PLASTIC.map((x, i) => `<button class="ptile ${x[3] === 'r' ? 'bad' : 'good'}" style="border-radius:14px" data-plastic="${i}" aria-pressed="${S.plastic === i}">${I.bottle(x[0])}</button>`).join('')}</div>
    <div class="card unlock"><div class="pinfo"><div style="color:${p[3] === 'r' ? 'var(--reef)' : 'var(--kelp)'}">${I.bottle(p[0])}</div><div style="display:flex;flex-direction:column;gap:6px"><h3>رقم ${p[0]} · ${p[1]}</h3><span class="note">${p[2]}</span>
    <div class="badges"><span class="bdg ${p[3]}">${p[4]}</span><span class="bdg ${p[7]}">${p[8]}</span></div></div></div>
    <p style="font-size:.88rem"><b>انتبهي:</b> ${p[6]}.</p></div>
    <div class="card"><div class="row" style="gap:8px;color:var(--kelp)"><span style="width:26px">${I.recycle}</span><h3 style="font-size:1.05rem">نصائح التدوير</h3></div>
    <ul class="tips"><li>اغسلي العبوات ونشفيها قبل ما تحطينها في حاوية التدوير.</li><li>المقلاة القديمة جسمها معدن، ودّيها لتدوير المعادن بدل النفايات.</li><li>افصلي الأغطية عن القوارير، لأنها غالبًا من نوع بلاستيك مختلف.</li><li>البلاستيك 3 و6 و7 صعب تدويره، فالأفضل تقللين شراءه من البداية.</li><li>أفضل تدوير هو إنك ما تحتاجينه: القارورة والعلبة اللي تعيشين معها سنين.</li></ul></div>`
  }
  return `<section class="screen"><div><h2>تعلّمي</h2><p class="note">معلومات من مصادر علمية، وتكسبين أوراق مع كل إجابة صح.</p></div>${seg}${body}</section>`;
}

/* ================= tab: challenges ================= */
function challengesTab() {
  const c = S.challenge, ch = CHALLENGES[c.no % CHALLENGES.length]; const n = c.days;
  const list = SWAPS.filter(s => s.when(S.ans)); const teamX = S.team && S.team.members >= 3;
  return `<section class="screen">
  <div><h2>تحدياتي</h2><p class="note">اعتمدي بدائل، وكملي تحدي الأسبوع، واجمعي أوراق.</p></div>
  <div class="chal"><div class="row" style="justify-content:space-between"><span class="eyebrow" style="color:#fff">تحدي الأسبوع</span><span style="font-weight:700">${n}/7 ${teamX ? '<span class="x2">×2 فريق</span>' : ''}</span></div>
    <h3 style="font-size:1.25rem">${ch[0]}</h3><p>${ch[1]}</p>
    <div class="days">${Array.from({ length: 7 }, (_, i) => `<div class="day ${i < n ? 'on' : ''} ${i === n && !c.today ? 'today' : ''}">${i < n ? I.check : ''}<span>يوم ${i + 1}</span></div>`).join('')}</div>
    ${n >= 7 ? `<button class="btn" data-claim>استلمي جائزة التحدي ${I.leaf}+15</button>`
      : `<button class="btn" data-day ${c.today ? 'disabled' : ''}>${c.today ? 'سجلتي اليوم، نشوفك بكرة' : 'أنجزته اليوم +2'}</button>`}
  </div>
  <span class="eyebrow">بدائلك المستدامة (${list.filter(s => S.adopted.has(s.id)).length}/${list.length})</span>
  ${list.length ? list.map((s, i) => {
    const done = S.adopted.has(s.id); const from = typeof s.from === 'function' ? s.from(S.ans) : s.from;
    return `<article class="reward unlock ${done ? 'done' : ''}" style="animation-delay:${i * 60}ms">
    <div class="top"><span>${done ? 'اعتمدتيه' : 'جائزة مفتوحة'}</span><b>${I.leaf}+${s.leaves}</b></div>
    <div class="swap"><div class="from">${from}</div><div class="arrow">${I.arrow}</div><div class="to">${s.to}</div></div>
    <p class="why">${s.why} <b>ينزّل نسبتك ${s.red(S.ans)}%.</b></p>
    <div class="act"><button class="btn ${done ? 'soft' : 'sea'}" data-adopt="${s.id}">${done ? 'تم الاعتماد ✓' : 'اعتمدت هذا البديل'}</button></div>
  </article>`}).join('') : '<div class="card"><p>عاداتك ممتازة، ما فيه بدائل مطلوبة.</p></div>'}
  <div class="card"><span class="eyebrow">كيف تجمعين الأوراق</span><div class="earn">
    ${[['إكمال الاختبار', 20], ['فحص منتج', 5], ['اعتماد بديل', '10 - 30'], ['كل يوم في التحدي', 2], ['إكمال تحدي الأسبوع', '15 (×2 للفريق)'], ['إجابة صح في «صح أو خطأ»', 3], ['مشاركة تنقبل في المجتمع', 10], ['دعوة صديقة بكودك', 25], ['إعادة الاختبار الشهري', 30]].map(([a, b]) => `<span>${a}</span><b>${I.leaf}${b}</b>`).join('')}
  </div></div>
</section>`}

/* ================= tab: community ================= */
function postsView() {
  const isAdmin = S.profile && S.profile.is_admin;
  const mine = S.feed.filter(p => p.mine && p.status !== 'approved');
  const feed = S.feed.filter(p => p.status === 'approved');
  const pending = S.feed.filter(p => p.status === 'pending' && !p.mine);
  const statusPill = st => st === 'pending' ? '<span class="pill wait">قيد المراجعة</span>' : `<span class="pill high" style="font-size:.75rem;padding:2px 10px">${st === 'rejected' ? 'ما انقبلت' : 'مخفية'}</span>`;
  return `<div class="card compose"><span class="eyebrow">شاركي طريقتك في الحفاظ على البيئة</span>
  <textarea id="f-post" maxlength="280" placeholder="مثلًا: صرت أشتري الخضار بكيس قماش..."></textarea>
  ${S.postImg ? `<img src="${S.postImg}" alt="" style="border-radius:12px;max-height:140px;object-fit:cover">` : ''}
  <div class="row"><label class="attach" for="f-pimg">${I.img}صورة</label><input type="file" id="f-pimg" accept="image/*" hidden><span class="count" id="pcount">0/280</span><button class="btn sea sm" data-post>انشري</button></div>
  <p class="note">كل مشاركة تنراجع قبل ما تظهر للكل. ممنوع الروابط وأرقام الجوال والإساءة.</p></div>
  ${isAdmin ? `<div class="card admin"><span class="eyebrow" style="color:var(--sun)">لوحة المشرفة · ${pending.length} بانتظار المراجعة</span>
    ${pending.length ? pending.map(p => `<div class="post" style="border:none;padding:0"><b>${esc(p.author_name)}</b><p class="txt">${esc(p.body)}</p>${p.image_path ? `<img class="ph" src="${imageUrl(p.image_path)}" alt="">` : ''}<div class="row"><button class="btn sm" style="background:var(--kelp)" data-approve="${p.id}">قبول</button><button class="btn sm ghost" data-reject="${p.id}">رفض</button></div></div>`).join('') : '<p class="note">ما فيه مشاركات بانتظار المراجعة.</p>'}</div>` : ''}
  ${mine.map(p => `<div class="post"><div class="who"><span class="av" style="background:${avColor(p.author_name)}">${esc(p.author_name[0])}</span><div class="nm"><b>${esc(p.author_name)}</b>${statusPill(p.status)}</div></div><p class="txt">${esc(p.body)}</p>${p.image_path ? `<img class="ph" src="${imageUrl(p.image_path)}" alt="">` : ''}</div>`).join('')}
  ${feed.length ? feed.map(p => `<div class="post"><div class="who"><span class="av" style="background:${avColor(p.author_name)}">${esc(p.author_name[0])}</span><div class="nm"><b>${esc(p.author_name)}${p.mine ? ' (أنتِ)' : ''}</b><span>${new Date(p.created_at).toLocaleDateString('ar-SA')}</span></div></div><p class="txt">${esc(p.body)}</p>${p.image_path ? `<img class="ph" src="${imageUrl(p.image_path)}" alt="" loading="lazy">` : ''}
    <div class="acts"><button class="heart" data-like="${p.id}" aria-pressed="${p.liked}">${I.heart}ألهمتني ${p.likes}</button>${p.mine ? '' : `<button class="report" data-report="${p.id}">إبلاغ</button>`}</div></div>`).join('')
      : '<div class="card"><p class="note">ما فيه مشاركات للحين. كوني أول وحدة تشارك!</p></div>'}`
}
function boardView() {
  const seg = `<div class="seg">${[['people', 'الأفراد'], ['teams', 'الفرق']].map(([k, n]) => `<button data-lb="${k}" aria-pressed="${S.lbSeg === k}">${n}</button>`).join('')}</div>`;
  const rows = S.lbSeg === 'people'
    ? S.board.people.map(r => ({ n: r.first_name, s: r.team || 'بدون فريق', p: r.leaves, me: r.is_me }))
    : S.board.teams.map(t => ({ n: t.name, s: t.members + ' عضوات', p: t.leaves, c: TEAM_COLORS[t.color], me: t.is_mine, x2: t.members >= 3 }));
  return `${seg}<div class="lb">${rows.length ? rows.map((r, i) => `<div class="lbrow ${r.me ? 'me' : ''} ${i === 0 ? 'r1' : ''}"><span class="rank">${i + 1}</span><span class="av" style="background:${r.c || avColor(r.n)}">${esc(String(r.n)[0])}</span><span class="nm"><b>${esc(r.n)}${r.me ? ' (أنتِ)' : ''}${r.x2 ? '<span class="x2">×2</span>' : ''}</b><span>${esc(r.s)}</span></span><span class="pts">${I.leaf}${r.p}</span></div>`).join('') : '<div class="card"><p class="note">ما فيه فرق للحين.</p></div>'}</div>
  <div class="card"><span class="eyebrow">جوائز الشهر</span>
    ${[['var(--sun)', '1', 'الأولى بالأوراق', 'جائزة مستدامة'], ['var(--muted)', '2', 'الثانية والثالثة', 'جوائز مستدامة'], ['var(--kelp)', 'فريق', 'الفريق الأول', 'جائزة لكل عضوة'], ['var(--sea2)', 'كل', 'كل من توصل «واحة»', 'شهادة من أثرها']].map(([c, m, a, b]) => `<div class="prize"><span class="medal" style="background:${c};font-size:${m.length > 1 ? '.75rem' : '1.1rem'}">${m}</span><div><b>${a}</b><p class="note">${b}</p></div></div>`).join('')}
    <p class="note">الفوز حسب الأوراق، مو سحب عشوائي. تُعلن النتائج بعد 30 يوم، ويشترط إعادة الاختبار الشهري.</p></div>`
}
function teamView() {
  const invite = `<div class="card"><span class="eyebrow">كود دعوتك الشخصي</span><div class="row" style="justify-content:space-between"><b style="font-family:var(--display);letter-spacing:.1em;direction:ltr">${esc(S.profile.invite_code)}</b><button class="btn soft sm" data-copy="${esc(S.profile.invite_code)}">نسخ</button></div><p class="note">كل صديقة تسجل بكودك تعطيك 25 ورقة.</p></div>`;
  if (S.team) {
    const t = S.team, x2 = t.members >= 3; return `<div class="teamhead" style="background:linear-gradient(135deg,${TEAM_COLORS[t.color]},var(--sea))">
    <span class="eyebrow" style="color:var(--onsea)">فريقك</span><h2>${esc(t.name)}</h2>
    <div class="stat3" style="color:var(--ink)"><div class="stat"><b>${t.members}</b><span>عضوات</span></div><div class="stat"><b>${t.leaves}</b><span>ورقة</span></div><div class="stat"><b>${x2 ? '×2' : '×1'}</b><span>المضاعفة</span></div></div>
    <div class="code"><span>${esc(t.code)}</span><button data-copy="${esc(t.code)}">نسخ الكود</button></div></div>
    <div class="card"><p>${x2 ? '<b>المضاعفة مفعّلة!</b> جائزة تحدي الأسبوع تتضاعف لكل عضوات الفريق.' : `ادعي <b>${3 - t.members}</b> عشان تتفعل مضاعفة الأوراق ×2 في التحديات.`}</p>
    <button class="link note" data-leave style="text-decoration:underline">مغادرة الفريق</button></div>${invite}`
  }
  return `<div class="card"><span class="eyebrow">سوّي فريقك</span>
    <p class="note">سمّي فريقك وادعي صاحباتك. إذا صرتوا 3 أو أكثر تتضاعف جائزة التحدي لكل الفريق.</p>
    <div class="field"><label for="f-team">اسم الفريق</label><input id="f-team" maxlength="24" placeholder="مثل: موجة البحر"></div>
    <div class="field"><label>لون الفريق</label><div class="colors">${TEAM_COLORS.map((c, i) => `<button style="background:${c}" data-tcolor="${i}" aria-pressed="${S.teamForm.color === i}" aria-label="لون ${i + 1}"></button>`).join('')}</div></div>
    <button class="btn sea" data-mkteam>أنشئي الفريق</button></div>
  <div class="card"><span class="eyebrow">أو انضمي لفريق</span><div class="row"><input id="f-join" dir="ltr" maxlength="10" placeholder="TM-XXXXX"><button class="btn ghost sm" data-join>انضمي</button></div><span class="err" id="e-join"></span></div>${invite}`
}
function communityTab() {
  const seg = `<div class="seg">${[['posts', 'المشاركات'], ['board', 'الصدارة'], ['team', 'فريقي']].map(([k, n]) => `<button data-comm="${k}" aria-pressed="${S.commSeg === k}">${n}</button>`).join('')}</div>`;
  return `<section class="screen"><div><h2>مجتمع أثرها</h2><p class="note">مستخدمات يعتمدن بدائل خالية من PFAS.</p></div>
  <div class="stat3"><div class="stat"><b>${S.stats.users}</b><span>مستخدمة</span></div><div class="stat"><b>${S.stats.swaps}</b><span>بديل معتمد</span></div><div class="stat"><b>${S.stats.teams}</b><span>فرق</span></div></div>
  ${seg}${S.commSeg === 'posts' ? postsView() : S.commSeg === 'board' ? boardView() : teamView()}</section>`
}

/* ================= share card & account sheet ================= */
function shareCard() {
  const r = compute(), [lv] = level(r.score), li = levelOf(S.leaves);
  const c = document.createElement('canvas'); c.width = 720; c.height = 1280; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 1280); gr.addColorStop(0, '#0F4C5C'); gr.addColorStop(1, '#1B6B78'); g.fillStyle = gr; g.fillRect(0, 0, 720, 1280);
  g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.moveTo(0, 1080); for (let x = 0; x <= 720; x += 40) g.lineTo(x, 1080 + Math.sin(x / 60) * 24); g.lineTo(720, 1280); g.lineTo(0, 1280); g.fill();
  g.direction = 'rtl'; g.textAlign = 'center'; const F = '"Readex Pro","IBM Plex Sans Arabic",sans-serif';
  g.fillStyle = '#fff'; g.font = `700 64px ${F}`; g.fillText('أثرها', 360, 150);
  g.font = `400 32px ${F}`; g.globalAlpha = .85; g.fillText('نسبة تعرّضي للكيميائيات الأبدية', 360, 230); g.globalAlpha = 1;
  g.lineWidth = 36; g.strokeStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(360, 500, 190, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = r.score < 30 ? '#5CC79E' : r.score < 60 ? '#F0C766' : '#F08C72'; g.lineCap = 'round'; g.beginPath(); g.arc(360, 500, 190, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * r.score / 100); g.stroke();
  g.fillStyle = '#fff'; g.font = `700 140px ${F}`; g.fillText(r.score + '%', 360, 545);
  g.font = `600 40px ${F}`; g.fillText('تعرّض ' + lv, 360, 790);
  g.font = `400 34px ${F}`; g.fillText(`مستواي: ${LEVELS[li][0]} · ${S.leaves} ورقة`, 360, 860);
  g.fillText(`بدائل مستدامة اعتمدتها: ${S.adopted.size}`, 360, 915);
  g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.roundRect(150, 990, 420, 110, 30); g.fill();
  g.fillStyle = '#fff'; g.font = `400 28px ${F}`; g.fillText('جربي التطبيق بكود دعوتي', 360, 1032); g.font = `700 40px ${F}`; g.fillText(S.profile.invite_code, 360, 1080);
  return c.toDataURL('image/png')
}
function openShare() {
  const d = document.createElement('div'); d.className = 'modal';
  const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(S.profile.invite_code);
  d.innerHTML = `<div class="sheet"><span class="eyebrow">بطاقة الستوري</span><img src="${shareCard()}" alt="بطاقة نتيجتك"><p class="note">اضغطي مطولًا على الصورة واحفظيها، وانشريها في الستوري مع رابط الدعوة.</p><div class="row"><button class="btn soft" data-copy="${esc(link)}">نسخ رابط الدعوة</button><button class="btn sea" data-close-layer>تم</button></div></div>`;
  $('#layer').appendChild(d)
}
function openAccount() {
  const p = S.profile; const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = `<div class="sheet"><span class="eyebrow">حسابي</span><h2>${esc(p.name)}</h2>
  <p class="note" dir="ltr" style="text-align:right">${esc(p.email)}</p>
  <div class="earn"><span>أوراقك</span><b>${I.leaf}${S.leaves}</b><span>مستواك</span><b>${LEVELS[levelOf(S.leaves)][0]}</b><span>كود دعوتك</span><b style="direction:ltr">${esc(p.invite_code)}</b></div>
  <a class="btn ghost" href="privacy.html" target="_blank" rel="noopener">سياسة الخصوصية</a>
  <div id="del-area"><button class="btn ghost" style="color:var(--reef);border-color:var(--reef)" data-del-ask>حذف حسابي وكل بياناتي</button></div>
  <button class="btn sea" data-close-layer>إغلاق</button></div>`;
  $('#layer').appendChild(d)
}

/* ================= render ================= */
const TABS = { result: ['نتيجتي', 'gauge', resultTab], scan: ['افحصي', 'cam', scanTab], learn: ['تعلّمي', 'book', learnTab], challenges: ['تحدياتي', 'flag', challengesTab], community: ['المجتمع', 'people', communityTab] };
function render() {
  const app = $('#app'), nav = $('#nav'); const inApp = S.screen === 'app'; nav.hidden = !inApp;
  if (inApp) {
    app.innerHTML = topbar() + TABS[S.tab][2]();
    nav.querySelector('.in').innerHTML = Object.entries(TABS).map(([k, t]) => `<button data-tab="${k}" ${k === S.tab ? 'aria-current="page"' : ''}>${I[t[1]]}<span>${t[0]}</span></button>`).join('');
  } else app.innerHTML = ({ loading, welcome, account, quiz, scan: scanStep, calc: calculating })[S.screen]();
  if (S.screen === 'account') bindAccount();
  const pt = $('#f-post'); if (pt) pt.addEventListener('input', () => $('#pcount').textContent = pt.value.length + '/280');
}

function bindAccount() {
  const age = $('#f-age'), minor = $('#minor'); const upd = () => minor.hidden = age.value !== 'أقل من 18'; age.addEventListener('change', upd); upd();
  $('#acc').addEventListener('submit', async e => {
    e.preventDefault();
    const v = {
      name: $('#f-name').value.trim(), email: $('#f-email').value.trim().toLowerCase(), phone: $('#f-phone').value.replace(/\s/g, ''), age: age.value, edu: $('#f-edu').value, fam: $('#f-fam').value, dist: $('#f-dist').value.trim(), ref: $('#f-ref').value.trim(),
      health: [], consent: $('#f-consent').checked
    };
    S.draft = v; let ok = true;
    const chk = (id, cond, msg) => { $('#e-' + id).textContent = cond ? '' : msg; const inp = $('#f-' + id); if (inp) inp.classList.toggle('bad', !cond); if (!cond) ok = false };
    chk('name', v.name.length > 1, 'اكتبي اسمك');
    chk('email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email), 'اكتبي بريد صحيح، مثل name@gmail.com');
    chk('phone', !v.phone || /^05\d{8}$/.test(v.phone), 'رقم الجوال يبدأ بـ 05 ومن 10 أرقام');
    chk('age', !!v.age, 'اختاري عمرك');
    chk('consent', v.consent, 'الموافقة مطلوبة عشان نحفظ بياناتك');
    if (!ok) return;
    const btn = $('#acc-btn'); btn.disabled = true; btn.textContent = 'نسوي حسابك...';
    try {
      let { data: { session } } = await sb.auth.getSession();
      if (!session) { const r = await sb.auth.signInAnonymously(); if (r.error) throw r.error; session = r.data.session }
      S.uid = session.user.id;
      const code = 'AZH-' + Math.floor(1000 + Math.random() * 9000) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
      const row = { id: S.uid, name: v.name, email: v.email, phone: v.phone || null, age_group: v.age, education: v.edu || null, family_size: v.fam || null, district: v.dist || null, health: v.health, consent: true, invite_code: code };
      const { error } = await sb.from('profiles').upsert(row);
      if (error) throw error;
      if (v.ref) await sb.rpc('redeem_invite', { p_code: v.ref });
      S.profile = { ...row, leaves: 0, is_admin: false }; S.leaves = 0;
      go('quiz');
    } catch (err) { console.error(err); btn.disabled = false; btn.textContent = 'التالي: الأسئلة'; toast(friendlyError(err)) }
  });
}

async function finishCalc() {
  go('calc');
  const r = compute();
  try {
    await call(sb.from('assessments').insert({ user_id: S.uid, answers: S.ans, by_source: r.by, raw_score: r.raw, score: r.score, is_retest: S.retest }));
    const MO = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    S.history.push({ score: r.score, label: S.history.length ? MO[new Date().getMonth()] : 'البداية' });
  } catch (e) { toast(friendlyError(e)) }
  setTimeout(async () => {
    S.screen = 'app'; S.tab = 'result'; render(); scrollTo(0, 0);
    if (S.retest) { S.retest = false; await award('retest', '', 'إعادة الاختبار') }
    else { confetti(); await award('quiz', '', 'أكملتي الاختبار') }
    loadCommunity();
  }, 1200);
}

async function analyze() {
  const txt = $('#f-ing').value.trim(), name = $('#f-pname').value.trim() || 'منتج';
  if (!txt) { toast('اكتبي المكونات أو اختاري منتج جاهز'); return }
  const hits = DICT.filter(x => x[1].test(txt)).map(x => x[0]);
  try {
    const row = await call(sb.from('products').insert({ user_id: S.uid, name, ingredients: txt, indicators: hits }).select('id').single());
    S.products.push({ name, hits }); S.img = null; render();
    await award('scan', row.id, hits.length ? `لقينا ${hits.length} مؤشر PFAS` : 'المنتج خالي');
    if (S.screen !== 'app') toast(hits.length ? `لقينا ${hits.length} مؤشر PFAS في «${name}»` : `«${name}» خالي من مؤشرات PFAS`);
  } catch (e) { toast(friendlyError(e)) }
}

/* ================= events ================= */
document.addEventListener('click', async e => {
  const t = e.target.closest('button,[data-go]'); if (!t) return; const d = t.dataset;
  if (d.closeLayer !== undefined) { t.closest('.modal,.levelup').remove(); return }
  if (d.go) return go(d.go);
  if (d.account !== undefined) { openAccount(); return }
  if (d.delAsk !== undefined) { $('#del-area').innerHTML = `<p class="note">متأكدة؟ بينحذف حسابك وأوراقك وكل بياناتك نهائيًا.</p><div class="row"><button class="btn" data-del-yes>نعم، احذفي</button><button class="btn soft" data-close-layer>لا</button></div>`; return }
  if (d.delYes !== undefined) {
    try { await call(sb.rpc('delete_my_account')); await sb.auth.signOut(); localStorage.removeItem('atharha-auth'); location.href = location.pathname }
    catch (err) { toast(friendlyError(err)) } return
  }
  if (d.opt !== undefined) { S.ans[QUESTIONS[S.q].id] = d.opt; render(); return }
  if (d.next !== undefined) { if (S.q < QUESTIONS.length - 1) { S.q++; render() } else if (S.retest) finishCalc(); else go('scan'); return }
  if (d.back !== undefined) { if (S.q > 0) { S.q--; render() } else if (S.retest) { S.retest = false; go('app') } else go('account'); return }
  if (d.sample !== undefined) { const s = SAMPLES[+d.sample]; $('#f-pname').value = s[0]; $('#f-ing').value = s[1]; return }
  if (d.analyze !== undefined) { if (S.busy) return; S.busy = true; t.disabled = true; await analyze(); S.busy = false; return }
  if (d.finish !== undefined) { finishCalc(); return }
  if (d.tab || d.tabGo) {
    S.tab = d.tab || d.tabGo; render(); scrollTo(0, 0);
    if (S.tab === 'community' || S.tab === 'challenges') loadCommunity(); return
  }
  if (d.adopt) {
    const s = SWAPS.find(x => x.id === d.adopt); if (S.busy) return; S.busy = true;
    try {
      if (S.adopted.has(s.id)) {
        await call(sb.from('swaps').delete().eq('user_id', S.uid).eq('swap_id', s.id)); S.adopted.delete(s.id);
        S.leaves = await call(sb.rpc('unaward_swap', { p_ref: s.id })); render();
      } else {
        await call(sb.from('swaps').insert({ user_id: S.uid, swap_id: s.id })); S.adopted.add(s.id); render(); confetti(14);
        await award('swap', s.id, `نزلت نسبتك ${s.red(S.ans)}%`);
      }
    } catch (err) { toast(friendlyError(err)) }
    S.busy = false; return
  }
  if (d.retest !== undefined) { S.retest = true; S.q = 0; go('quiz'); return }
  if (d.share !== undefined) { openShare(); return }
  if (d.learn) { S.learnSeg = d.learn; render(); return }
  if (d.flip !== undefined) { const i = +d.flip; S.flipped.has(i) ? S.flipped.delete(i) : S.flipped.add(i); t.setAttribute('aria-pressed', S.flipped.has(i)); return }
  if (d.tf !== undefined) {
    const i = S.trivia.i % TRIVIA.length; const ok = (d.tf === '1') === TRIVIA[i][1]; S.trivia.done[i] = { ok }; render();
    if (ok) await award('trivia', i, 'إجابة صح'); return
  }
  if (d.tnext !== undefined) { S.trivia.i++; const i = S.trivia.i % TRIVIA.length; if (S.trivia.done[i] && !S.trivia.done[i].ok) delete S.trivia.done[i]; render(); return }
  if (d.plastic !== undefined) { S.plastic = +d.plastic; render(); return }
  if (d.day !== undefined) {
    if (S.busy) return; S.busy = true;
    try {
      await call(sb.from('challenge_days').insert({ user_id: S.uid, challenge_no: S.challenge.no, day: todayRiyadh() }));
      S.challenge.days++; S.challenge.today = true; render();
      await award('challenge_day', S.challenge.no + ':' + todayRiyadh(), 'يوم في التحدي');
    } catch (err) { toast(/duplicate/.test(err.message || '') ? 'سجلتي اليوم من قبل' : friendlyError(err)) }
    S.busy = false; return
  }
  if (d.claim !== undefined) {
    confetti(24); await award('challenge_done', S.challenge.no, 'أكملتي التحدي');
    S.challenge.no++; await loadChallenge(); render(); return
  }
  if (d.comm) { S.commSeg = d.comm; render(); return }
  if (d.lb) { S.lbSeg = d.lb; render(); return }
  if (d.like) {
    const p = S.feed.find(x => String(x.id) === d.like); if (!p) return;
    try {
      if (p.liked) { await call(sb.from('post_likes').delete().eq('post_id', p.id).eq('user_id', S.uid)); p.liked = false; p.likes-- }
      else { await call(sb.from('post_likes').insert({ post_id: p.id, user_id: S.uid })); p.liked = true; p.likes++ }
      render();
    } catch (err) { toast(friendlyError(err)) } return
  }
  if (d.report) {
    try { await sb.from('post_reports').insert({ post_id: +d.report, user_id: S.uid }); S.feed = S.feed.filter(x => String(x.id) !== d.report); render(); toast('وصلنا بلاغك، وانخفت المشاركة عندك') }
    catch (err) { toast(friendlyError(err)) } return
  }
  if (d.post !== undefined) {
    const txt = $('#f-post').value.trim();
    if (txt.length < 10) { toast('اكتبي مشاركة أطول شوي'); return }
    if (/https?:|www\.|\.com|@/i.test(txt)) { toast('ممنوع الروابط والإيميلات في المشاركات'); return }
    if (/0\d{8,}|\+966|\d{9,}/.test(txt.replace(/\s/g, ''))) { toast('ممنوع أرقام الجوال في المشاركات'); return }
    if (BANNED.test(txt)) { toast('المشاركة فيها كلمات غير لائقة'); return }
    if (S.busy) return; S.busy = true; t.disabled = true;
    try {
      let image_path = null;
      if (S.postImg) {
        const blob = await shrinkImage(S.postImg); image_path = `${S.uid}/${Date.now()}.jpg`;
        const up = await sb.storage.from('post-images').upload(image_path, blob, { contentType: 'image/jpeg' }); if (up.error) throw up.error;
      }
      await call(sb.from('posts').insert({ user_id: S.uid, author_name: S.profile.name, body: txt, image_path }));
      S.postImg = null; toast('وصلت مشاركتك، تظهر للكل بعد المراجعة'); await loadCommunity();
    } catch (err) { toast(friendlyError(err)) }
    S.busy = false; return
  }
  if (d.approve || d.reject) {
    try { await call(sb.rpc('review_post', { p_id: +(d.approve || d.reject), p_approve: !!d.approve })); toast(d.approve ? 'انقبلت المشاركة' : 'انرفضت المشاركة'); await loadCommunity() }
    catch (err) { toast(friendlyError(err)) } return
  }
  if (d.tcolor !== undefined) { S.teamForm.color = +d.tcolor; $('#app').querySelectorAll('[data-tcolor]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tcolor === d.tcolor)); return }
  if (d.mkteam !== undefined) {
    const n = $('#f-team').value.trim(); if (n.length < 2) { toast('اكتبي اسم الفريق'); return }
    if (BANNED.test(n)) { toast('اختاري اسم لائق للفريق'); return }
    try { await call(sb.rpc('create_team', { p_name: n, p_color: S.teamForm.color })); confetti(); toast('انشأتي فريقك! انسخي الكود وأرسليه لصاحباتك'); await loadCommunity() }
    catch (err) { toast(friendlyError(err)) } return
  }
  if (d.join !== undefined) {
    const code = $('#f-join').value.trim(); if (!code) return;
    try { const ok = await call(sb.rpc('join_team', { p_code: code })); if (!ok) { $('#e-join').textContent = 'الكود ما هو صحيح. تأكدي منه مع صاحبتك.'; return } confetti(); toast('انضميتي للفريق!'); await loadCommunity() }
    catch (err) { toast(friendlyError(err)) } return
  }
  if (d.leave !== undefined) { try { await call(sb.rpc('leave_team')); S.team = null; await loadCommunity() } catch (err) { toast(friendlyError(err)) } return }
  if (d.copy) { const v = d.copy; (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('انتسخ')).catch(() => toast(v)); return }
});
document.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => {
    if (e.target.id === 'f-img') { S.img = r.result; const d = $('.drop'); if (d) d.innerHTML = `<img src="${S.img}" alt="صورة الملصق"><b>تم إرفاق الصورة</b><span class="note">انسخي النص من الصورة والصقيه تحت</span>` }
    if (e.target.id === 'f-pimg') { S.postImg = r.result; const txt = $('#f-post').value; render(); $('#f-post').value = txt }
  };
  r.readAsDataURL(f)
});

/* ================= boot ================= */
(async function boot() {
  render();
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      S.uid = session.user.id;
      const done = await loadAll();
      if (!S.profile) { go('welcome'); return }
      if (done) { S.screen = 'app'; S.tab = 'result'; render(); loadCommunity() } else go('quiz');
    } else go('welcome');
  } catch (e) { console.error(e); go('welcome'); toast(friendlyError(e)) }
})();

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
