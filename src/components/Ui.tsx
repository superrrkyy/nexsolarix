import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useToast } from '../app/providers';
import { useCopy, useInView } from '../hooks';
import { IconCheck, IconChevronDown, IconClose, IconCopy, IconDownload, IconLock, IconSparkles } from './icons';

/* ------------------------------------------------------------------ *
 * Reveal wrapper
 * ------------------------------------------------------------------ */

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'in' : ''} ${className ?? ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Copy button
 * ------------------------------------------------------------------ */

interface CopyButtonProps {
  text: string;
  label: string;
  copiedLabel: string;
  className?: string;
  toastMessage?: string;
}

export function CopyButton({ text, label, copiedLabel, className, toastMessage }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  const { push } = useToast();

  return (
    <button
      type="button"
      className={className ?? 'btn btn--ghost btn--sm'}
      onClick={async () => {
        const ok = await copy(text);
        if (ok && toastMessage) push(toastMessage, 'success');
        else if (!ok) push('Clipboard blocked by the browser.', 'warn');
      }}
    >
      {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
      {copied ? copiedLabel : label}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Accordion
 * ------------------------------------------------------------------ */

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useMemo(() => `acc-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <div className={`accordion ${open ? 'is-open' : ''}`}>
      <button type="button" className="accordion__trigger" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        <IconChevronDown className="accordion__icon" size={18} />
      </button>
      <div className="accordion__panel" id={id} role="region">
        <div className="accordion__inner">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Lock overlay
 * ------------------------------------------------------------------ */

export function LockOverlay({
  title,
  description,
  ctaLabel,
  onCta,
  children,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  onCta: () => void;
  children: ReactNode;
}) {
  return (
    <div className="lock">
      <div className="lock__blur">{children}</div>
      <div className="lock__overlay">
        <div className="lock__card">
          <div className="lock__icon">
            <IconLock size={22} />
          </div>
          <h3 style={{ marginBottom: 8 }}>{title}</h3>
          <p className="small" style={{ marginBottom: 16 }}>
            {description}
          </p>
          <button type="button" className="btn btn--primary btn--block" onClick={onCta}>
            <IconSparkles size={16} />
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Code viewer
 * ------------------------------------------------------------------ */

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlight(line: string, language: 'xml' | 'markdown' | 'json' | 'text'): string {
  const escaped = escapeHtml(line);
  if (language === 'xml') {
    return escaped
      .replace(/&lt;!--[\s\S]*?--&gt;/g, (match) => `<span class="tok-comment">${match}</span>`)
      .replace(/(&lt;\/?)([a-zA-Z][\w:-]*)/g, '$1<span class="tok-tag">$2</span>')
      .replace(/([\w:-]+)=(&quot;[^&]*?&quot;|"[^"]*")/g, '<span class="tok-attr">$1</span>=<span class="tok-string">$2</span>');
  }
  if (language === 'markdown') {
    if (/^\s*#/.test(line)) return `<span class="tok-heading">${escaped}</span>`;
    if (/^\s*&lt;/.test(escaped) || /^\s*</.test(line)) {
      return escaped.replace(/(&lt;\/?)([a-zA-Z][\w-]*)/g, '$1<span class="tok-tag">$2</span>');
    }
    if (/^\s*&gt;/.test(escaped) || /^\s*>/.test(line)) return `<span class="tok-comment">${escaped}</span>`;
    return escaped;
  }
  if (language === 'json') {
    return escaped
      .replace(/(&quot;[\w-]+&quot;)(\s*:)/g, '<span class="tok-attr">$1</span>$2')
      .replace(/:\s*(&quot;.*?&quot;)/g, ': <span class="tok-string">$1</span>');
  }
  return escaped;
}

export function CodeView({
  code,
  language = 'text',
  maxHeight,
}: {
  code: string;
  language?: 'xml' | 'markdown' | 'json' | 'text';
  maxHeight?: number;
}) {
  const lines = useMemo(() => code.split('\n'), [code]);

  return (
    <div className="code-view" style={maxHeight ? { maxHeight } : undefined}>
      <div className="code-view__gutter" aria-hidden="true">
        {lines.map((_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <pre className="code-view__code">
        {lines.map((line, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: highlight(line, language) || '&nbsp;' }} />
        ))}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Preview frame (simulated GitHub)
 * ------------------------------------------------------------------ */

export function GithubFrame({
  children,
  light,
  label,
  onToggleTheme,
  toggleLabel,
}: {
  children: ReactNode;
  light: boolean;
  label: string;
  onToggleTheme?: () => void;
  toggleLabel?: string;
}) {
  return (
    <div className={`gh-frame ${light ? 'gh-frame--light' : ''}`}>
      <div className="gh-frame__bar">
        <span className="gh-frame__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
        {onToggleTheme ? (
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginLeft: 'auto' }} onClick={onToggleTheme}>
            {toggleLabel}
          </button>
        ) : null}
      </div>
      <div className="gh-frame__body">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Toast stack
 * ------------------------------------------------------------------ */

export function ToastStack() {
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    // nothing to do — kept for symmetry with future analytics hooks
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.tone}`}>
          <span className="toast__dot" aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <div className="toast__message">{toast.message}</div>
            {toast.action ? (
              <button type="button" className="btn btn--sm toast__action" onClick={toast.action.onClick}>
                {toast.action.label}
              </button>
            ) : null}
          </div>
          <button type="button" className="btn btn--icon btn--ghost" aria-label="Dismiss" onClick={() => dismiss(toast.id)}>
            <IconClose size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Download helper button
 * ------------------------------------------------------------------ */

export function DownloadButton({
  onDownload,
  label,
  className = 'btn btn--primary',
  icon = true,
}: {
  onDownload: () => Promise<void> | void;
  label: string;
  className?: string;
  icon?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  return (
    <button
      type="button"
      className={className}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onDownload();
        } finally {
          if (mounted.current) setBusy(false);
        }
      }}
    >
      {icon ? <IconDownload size={16} /> : null}
      {busy ? '…' : label}
    </button>
  );
}
