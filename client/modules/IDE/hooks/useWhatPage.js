import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

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
    else if (pathname === '/p5/collections' || pathname === '/p5/sketches')
      return 'examples';
    return 'home';
  }, [pathname, username]);

  return pageName;
};

export default useWhatPage;
