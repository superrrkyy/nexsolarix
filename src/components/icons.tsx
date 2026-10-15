import type { SVGProps } from 'react';

/**
 * Hand-rolled icon set: 1.6px strokes, 24px grid, currentColor.
 * Keeping them local avoids an icon dependency and keeps the bundle tiny.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconSearch = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const IconMenu = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 6h18M3 12h18M3 18h18" />
  </Svg>
);

export const IconClose = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconChevronDown = (props: IconProps) => (
  <Svg {...props}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const IconChevronRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const IconArrowRight = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconArrowLeft = (props: IconProps) => (
  <Svg {...props}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const IconCopy = (props: IconProps) => (
  <Svg {...props}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H5.5A2.5 2.5 0 0 0 3 5.5v7A2.5 2.5 0 0 0 5.5 15" />
  </Svg>
);

export const IconCheck = (props: IconProps) => (
  <Svg {...props}>
    <path d="m4 12.5 5 5L20 6.5" />
  </Svg>
);

export const IconDownload = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3v12M7 11l5 5 5-5" />
    <path d="M4 20h16" />
  </Svg>
);

export const IconLock = (props: IconProps) => (
  <Svg {...props}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
  </Svg>
);

export const IconSparkles = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6L12 3Z" />
    <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </Svg>
);

export const IconHeart = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.3-7-9.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7 2.8C19 15.7 12 20 12 20Z" />
  </Svg>
);

export const IconSun = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </Svg>
);

export const IconMoon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Svg>
);

export const IconGlobe = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9h17M3.5 15h17M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3Z" />
  </Svg>
);

export const IconCode = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 8-4 4 4 4M15 8l4 4-4 4" />
  </Svg>
);

export const IconLayers = (props: IconProps) => (
  <Svg {...props}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
);

export const IconZap = (props: IconProps) => (
  <Svg {...props}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </Svg>
);

export const IconWand = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 20 15 9" />
    <path d="m17 3 .9 2.4L20 6.3l-2.1.9L17 9.6l-.9-2.4L14 6.3l2.1-.9L17 3Z" />
    <path d="M10.5 4.5 11 6l1.5.5L11 7l-.5 1.5L10 7l-1.5-.5L10 6l.5-1.5Z" />
  </Svg>
);

export const IconTerminal = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="m7 9 3 3-3 3M13 15h4" />
  </Svg>
);

export const IconPalette = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-3.5 3.5H16a2 2 0 0 0-1.4 3.4c.4.5.1 1.1-.6 1.1H12Z" />
    <circle cx="8.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15.8" cy="9.8" r="1.2" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconFile = (props: IconProps) => (
  <Svg {...props}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
  </Svg>
);

export const IconImage = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </Svg>
);

export const IconCrown = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 8.5 8 11l4-5 4 5 4-2.5-1.5 9.5h-13L4 8.5Z" />
  </Svg>
);

export const IconBook = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z" />
    <path d="M19 18v3H6.5A2.5 2.5 0 0 1 4 18.5" />
  </Svg>
);

export const IconShuffle = (props: IconProps) => (
  <Svg {...props}>
    <path d="M17 3h4v4M21 3l-6.5 6.5M7 21H3v-4M3 21l6.5-6.5M17 21h4v-4M14.5 14.5 21 21M7 3H3v4M3 3l6.5 6.5" />
  </Svg>
);

export const IconGrid = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </Svg>
);

export const IconGithub = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9 19c-4.3 1.4-4.3-2.2-6-2.6m12 5v-3.6a3 3 0 0 0-.9-2.4c3-.3 6-1.5 6-6.7A5.2 5.2 0 0 0 18.7 5a4.9 4.9 0 0 0-.1-3.5s-1.2-.4-3.9 1.6a12 12 0 0 0-6.4 0C5.6 1.1 4.4 1.5 4.4 1.5A4.9 4.9 0 0 0 4.3 5 5.2 5.2 0 0 0 3 8.7c0 5.1 3 6.4 6 6.7a3 3 0 0 0-.9 2.3V21" />
  </Svg>
);

export const IconInstagram = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const IconEye = (props: IconProps) => (
  <Svg {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);

export const IconKey = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="8" cy="14" r="4" />
    <path d="m11 11 8-8M17 5l2 2M14 8l2 2" />
  </Svg>
);

export const IconInfo = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 7.8v.4" />
  </Svg>
);

export const IconRefresh = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 11A8 8 0 0 0 6 6.5L4 9" />
    <path d="M4 4v5h5" />
    <path d="M4 13a8 8 0 0 0 14 4.5L20 15" />
    <path d="M20 20v-5h-5" />
  </Svg>
);

export const IconRocket = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" />
    <path d="M14.5 4.5C17 2 21 3 21 3s1 4-1.5 6.5L13 16H8l-3-3v-5l9.5-3.5Z" />
    <circle cx="14.5" cy="9.5" r="1.4" />
  </Svg>
);
