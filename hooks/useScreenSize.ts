import { useEffect, useMemo, useState } from 'react';

interface ScreenSizeState {
  isMobile: boolean;
  isDesktop: boolean;
}

const MOBILE_MAX_WIDTH = 767;
const DESKTOP_MIN_WIDTH = 768;

const getInitialState = (): ScreenSizeState => {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isDesktop: true,
    };
  }

  const width = window.innerWidth;
  return {
    isMobile: width <= MOBILE_MAX_WIDTH,
    isDesktop: width >= DESKTOP_MIN_WIDTH,
  };
};

const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;
const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`;

export const useScreenSize = (): ScreenSizeState => {
  const [state, setState] = useState<ScreenSizeState>(getInitialState);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mobileMedia = window.matchMedia(MOBILE_MEDIA_QUERY);
    const desktopMedia = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const updateState = () => {
      setState({
        isMobile: mobileMedia.matches,
        isDesktop: desktopMedia.matches,
      });
    };

    // Initialize with current values
    updateState();

    mobileMedia.addEventListener('change', updateState);
    desktopMedia.addEventListener('change', updateState);

    return () => {
      mobileMedia.removeEventListener('change', updateState);
      desktopMedia.removeEventListener('change', updateState);
    };
  }, []);

  return useMemo(() => state, [state]);
};

export default useScreenSize;

