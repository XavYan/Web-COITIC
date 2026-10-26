'use strict';
(() => {
  const KEY = 'coitic:cookie-notice:v1';
  const VERSION = 1;
  const DURATION = 180 * 24 * 60 * 60 * 1000;
  const banner = document.querySelector('#cookie-banner');
  const dialog = document.querySelector('#cookie-dialog');
  let acknowledgedInMemory = false;
  let returnFocus = null;

  function readRecord() {
    try {
      const record = JSON.parse(localStorage.getItem(KEY));
      const now = Date.now();
      if (record && Number.isFinite(record.expiresAt) && record.expiresAt <= now) localStorage.removeItem(KEY);
      if (record?.version === VERSION && record.acknowledged === true &&
          Number.isFinite(record.updatedAt) && Number.isFinite(record.expiresAt) &&
          record.updatedAt <= now && record.expiresAt > now &&
          record.expiresAt <= record.updatedAt + DURATION) return record;
    } catch { /* Private browsing or blocked storage must not prevent navigation. */ }
    return null;
  }

  function reserveBannerSpace() {
    document.body.style.setProperty('--cookie-banner-height', banner.hidden ? '0px' : `${banner.offsetHeight}px`);
  }

  function updateBanner() {
    banner.hidden = acknowledgedInMemory || Boolean(readRecord());
    reserveBannerSpace();
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
  }

  function acknowledge() {
    const now = Date.now();
    const record = {version: VERSION, acknowledged: true, updatedAt: now, expiresAt: now + DURATION};
    try { localStorage.setItem(KEY, JSON.stringify(record)); } catch { /* Session-only fallback. */ }
    acknowledgedInMemory = true;
    closeDialog();
    updateBanner();
    // Do not leave keyboard focus on a button inside the now-hidden banner.
    if (banner.contains(document.activeElement)) document.querySelector('#main').focus({preventScroll:true});
  }

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-cookie-open]');
    if (!opener) return;
    returnFocus = opener;
    if (!dialog.open) dialog.showModal();
  });
  document.querySelector('#cookie-acknowledge').addEventListener('click', acknowledge);
  document.querySelector('#cookie-save').addEventListener('click', acknowledge);
  document.querySelector('#cookie-close').addEventListener('click', closeDialog);
  document.querySelector('#cookie-reset').addEventListener('click', () => {
    try { localStorage.removeItem(KEY); } catch { /* Storage may be unavailable. */ }
    acknowledgedInMemory = false;
    returnFocus = null;
    closeDialog();
    updateBanner();
    document.querySelector('#cookie-acknowledge').focus({preventScroll:true});
  });
  dialog.addEventListener('close', () => {
    if (returnFocus?.isConnected && !returnFocus.closest('[hidden]')) returnFocus.focus({preventScroll:true});
    returnFocus = null;
  });
  dialog.querySelectorAll('[data-cookie-policy-link]').forEach(link => link.addEventListener('click', closeDialog));
  window.addEventListener('hashchange', closeDialog);
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === null) { acknowledgedInMemory = false; updateBanner(); }
  });
  window.addEventListener('pageshow', updateBanner);
  window.addEventListener('resize', reserveBannerSpace);
  if ('ResizeObserver' in window) new ResizeObserver(reserveBannerSpace).observe(banner);
  updateBanner();
})();
