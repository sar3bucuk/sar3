import React, { createContext, useContext, useState, useEffect } from 'react';
import tr from '../locales/tr.json';
import en from '../locales/en.json';

const LanguageContext = createContext();

const translations = {
  tr,
  en
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'tr';
  });

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback to Turkish if translation not found
        value = translations['tr'];
        for (const fallbackKey of keys) {
          if (value && value[fallbackKey]) {
            value = value[fallbackKey];
          } else {
            return key; // Return the key if translation not found
          }
        }
        break;
      }
    }
    
    return value || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext; 