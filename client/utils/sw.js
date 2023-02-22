import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';

// This clientsClaim() should be at the top level
// of your service worker, not inside of, e.g.,
// an event handler.
clientsClaim();

/**
 * We are not wrapping it in a 'message' event as per the new update.
 * @see https://developers.google.com/web/tools/workbox/modules/workbox-core
 */
// eslint-disable-next-line no-restricted-globals
self.skipWaiting();

// eslint-disable-next-line no-restricted-globals
precacheAndRoute(self.__WB_MANIFEST);
