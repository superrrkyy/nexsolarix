import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { validateKey, type License, type LicenseTier } from '../lib/license';

/* ------------------------------------------------------------------ *
 * Theme
 * ------------------------------------------------------------------ */

export type ThemeMode = 'dark' | 'light';

interface ThemeValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);
const THEME_KEY = 'nexsolarix.theme';

function readTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#05060c' : '#f6f8fd');
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const value = useMemo<ThemeValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}

/* ------------------------------------------------------------------ *
 * Licence / premium state
 * ------------------------------------------------------------------ */

interface LicenseValue {
  license: License | null;
  isPremium: boolean;
  tier: LicenseTier | null;
  activate: (raw: string) => License | null;
  deactivate: () => void;
}

const LicenseContext = createContext<LicenseValue | null>(null);
const LICENSE_KEY = 'nexsolarix.license';

function readLicense(): License | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LICENSE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { key?: string };
    if (!parsed.key) return null;
    // Re-validate on every load: a key minted with a different secret must not
    // silently keep premium unlocked after a redeploy.
    return validateKey(parsed.key);
  } catch {
    return null;
  }
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [license, setLicense] = useState<License | null>(readLicense);

  const activate = useCallback((raw: string) => {
    const next = validateKey(raw);
    if (!next) return null;
    setLicense(next);
    try {
      window.localStorage.setItem(LICENSE_KEY, JSON.stringify({ key: next.key, tier: next.tier }));
    } catch {
      /* ignore */
    }
    return next;
  }, []);

  const deactivate = useCallback(() => {
    setLicense(null);
    try {
      window.localStorage.removeItem(LICENSE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<LicenseValue>(
    () => ({
      license,
      isPremium: license !== null,
      tier: license?.tier ?? null,
      activate,
      deactivate,
    }),
    [license, activate, deactivate],
  );

  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>;
}

export function useLicense(): LicenseValue {
  const context = useContext(LicenseContext);
  if (!context) throw new Error('useLicense must be used inside <LicenseProvider>');
  return context;
}

/* ------------------------------------------------------------------ *
 * Library (favourites + recently viewed)
 * ------------------------------------------------------------------ */

interface LibraryValue {
  favourites: string[];
  toggleFavourite: (id: string) => boolean;
  isFavourite: (id: string) => boolean;
  recent: string[];
  markVisited: (id: string) => void;
}

const LibraryContext = createContext<LibraryValue | null>(null);
const FAV_KEY = 'nexsolarix.favourites';
const RECENT_KEY = 'nexsolarix.recent';

function readList(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<string[]>(() => readList(FAV_KEY));
  const [recent, setRecent] = useState<string[]>(() => readList(RECENT_KEY));

  const toggleFavourite = useCallback((id: string) => {
    let nowSaved = false;
    setFavourites((current) => {
      const exists = current.includes(id);
      nowSaved = !exists;
      const next = exists ? current.filter((item) => item !== id) : [id, ...current].slice(0, 80);
      writeList(FAV_KEY, next);
      return next;
    });
    return nowSaved;
  }, []);

  const markVisited = useCallback((id: string) => {
    setRecent((current) => {
      if (current[0] === id) return current;
      const next = [id, ...current.filter((item) => item !== id)].slice(0, 12);
      writeList(RECENT_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<LibraryValue>(
    () => ({
      favourites,
      toggleFavourite,
      isFavourite: (id: string) => favourites.includes(id),
      recent,
      markVisited,
    }),
    [favourites, recent, toggleFavourite, markVisited],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary(): LibraryValue {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used inside <LibraryProvider>');
  return context;
}

/* ------------------------------------------------------------------ *
 * Toasts
 * ------------------------------------------------------------------ */

export type ToastTone = 'info' | 'success' | 'warn' | 'error';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastValue {
  toasts: Toast[];
  push: (message: string, tone?: ToastTone, action?: Toast['action']) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback<ToastValue['push']>(
    (message, tone = 'info', action) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { id, message, tone, action }]);
      window.setTimeout(() => dismiss(id), action ? 8000 : 4200);
    },
    [dismiss],
  );

  const value = useMemo<ToastValue>(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
