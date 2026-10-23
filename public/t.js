/* 오디워크룸 방문 기록 (2026-10-23) — 운영웹 '웹 방문' 화면으로 간다.
   쿠키 없음. 이름·전화 같은 입력값은 절대 보내지 않는다. 원본 IP는 서버에서도 저장하지 않는다.
   방문자 id: localStorage 랜덤(1년), 세션: 30분 무활동이면 새로.
   직원 기기 제외: 아무 페이지나 ?odi_staff=1 로 한 번 열면 그 기기는 직원으로 표시(대시보드 기본 제외),
   ?odi_staff=0 으로 해제. */
(function () {
  if (window.__odiT) return;
  var END = window.ODI_TRACK_URL || 'https://odworkroom.io.kr/api/track';
  var VKEY = 'odi_vid', SKEY = 'odi_sess', STAFF = 'odi_staff', GAP = 30 * 60 * 1000, HB = 20000;
  function rid() {
    var c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', a = new Uint8Array(16), o = '';
    try { crypto.getRandomValues(a); } catch (e) { for (var j = 0; j < 16; j++) a[j] = Math.random() * 256; }
    for (var i = 0; i < a.length; i++) o += c[a[i] % c.length];
    return o;
  }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var now = Date.now(), q = new URLSearchParams(location.search);
  if (q.get('odi_staff') === '1') set(STAFF, '1');
  if (q.get('odi_staff') === '0') { try { localStorage.removeItem(STAFF); } catch (e) {} }
  var staff = get(STAFF) === '1' ? 1 : 0;

  var vraw = get(VKEY), vid, newVisitor = 0;
  try { vraw = vraw && JSON.parse(vraw); } catch (e) { vraw = null; }
  if (vraw && vraw.id && now - vraw.t < 365 * 864e5) { vid = vraw.id; } else { vid = rid(); newVisitor = 1; }
  set(VKEY, JSON.stringify({ id: vid, t: vraw && vraw.id === vid ? vraw.t : now }));

  var sraw = get(SKEY), sid, newSession = false;
  try { sraw = sraw && JSON.parse(sraw); } catch (e) { sraw = null; }
  if (sraw && sraw.id && now - sraw.last < GAP) { sid = sraw.id; newVisitor = sraw.nv || 0; } else { sid = rid(); newSession = true; }
  function touch() { set(SKEY, JSON.stringify({ id: sid, last: Date.now(), nv: newVisitor })); }
  touch();

  function send(obj) {
    obj.v = vid; obj.s = sid;
    var body = JSON.stringify(obj);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(END, new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) {}
    try { fetch(END, { method: 'POST', body: body, keepalive: true, mode: 'cors', headers: { 'Content-Type': 'text/plain' } }); } catch (e) {}
  }

  var pv = null;               // 지금 보고 있는 페이지
  var resumed = false;         // 30분 넘게 떠났다가 돌아온 새 세션(처음 유입 정보는 다시 보내지 않는다)
  function pathNow() { return (location.pathname + (location.hash && location.hash.length > 1 ? location.hash : '')).slice(0, 300); }
  function scrollPct() {
    var d = document.documentElement, h = Math.max(d.scrollHeight, document.body ? document.body.scrollHeight : 0);
    var seen = (window.scrollY || d.scrollTop || 0) + window.innerHeight;
    return h > 0 ? Math.min(100, Math.round(seen * 100 / h)) : 0;
  }
  function visibleNow() { return document.visibilityState !== 'hidden'; }
  function engaged() { return pv ? pv.acc + (pv.since ? Date.now() - pv.since : 0) : 0; }
  function beat() {
    if (!pv) return;
    pv.sc = Math.max(pv.sc, scrollPct());
    send({ k: 'hb', p: pv.id, e: engaged(), sc: pv.sc });
    touch();
  }
  function startPage() {
    if (pv) beat();
    var first = !pv;
    pv = { id: rid(), path: pathNow(), acc: 0, since: visibleNow() ? Date.now() : 0, sc: 0 };
    var o = { k: 'pv', p: pv.id, u: pv.path, t: (document.title || '').slice(0, 200), nv: newVisitor, st: staff };
    if (first && newSession) {
      o.r = resumed ? '' : (document.referrer || '');
      var utm = {};
      if (!resumed) ['source', 'medium', 'campaign', 'content', 'term'].forEach(function (k) { var x = q.get('utm_' + k); if (x) utm[k] = x.slice(0, 150); });
      o.utm = utm;
      o.cl = resumed ? {} : { fb: q.has('fbclid') ? 1 : 0, g: (q.has('gclid') || q.has('gbraid') || q.has('wbraid')) ? 1 : 0, n: (q.has('n_media') || q.has('NaPm')) ? 1 : 0 };
      o.sz = screen.width + 'x' + screen.height;
      o.lg = (navigator.language || '').slice(0, 20);
      try { o.tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
      try { o.nt = navigator.connection && navigator.connection.effectiveType; } catch (e) {}
    }
    send(o);
    touch();
  }

  document.addEventListener('visibilitychange', function () {
    if (!pv) return;
    if (document.visibilityState === 'hidden') { if (pv.since) { pv.acc += Date.now() - pv.since; pv.since = 0; } beat(); }
    else {
      // 30분 넘게 떠나 있다 돌아오면 새 세션으로 센다
      var s2 = null; try { s2 = JSON.parse(get(SKEY)); } catch (e) {}
      if (!s2 || Date.now() - s2.last >= GAP) { sid = rid(); newSession = true; newVisitor = 0; resumed = true; pv = null; startPage(); return; }
      if (!pv.since) pv.since = Date.now(); touch();
    }
  });
  window.addEventListener('pagehide', function () { if (pv && pv.since) { pv.acc += Date.now() - pv.since; pv.since = 0; } beat(); });
  window.addEventListener('scroll', function () { if (pv) pv.sc = Math.max(pv.sc, scrollPct()); }, { passive: true });
  setInterval(function () { if (visibleNow()) beat(); }, HB);

  // SPA(홈페이지는 #space-detail 같은 해시 화면) — 주소가 바뀌면 새 페이지로 센다
  function onRoute() { if (pv && pathNow() !== pv.path) startPage(); }
  var push = history.pushState;
  history.pushState = function () { var r = push.apply(this, arguments); setTimeout(onRoute, 0); return r; };
  window.addEventListener('popstate', onRoute);
  window.addEventListener('hashchange', onRoute);

  // 행동 이벤트. 페이지 코드에서 window.odiTrack('lead', 'firestore문서ID') 처럼 부른다.
  window.odiTrack = function (name, label) {
    send({ k: 'ev', p: pv && pv.id, n: name, l: label ? String(label).slice(0, 120) : '', u: pathNow() });
    touch();
  };
  // 링크 클릭 자동 기록 (전화·문자·카톡·인스타·네이버 예약)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^tel:/i.test(h)) window.odiTrack('tel_click');
    else if (/^sms:/i.test(h)) window.odiTrack('sms_click');
    else if (/kakao\.com|kakao\.me/i.test(h)) window.odiTrack('kakao_click');
    else if (/instagram\.com/i.test(h)) window.odiTrack('instagram_click');
    else if (/booking\.naver\.com|naver\.me/i.test(h)) window.odiTrack('naver_click', 'link');
    else if (/^https?:/i.test(h) && a.hostname && a.hostname.indexOf('odworkroom') < 0) window.odiTrack('outbound_click', a.hostname);
  }, true);

  window.__odiT = 1;
  startPage();
})();
