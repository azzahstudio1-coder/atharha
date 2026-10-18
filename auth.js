'use strict';
/* =====================================================================
   Atharha - account recovery
   - First sign-up: no code. The email the user typed is attached to her
     account silently (Supabase "Confirm email" is off).
   - Coming back on another phone: she types her email, gets a 6-digit
     code by email, and her account (leaves, results, team) comes back.
   Loaded after app.js; extends its screens without changing it.
   ===================================================================== */

S.login = { step: 'email', email: '', busy: false };

/* ---------- attach the email to anonymous accounts (no code) ---------- */
async function linkEmailSilently() {
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user.is_anonymous || !S.profile || !S.profile.email) return;
    const { error } = await sb.auth.updateUser({ email: S.profile.email });
    if (error && /already|exists|registered/i.test(error.message || '')) showEmailTaken();
    else if (error) console.warn('link email', error);
  } catch (e) { console.warn(e) }
}
function showEmailTaken() {
  const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = `<div class="sheet"><span class="eyebrow">عندك حساب من قبل؟</span>
    <h2>هذا الإيميل مسجّل لحساب ثاني</h2>
    <p class="note">إذا هو حسابك، سجلي دخول برمز يوصلك على الإيميل وترجع لك أوراقك ونتايجك.</p>
    <button class="btn sea" data-login-start="${esc(S.profile.email)}">سجلي دخول لحسابي القديم</button>
    <button class="btn soft" data-close-layer>أكمل بهذا الحساب</button></div>`;
  $('#layer').appendChild(d);
}

/* ---------- login screen ---------- */
function loginScreen() {
  const L = S.login;
  const body = L.step === 'email'
    ? `<div class="field"><label for="l-email">إيميلك اللي سجلتي فيه</label><input id="l-email" type="email" inputmode="email" dir="ltr" autocomplete="email" value="${esc(L.email)}"><span class="err" id="l-err"></span></div>
       <button class="btn sea" data-login-send ${L.busy ? 'disabled' : ''}>${L.busy ? 'نرسل الرمز...' : 'أرسلي لي رمز الدخول'}</button>`
    : `<p class="note">أرسلنا رمز من 6 أرقام إلى <b dir="ltr">${esc(L.email)}</b>. إذا ما لقيتيه، شوفي مجلد الرسائل غير المرغوبة (Spam).</p>
       <div class="field"><label for="l-code">الرمز</label><input id="l-code" inputmode="numeric" autocomplete="one-time-code" dir="ltr" maxlength="8" style="font-size:1.5rem;letter-spacing:.4em;text-align:center"><span class="err" id="l-err"></span></div>
       <button class="btn sea" data-login-verify ${L.busy ? 'disabled' : ''}>${L.busy ? 'نتأكد...' : 'دخول'}</button>
       <button class="link note" data-login-again style="text-decoration:underline;align-self:center">ما وصلني، أرسلي رمز جديد</button>`;
  return `${topbar()}
<section class="screen">
  <div class="qhead"><div class="qicon">${I.leaf}</div><span class="eyebrow">رجوع لحسابك</span><h2>سجلي دخول</h2><p>بترجع لك أوراقك ونتايجك وفريقك.</p></div>
  <div class="card">${body}</div>
  <button class="btn ghost" data-go="welcome">رجوع</button>
</section>`;
}

async function sendCode(email) {
  S.login.busy = true; render();
  const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  S.login.busy = false;
  if (error) {
    S.login.step = 'email'; render();
    const m = error.message || '';
    $('#l-err').textContent = /signups not allowed|not found|Signup/i.test(m) ? 'ما لقينا حساب بهالإيميل. تأكدي منه، أو سوي حساب جديد.'
      : /rate|seconds|security/i.test(m) ? 'انتظري دقيقة وجربي مرة ثانية.'
      : 'ما قدرنا نرسل الرمز، حاولي بعد شوي.';
    return;
  }
  S.login.step = 'code'; render(); setTimeout(() => { const c = $('#l-code'); if (c) c.focus() }, 50);
}

async function verifyCode() {
  const token = ($('#l-code').value || '').replace(/\D/g, '');
  if (token.length < 6) { $('#l-err').textContent = 'اكتبي الرمز كامل'; return }
  S.login.busy = true; render(); $('#l-code').value = token;
  const { data, error } = await sb.auth.verifyOtp({ email: S.login.email, token, type: 'email' });
  S.login.busy = false;
  if (error) { render(); $('#l-code').value = token; $('#l-err').textContent = 'الرمز غلط أو انتهى. جربي مرة ثانية أو اطلبي رمز جديد.'; return }
  S.uid = data.user.id;
  try {
    const done = await loadAll();
    if (!S.profile) { go('account'); return }
    toast('أهلًا من جديد ' + S.profile.name.split(' ')[0] + '!');
    if (done) { S.screen = 'app'; S.tab = 'result'; render(); loadCommunity() } else go('quiz');
  } catch (e) { toast(friendlyError(e)) }
}

/* ---------- extend the app's screens ---------- */
const _render = render;
render = function () {
  if (S.screen === 'login') { $('#nav').hidden = true; $('#app').innerHTML = loginScreen(); return }
  _render();
  if (S.screen === 'welcome' && !$('#app [data-login-start]')) {
    const start = $('#app [data-go="account"]');
    if (start) start.insertAdjacentHTML('afterend', `<button class="btn ghost" data-login-start="">عندي حساب، سجلي دخول</button>`);
  }
};
const _go = go;
go = function (screen) {
  _go(screen);
  if (screen === 'quiz' && S.profile) linkEmailSilently();
};

document.addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return; const d = t.dataset;
  if (d.loginStart !== undefined) {
    const m = t.closest('.modal'); if (m) m.remove();
    S.login = { step: 'email', email: d.loginStart || '', busy: false }; S.screen = 'login'; render(); scrollTo(0, 0); return;
  }
  if (d.loginSend !== undefined) {
    const email = ($('#l-email').value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#l-err').textContent = 'اكتبي إيميل صحيح'; return }
    S.login.email = email; await sendCode(email); return;
  }
  if (d.loginVerify !== undefined) { await verifyCode(); return }
  if (d.loginAgain !== undefined) { await sendCode(S.login.email); toast('أرسلنا رمز جديد'); return }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || S.screen !== 'login') return;
  const b = $('#app [data-login-send], #app [data-login-verify]'); if (b) { e.preventDefault(); b.click() }
});

/* existing accounts made before this update: attach their email too */
setTimeout(linkEmailSilently, 4000);
if (S.screen === 'welcome') render();
