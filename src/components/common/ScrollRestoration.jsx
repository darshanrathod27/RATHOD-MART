import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// In-memory storage for scroll positions (no sessionStorage)
const scrollCache = {
  lastPath: "",
  scrollPosition: 0,
};

const ScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Restore scroll position if returning to same page
    if (scrollCache.lastPath === currentPath && scrollCache.scrollPosition) {
      setTimeout(() => {
        window.scrollTo(0, scrollCache.scrollPosition);
      }, 100);
    } else {
      // Scroll to top for new pages
      window.scrollTo(0, 0);
    }

    // Update cache with current path
    scrollCache.lastPath = currentPath;

    // Save scroll position on scroll
    const handleScroll = () => {
      scrollCache.scrollPosition = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  return null;
};

export default ScrollRestoration;
