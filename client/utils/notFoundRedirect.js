import browserHistory from '../browserHistory';
import { showToast } from '../modules/IDE/actions/toast';

/**
 * Handle a URL that doesn't resolve to a sketch, user or collection.
 *
 * The address is replaced (not pushed) with the editor root, so the dead URL
 * is dropped from the history stack — Back returns to wherever the user came
 * from rather than bouncing off the same missing resource again. A toast on
 * the way out says what wasn't found.
 *
 * `skipSavingPath` keeps App from remembering the dead URL as `previousPath`.
 *
 * @param {string} messageKey Toast translation key, e.g. 'Toast.SketchNotFound'
 */
export default function notFoundRedirect(messageKey) {
  return (dispatch) => {
    dispatch(showToast(messageKey));
    browserHistory.replace({
      pathname: '/',
      state: { skipSavingPath: true }
    });
  };
}
