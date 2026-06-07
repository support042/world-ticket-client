import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * 
 * Automatically scrolls the window to the top (0, 0) whenever the route path changes.
 * This is crucial in SPA apps to avoid pages starting scrolled halfway down.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
