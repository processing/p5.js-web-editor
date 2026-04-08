import { useMediaQuery } from 'react-responsive';

export const useIsMobile = (customBreakpoint?: number): boolean => {
  const breakPoint = customBreakpoint || 770;
  const isMobile = useMediaQuery({ maxWidth: breakPoint });
  return isMobile;
};
