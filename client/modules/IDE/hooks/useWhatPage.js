import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getConfig } from '../../../utils/getConfig';

// The "Examples" view is a configured OpenProcessing collection page.
const examplesEndpoint = getConfig('EXAMPLES_ENDPOINT', {
  nullishString: true,
  warn: false
});

/**
 *
 * @returns {"home" | "myStuff" | "login" | "signup" | "account" | "examples"}
 */
const useWhatPage = () => {
  const username = useSelector((state) => state.user.username);
  const { pathname } = useLocation();

  const pageName = useMemo(() => {
    const myStuffPattern = new RegExp(
      `(/${username}/(sketches/?$|collections|assets)/?)`
    );

    if (myStuffPattern.test(pathname)) return 'myStuff';
    else if (pathname === '/login') return 'login';
    else if (pathname === '/signup') return 'signup';
    else if (pathname === '/account') return 'account';
    else if (examplesEndpoint && pathname === examplesEndpoint)
      return 'examples';
    return 'home';
  }, [pathname, username]);

  return pageName;
};

export default useWhatPage;
