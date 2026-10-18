import React, { useId } from 'react';
import { motion } from 'framer-motion';

export interface ThemeToggleIconProps {
  /**
   * Mode to display:
   * - 'sun': Render the radiant Sun icon
   * - 'moon': Render the sleek crescent Moon icon
   *
   * Or pass `theme`:
   * - 'dark': When in dark mode, navbar button shows 'sun' (target: switch to light)
   * - 'light': When in light mode, navbar button shows 'moon' (target: switch to dark)
   */
  mode?: 'sun' | 'moon';
  theme?: 'light' | 'dark';
  /** Target icon behavior: defaults to 'target' (i.e. dark mode shows Sun, light shows Moon) */
  displayMode?: 'target' | 'current';
  className?: string;
  size?: number | string;
  sunColor?: string;
  moonColor?: string;
}

/**
 * Animated ThemeToggleIcon
 * Uses Framer Motion to smoothly morph between the moon and sun icons:
 * - Rotates elastically between 0° and 40°
 * - Smoothly morphs central circle between Sun core (r=5) and Moon crescent (r=9) via animated SVG mask
 * - Sun rays gracefully scale, spin, and expand outward / retract inward
 * - Color smoothly transitions between warm golden sun (#fbbf24) and celestial indigo moon (#6366f1)
 */
export const ThemeToggleIcon: React.FC<ThemeToggleIconProps> = ({
  mode,
  theme,
  displayMode = 'target',
  className = 'w-4 h-4',
  size,
  sunColor = '#fbbf24',
  moonColor = '#6366f1',
}) => {
  const rawId = useId();
  const maskId = `theme-mask-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Determine whether to display the Sun or Moon icon
  const isSun = mode
    ? mode === 'sun'
    : displayMode === 'target'
    ? theme === 'dark' // in dark mode, show Sun to switch to light
    : theme === 'light'; // current mode

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={`${className} overflow-visible inline-block align-middle select-none`}
      initial={false}
      animate={{
        rotate: isSun ? 0 : 40,
        color: isSun ? sunColor : moonColor,
      }}
      whileHover={{ scale: 1.15, rotate: isSun ? 15 : 25 }}
      whileTap={{ scale: 0.88, rotate: isSun ? -25 : 65 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 18,
      }}
    >
      <defs>
        <mask id={maskId}>
          {/* Base white surface */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Moving black circle that carves out the crescent moon */}
          <motion.circle
            initial={false}
            animate={{
              cx: isSun ? 28 : 17,
              cy: isSun ? 2 : 7,
              r: isSun ? 0 : 7.2,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            fill="black"
          />
        </mask>
      </defs>

      {/* Central Celestial Body (Full Sun circle -> Moon crescent via cutting mask) */}
      <motion.circle
        cx="12"
        cy="12"
        fill="currentColor"
        mask={`url(#${maskId})`}
        initial={false}
        animate={{
          r: isSun ? 5 : 9,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      />

      {/* Sun's 8 Radiating Beams - scale and rotate outward / inward with spring */}
      <motion.g
        stroke="currentColor"
        initial={false}
        animate={{
          scale: isSun ? 1 : 0,
          opacity: isSun ? 1 : 0,
          rotate: isSun ? 0 : -60,
        }}
        transition={{
          type: 'spring',
          stiffness: 280,
          damping: 20,
        }}
        style={{
          transformOrigin: '12px 12px',
        }}
      >
        {/* Cardinal Rays */}
        <line x1="12" y1="1.5" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="22.5" y2="12" />

        {/* Diagonal Rays */}
        <line x1="4.5" y1="4.5" x2="6" y2="6" />
        <line x1="18" y1="18" x2="19.5" y2="19.5" />
        <line x1="4.5" y1="19.5" x2="6" y2="18" />
        <line x1="18" y1="6" x2="19.5" y2="4.5" />
      </motion.g>
    </motion.svg>
  );
};

export default ThemeToggleIcon;
