import React, { createContext, useContext, useEffect } from 'react';
import { institutionConfig } from '../../config/institution.config';

const ThemeContext = createContext(institutionConfig);

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Inject institutional brand colors dynamically into CSS custom properties
    const root = document.documentElement;
    if (institutionConfig.theme) {
      if (institutionConfig.theme.primaryColor) {
        root.style.setProperty('--accent-bright-blue', institutionConfig.theme.primaryColor);
        root.style.setProperty('--primary-brand', institutionConfig.theme.primaryColor);
      }
      if (institutionConfig.theme.accentColor) {
        root.style.setProperty('--accent-emerald', institutionConfig.theme.accentColor);
      }
      if (institutionConfig.theme.purpleAccent) {
        root.style.setProperty('--accent-purple', institutionConfig.theme.purpleAccent);
      }
      if (institutionConfig.theme.amberAccent) {
        root.style.setProperty('--accent-amber', institutionConfig.theme.amberAccent);
      }
    }
  }, []);

  return (
    <ThemeContext.Provider value={institutionConfig}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return institutionConfig;
  }
  return context;
}
