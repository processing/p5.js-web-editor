import { dispatchMessage, MessageTypes } from '../../../utils/dispatcher';

const PREVIEW_RESPONSE_TIMEOUT = 2000;

export default function capturePreviewImage() {
  return new Promise((resolve) => {
    let timer;

    function handleMessage(event) {
      const { data } = event;
      if (!data || data.type !== MessageTypes.PREVIEW_IMAGE) return;

      window.removeEventListener('message', handleMessage);
      window.clearTimeout(timer);

      if (data?.payload?.image) {
        resolve(data.payload.image);
      } else {
        resolve(null);
      }
    }

    timer = window.setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      resolve(null);
    }, PREVIEW_RESPONSE_TIMEOUT);

    window.addEventListener('message', handleMessage);
    dispatchMessage({ type: MessageTypes.REQUEST_PREVIEW_IMAGE });
  });
}
