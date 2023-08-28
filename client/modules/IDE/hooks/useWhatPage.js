import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

/**
 *
 * @returns {"home" | "myStuff" | "login" | "signup" | "account" | "examples"}
 */
const useWhatPage = () => {
  const projectName = useSelector((state) => state.project.name);
  const username = useSelector((state) => state.user.username);
  const { pathname } = useLocation();

  const [pageName, setPageName] = useState(projectName);

  const myStuffPattern = new RegExp(
    `(/${username}/(sketches/?$|collections|assets)/?)`
  );

  useEffect(() => {
    if (myStuffPattern.test(pathname)) setPageName('myStuff');
    else if (pathname === '/login') setPageName('login');
    else if (pathname === '/signup') setPageName('signup');
    else if (pathname === '/account') setPageName('account');
    else if (pathname === '/p5/collections' || pathname === '/p5/sketches')
      setPageName('examples');
  }, [pathname]);

  return pageName;
};

export default useWhatPage;
