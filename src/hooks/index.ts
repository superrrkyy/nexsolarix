import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { copyText } from '../lib/clipboard';

/** Fires once when the element scrolls into view — used to lazy-render previews. */
export function useInView<T extends HTMLElement>(options: { rootMargin?: string; threshold?: number } = {}): {
  ref: RefObject<T | null>;
  inView: boolean;
} {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: options.rootMargin ?? '200px', threshold: options.threshold ?? 0.05 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  return { ref, inView };
}

/** Adds the `.in` class to elements with `.reveal` as they enter the viewport. */
export function useRevealOnScroll(dependency?: unknown): void {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.in)'));
    if (elements.length === 0) return;
    if (typeof IntersectionObserver === 'undefined') {
      elements.forEach((element) => element.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [dependency]);
}

/** Tracks the pointer inside a card and exposes it as --mx / --my. */
export function useSpotlight<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = element.getBoundingClientRect();
        element.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        element.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      });
    };
    element.addEventListener('mousemove', onMove);
    return () => {
      element.removeEventListener('mousemove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

/** Global keyboard shortcut, ignores typing in inputs unless `allowInInputs`. */
export function useHotkey(
  combo: { key: string; meta?: boolean; shift?: boolean; allowInInputs?: boolean },
  handler: () => void,
): void {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (typing && !combo.allowInInputs) return;
      if (event.key.toLowerCase() !== combo.key.toLowerCase()) return;
      const wantsMeta = combo.meta ?? false;
      const hasMeta = event.metaKey || event.ctrlKey;
      if (wantsMeta !== hasMeta) return;
      if (combo.shift && !event.shiftKey) return;
      event.preventDefault();
      handler();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [combo.key, combo.meta, combo.shift, combo.allowInInputs, handler]);
}

/** Copy to clipboard with a short "copied" state for button labels. */
export function useCopy(resetAfter = 1800): { copied: boolean; copy: (text: string) => Promise<boolean> } {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  const copy = useCallback(
    async (text: string) => {
      const ok = await copyText(text);
      if (ok) {
        setCopied(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), resetAfter);
      }
      return ok;
    },
    [resetAfter],
  );

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  return { copied, copy };
}

/** Tracks page scroll progress 0..1 for the header bar. */
export function useScrollProgress(): void {
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      document.documentElement.style.setProperty('--scroll-progress', value.toFixed(4));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}

/** Media query hook with SSR-safe default. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', listener);
    return () => list.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
