export default function announceToScreenReader(message, assertive = false) {
  const liveRegion = document.getElementById('rename-aria-live');
  if (!liveRegion) return;

  liveRegion.setAttribute('aria-live', 'assertive');

  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

export function ensureAriaLiveRegion() {
  if (!document.getElementById('rename-aria-live')) {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'rename-aria-live';
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('role', 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-9999px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }
}
