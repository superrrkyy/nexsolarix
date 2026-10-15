import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_ANIMATIONS } from '../animations';
import { ALL_TEMPLATES } from '../templates';
import { useI18n } from '../i18n';
import { useTheme } from '../app/providers';
import { instagramUrl } from '../core/site';
import { IconGlobe, IconGrid, IconImage, IconInstagram, IconMoon, IconSearch, IconSparkles, IconSun } from './icons';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { t, toggleLocale, pick } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = [
      { id: 'page-home', group: t('cmd.pages'), label: 'Home', icon: <IconSparkles size={16} />, run: () => navigate('/') },
      { id: 'page-templates', group: t('cmd.pages'), label: t('nav.templates'), icon: <IconGrid size={16} />, run: () => navigate('/templates') },
      { id: 'page-animations', group: t('cmd.pages'), label: t('nav.animations'), icon: <IconImage size={16} />, run: () => navigate('/animations') },
      { id: 'page-premium', group: t('cmd.pages'), label: t('nav.premium'), icon: <IconSparkles size={16} />, run: () => navigate('/premium') },
      { id: 'page-guide', group: t('cmd.pages'), label: t('nav.guide'), icon: <IconSearch size={16} />, run: () => navigate('/guide') },
    ];

    const actions: Command[] = [
      {
        id: 'action-theme',
        group: t('cmd.pages'),
        label: t('cmd.actionToggleTheme'),
        hint: theme === 'dark' ? '→ light' : '→ dark',
        icon: theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />,
        run: toggleTheme,
      },
      {
        id: 'action-locale',
        group: t('cmd.pages'),
        label: t('cmd.actionToggleLocale'),
        icon: <IconGlobe size={16} />,
        run: toggleLocale,
      },
      {
        id: 'action-instagram',
        group: t('cmd.pages'),
        label: `Instagram @${instagramUrl().split('/').pop()}`,
        icon: <IconInstagram size={16} />,
        run: () => window.open(instagramUrl(), '_blank', 'noopener'),
      },
    ];

    const templates: Command[] = ALL_TEMPLATES.map((template) => ({
      id: `tpl-${template.id}`,
      group: t('cmd.templates'),
      label: pick(template.name),
      hint: template.tier === 'premium' ? 'premium' : 'free',
      icon: <IconGrid size={16} />,
      run: () => navigate(`/templates/${template.id}`),
    }));

    const animations: Command[] = ALL_ANIMATIONS.map((animation) => ({
      id: `anim-${animation.id}`,
      group: t('cmd.animations'),
      label: pick(animation.name),
      hint: animation.group,
      icon: <IconImage size={16} />,
      run: () => navigate(`/animations/${animation.id}`),
    }));

    return [...pages, ...actions, ...templates, ...animations];
  }, [navigate, pick, t, theme, toggleLocale, toggleTheme]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands.slice(0, 40);
    return commands
      .filter((command) => command.label.toLowerCase().includes(needle) || command.group.toLowerCase().includes(needle))
      .slice(0, 40);
  }, [commands, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const command = filtered[activeIndex];
        if (command) {
          command.run();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, activeIndex, onClose]);

  if (!open) return null;

  let lastGroup = '';

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={t('cmd.title')} onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <IconSearch size={18} />
          <input
            ref={inputRef}
            className="modal__input"
            placeholder={t('cmd.placeholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={t('cmd.title')}
          />
          <kbd>Esc</kbd>
        </div>

        <div className="modal__list">
          {filtered.length === 0 ? (
            <p className="muted small" style={{ padding: '20px 12px' }}>
              {t('cmd.empty', { query })}
            </p>
          ) : (
            filtered.map((command, index) => {
              const showGroup = command.group !== lastGroup;
              lastGroup = command.group;
              return (
                <div key={command.id}>
                  {showGroup ? <div className="cmd-group__title">{command.group}</div> : null}
                  <button
                    type="button"
                    className={`cmd-item ${index === activeIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      command.run();
                      onClose();
                    }}
                  >
                    <span className="cmd-item__icon">{command.icon}</span>
                    <span>{command.label}</span>
                    {command.hint ? <span className="cmd-item__meta">{command.hint}</span> : null}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="modal__footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> {t('common.prevNext')}
          </span>
          <span>
            <kbd>↵</kbd> {t('common.select')}
          </span>
          <span style={{ marginLeft: 'auto' }}>
            <kbd>Esc</kbd> {t('common.close')}
          </span>
        </div>
      </div>
    </div>
  );
}
