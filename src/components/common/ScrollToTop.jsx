import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically resets the scroll position to top (0, 0) whenever
 * the user navigates to a new page or route across the entire website.
 * Preserves smooth section scrolling if a hash (#section) is present.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If a hash is specified (e.g., #section-id), scroll to that specific element
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Reset window and document scroll position to the top (0, 0)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
