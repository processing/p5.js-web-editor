import { useMediaQuery } from 'react-responsive';

const useIsMobile = (customBreakpoint) => {
  const breakPoint = customBreakpoint || 770;
  const isMobile = useMediaQuery({ maxWidth: breakPoint });
  return isMobile;
};

export default useIsMobile;
