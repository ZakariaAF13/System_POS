'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

const translations = {
  id: {
    common: {
      welcome: 'Selamat Datang',
      table: 'Meja',
      cart: 'Keranjang',
      menu: 'Menu',
      promo: 'Promo',
      checkout: 'Checkout',
      total: 'Total',
      item: 'Item',
      all: 'Semua',
      addToCart: 'Tambah ke Keranjang',
      notAvailable: 'Tidak Tersedia',
      emptyCart: 'Keranjang belanja Anda masih kosong',
      loading: 'Memuat...',
    },
    error: {
      noTableId: 'Table ID tidak ditemukan. Silakan scan QR Code yang tersedia di meja Anda.',
      title: 'Error',
    },
    navigation: {
      menu: 'Menu',
      promo: 'Promo',
      cart: 'Keranjang',
      navigationMenu: 'Menu Navigasi',
    },
    promo: {
      specialPromo: 'Promo Spesial',
      discount: 'Diskon',
    },
    category: {
      mainCourse: 'Main Course',
      drinks: 'Drinks',
      snacks: 'Snacks',
    },
  },
  en: {
    common: {
      welcome: 'Welcome',
      table: 'Table',
      cart: 'Cart',
      menu: 'Menu',
      promo: 'Promo',
      checkout: 'Checkout',
      total: 'Total',
      item: 'Item',
      all: 'All',
      addToCart: 'Add to Cart',
      notAvailable: 'Not Available',
      emptyCart: 'Your shopping cart is empty',
      loading: 'Loading...',
    },
    error: {
      noTableId: 'Table ID not found. Please scan the QR Code available at your table.',
      title: 'Error',
    },
    navigation: {
      menu: 'Menu',
      promo: 'Promo',
      cart: 'Cart',
      navigationMenu: 'Navigation Menu',
    },
    promo: {
      specialPromo: 'Special Promo',
      discount: 'Discount',
    },
    category: {
      mainCourse: 'Main Course',
      drinks: 'Drinks',
      snacks: 'Snacks',
    },
  },
};
