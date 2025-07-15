import { useEffect } from 'react';
import { Platform } from 'react-native';

const WebStyleInjector = () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Inject CSS directly into the document head
      const css = `
        /* Fix for React Native Web button interaction issues */
        [data-focusable="true"] {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        div[role="button"],
        span[role="button"] {
          pointer-events: auto !important;
          cursor: pointer !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        div[data-pressable-container="true"] {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        .button,
        [class*="button"],
        [data-testid*="button"] {
          pointer-events: auto !important;
          cursor: pointer !important;
          user-select: none !important;
        }

        div[role="button"] *,
        span[role="button"] * {
          pointer-events: none !important;
        }

        div[data-focusable],
        div[data-pressable],
        span[data-focusable],
        span[data-pressable] {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        [role="button"] {
          z-index: 1;
          position: relative;
        }

        /* Additional fixes for common React Native Web issues */
        * {
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `;

      const style = document.createElement('style');
      style.type = 'text/css';
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);

      return () => {
        // Cleanup
        document.head.removeChild(style);
      };
    }
  }, []);

  return null;
};

export default WebStyleInjector;
