// Font preloader for web to prevent timeout errors
import { useEffect, useState } from 'react';

export function useFontLoader() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        // For web, fonts are loaded via CDN link in HTML head
        // Just set a short delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Font loading warning:', error);
        // Don't block the app for font loading issues
        setFontsLoaded(true);
        setFontError(error instanceof Error ? error.message : 'Unknown font error');
      }
    }

    loadFonts();
  }, []);

  return { fontsLoaded, fontError };
}
