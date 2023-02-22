import { Workbox } from 'workbox-window';

export default function registerServiceWorker() {
  if (process.env.NODE_ENV !== 'porduction') return;

  if ('serviceWorker' in navigator) {
    const wb = new Workbox('sw.js');

    // this is to update the cache when app update available
    // wb.addEventListener('installed', (event) => {
    //   if (event.isUpdate) {
    //     if (confirm('New app update available, press update to reload')) {
    //       window.location.reload();
    //     }
    //   }
    // });

    wb.register();
  }
}
