import { useEffect, useMemo, useState } from 'react';
import { useInView } from '../hooks';
import { svgToDataUri } from '../lib/exporter';

interface SvgPreviewProps {
  svg: string;
  alt: string;
  className?: string;
  /** `eager` renders immediately (hero, detail page); `lazy` waits for the viewport. */
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

function dimensions(svg: string): { width: number; height: number } | null {
  const match = /<svg[^>]*\bwidth="(\d+(?:\.\d+)?)"[^>]*\bheight="(\d+(?:\.\d+)?)"/.exec(svg);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * Renders an SVG source string exactly the way GitHub would: as an `<img>`
 * pointing at an SVG file. That keeps the animation context identical to the
 * published README (no inherited CSS, no scripts).
 */
export function SvgPreview({ svg, alt, className, loading = 'lazy', onClick }: SvgPreviewProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '320px' });
  const [ready, setReady] = useState(loading === 'eager');

  useEffect(() => {
    if (inView) setReady(true);
  }, [inView]);

  const dims = useMemo(() => dimensions(svg), [svg]);
  const src = useMemo(() => (ready && svg ? svgToDataUri(svg) : undefined), [ready, svg]);

  return (
    <div
      ref={ref}
      className={className}
      onClick={onClick}
      style={{ aspectRatio: dims ? `${dims.width} / ${dims.height}` : undefined, width: '100%' }}
    >
      {src ? (
        <img src={src} alt={alt} loading={loading} decoding="async" style={{ display: 'block', width: '100%', height: 'auto' }} />
      ) : (
        <div className="skeleton" style={{ width: '100%', height: '100%', minHeight: 90 }} />
      )}
    </div>
  );
}
