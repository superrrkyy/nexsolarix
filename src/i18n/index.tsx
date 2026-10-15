import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Locale, Localized } from '../core/types';
import { dictionaries } from './dictionaries';

const STORAGE_KEY = 'nexsolarix.locale';

export type Translate = (key: string, vars?: Record<string, string | number>) => string;

interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: Translate;
  /** Resolves a `{ id, en }` pair from the content registries. */
  pick: (value: Localized | undefined) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'id';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'id' || stored === 'en') return stored;
  const browser = window.navigator.language?.toLowerCase() ?? '';
  if (browser.startsWith('en')) return 'en';
  return 'id';
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next;
    } catch {
      /* storage can be unavailable in private mode — the UI still works */
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dictionary = dictionaries[locale];
    const fallback = dictionaries.id;
    const t: Translate = (key, vars) => interpolate(dictionary[key] ?? fallback[key] ?? key, vars);
    return {
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === 'id' ? 'en' : 'id'),
      t,
      pick: (localized) => (localized ? localized[locale] : ''),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}

export { dictionaries };
