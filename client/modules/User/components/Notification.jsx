import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { showToast, setToastText } from '../../IDE/actions/toast';

function Notification() {
  const dispatch = useDispatch();
  useEffect(() => {
    const notification = Cookies.get('p5-notification');
    if (!notification) {
      // show the toast
      dispatch(showToast(30000));
      const text = `There is a scheduled outage on Sunday, April 9 3AM - 5AM UTC.
        The entire site will be down, so please plan accordingly.`;
      dispatch(setToastText(text));
      Cookies.set('p5-notification', true, { expires: 365 });
    }
  });
  return null;
}

export default Notification;
