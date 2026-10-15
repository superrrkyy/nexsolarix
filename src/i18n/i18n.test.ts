import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { dictionaries } from './dictionaries';

/**
 * i18n guards.
 *
 * A missing key silently prints the key itself (e.g. "detail.tabs.guide"),
 * which is invisible in code review but obvious to a visitor. These tests read
 * the source tree and fail when a `t('...')` key has no entry, when the two
 * languages drift apart, or when a translation is left empty.
 */

const SRC = resolve(import.meta.dirname, '..');

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

/** Every statically written `t('key')` / `t("key")` in the app source. */
function usedKeys(): Map<string, string> {
  const keys = new Map<string, string>();
  for (const file of sourceFiles(SRC)) {
    if (file.includes(`i18n${'/'}dictionaries.ts`)) continue;
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/\bt\(\s*'([^']+)'/g)) keys.set(match[1] as string, file);
    for (const match of source.matchAll(/\bt\(\s*"([^"]+)"/g)) keys.set(match[1] as string, file);
  }
  return keys;
}

describe('dictionaries', () => {
  it('define exactly the same keys in both languages', () => {
    const id = Object.keys(dictionaries.id).sort();
    const en = Object.keys(dictionaries.en).sort();
    const missingInEnglish = id.filter((key) => !(key in dictionaries.en));
    const missingInIndonesian = en.filter((key) => !(key in dictionaries.id));
    expect({ missingInEnglish, missingInIndonesian }).toEqual({ missingInEnglish: [], missingInIndonesian: [] });
    expect(id.length).toBeGreaterThan(250);
  });

  it('never ship an empty or placeholder translation', () => {
    const empty: string[] = [];
    for (const [locale, dictionary] of Object.entries(dictionaries)) {
      for (const [key, value] of Object.entries(dictionary)) {
        if (!value.trim()) empty.push(`${locale}:${key}`);
        // A value identical to its key means the copy was never written.
        if (value === key) empty.push(`${locale}:${key} (value === key)`);
      }
    }
    expect(empty).toEqual([]);
  });

  it('keep placeholders consistent across languages', () => {
    const mismatched: string[] = [];
    for (const key of Object.keys(dictionaries.id)) {
      const placeholders = (value: string) => [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
      const id = placeholders(dictionaries.id[key] as string);
      const en = placeholders(dictionaries.en[key] as string);
      if (id.join(',') !== en.join(',')) mismatched.push(`${key}: {${id.join('} {')}} vs {${en.join('} {')}}`);
    }
    expect(mismatched).toEqual([]);
  });
});

describe('translations used by the app', () => {
  const keys = usedKeys();

  it('resolves every t() key found in the source', () => {
    const unknown: string[] = [];
    for (const [key, file] of keys) {
      if (!(key in dictionaries.id) && !(key in dictionaries.en)) {
        unknown.push(`${key} (${file.replace(SRC, 'src')})`);
      }
    }
    expect(unknown).toEqual([]);
    expect(keys.size).toBeGreaterThan(150);
  });

  it('covers both languages for the pages a visitor actually reads', () => {
    // Spot-check the sections that carry the product rules.
    const critical = [
      'detail.locked.title',
      'detail.locked.desc',
      'detail.copyReadme',
      'detail.downloadReadme',
      'premium.redeem.title',
      'premium.steps.title',
      'gallery.empty.title',
      'gallery.empty.desc',
      'notfound.title',
      'nav.language',
      'toast.locked',
    ];
    for (const key of critical) {
      expect(dictionaries.id[key], `id:${key}`).toBeTruthy();
      expect(dictionaries.en[key], `en:${key}`).toBeTruthy();
    }
  });
});
