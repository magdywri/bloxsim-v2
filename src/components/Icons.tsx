import React from 'react';

export function RobuxIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Crisp outer hexagon border */}
      <path
        d="M12 1.85L20.79 6.925V17.075L12 22.15L3.21 17.075V6.925L12 1.85Z"
        stroke="currentColor"
        strokeWidth="1.95"
        strokeLinejoin="round"
      />
      {/* Concentric filled inner hexagon with hollow square center */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 5.15L17.93 8.575V15.425L12 18.85L6.07 15.425V8.575L12 5.15ZM9.85 9.45C9.63 9.45 9.45 9.63 9.45 9.85V14.15C9.45 14.37 9.63 14.55 9.85 14.55H14.15C14.37 14.55 14.55 14.37 14.55 14.15V9.85C14.55 9.63 14.37 9.45 14.15 9.45H9.85Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function RobloxPlusIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5L20.2 7.25V16.75L12 21.5L3.8 16.75V7.25L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 16V8.5H13C14.38 8.5 15.25 9.35 15.25 10.65C15.25 11.95 14.38 12.8 13 12.8H9.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VerifiedBadge({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={className}
      aria-label="Verified badge"
    >
      <path
        d="M10 1.5L12.3 3.1L15.1 2.9L15.9 5.6L18.4 7L17.8 9.8L19.1 12.3L17.1 14.2L16.9 17L14.1 17.5L12.2 19.5L9.7 18.4L7.2 19.5L5.3 17.5L2.5 17L2.3 14.2L0.3 12.3L1.6 9.8L1 7L3.5 5.6L4.3 2.9L7.1 3.1L10 1.5Z"
        fill="#0066FF"
      />
      <path
        d="M6.6 10.2L8.9 12.5L13.6 7.8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center select-none ${className}`} aria-label="Roblox">
      <svg
        viewBox="0 0 124 28"
        fill="none"
        className="h-[20px] w-auto"
        aria-hidden="true"
      >
        {/* R */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 4H12.5C16.3 4 18.6 6.1 18.6 9.8C18.6 12.6 17 14.5 14.3 15.1L19.3 24H13.6L9.3 15.7H7.2V24H2V4ZM7.2 8.2V11.8H11.8C12.9 11.8 13.5 11.1 13.5 10C13.5 8.9 12.9 8.2 11.8 8.2H7.2Z"
          fill="currentColor"
        />
        {/* Iconic Roblox tilted square O (clockwise +13deg) */}
        <g transform="translate(31.5 14) rotate(13)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-9.4 -9.4H9.4V9.4H-9.4V-9.4ZM-3.1 -3.1V3.1H3.1V-3.1H-3.1Z"
            fill="currentColor"
          />
        </g>
        {/* B */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M44.5 4H55.2C58.6 4 60.8 5.8 60.8 8.9C60.8 11 59.6 12.5 57.7 13.2C60.1 13.8 61.5 15.6 61.5 18.3C61.5 21.8 59.1 24 55.2 24H44.5V4ZM49.6 8V11.7H54.1C55.2 11.7 55.8 11 55.8 9.85C55.8 8.7 55.2 8 54.1 8H49.6ZM49.6 15.3V19.9H54.6C55.8 19.9 56.5 19 56.5 17.6C56.5 16.2 55.8 15.3 54.6 15.3H49.6Z"
          fill="currentColor"
        />
        {/* L */}
        <path
          d="M64.5 4H69.8V19.5H78.5V24H64.5V4Z"
          fill="currentColor"
        />
        {/* Second O (chunky upright geometric O) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M89.5 3.7C95.6 3.7 99.4 7.7 99.4 14C99.4 20.3 95.6 24.3 89.5 24.3C83.4 24.3 79.6 20.3 79.6 14C79.6 7.7 83.4 3.7 89.5 3.7ZM89.5 8.1C86.4 8.1 84.8 10.4 84.8 14C84.8 17.6 86.4 19.9 89.5 19.9C92.6 19.9 94.2 17.6 94.2 14C94.2 10.4 92.6 8.1 89.5 8.1Z"
          fill="currentColor"
        />
        {/* X */}
        <path
          d="M101.2 4H107.1L110.7 10.2L114.3 4H120L113.8 13.9L120.4 24H114.4L110.6 17.5L106.8 24H100.9L107.4 13.9L101.2 4Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function RobloxSquareMark({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={className}
      aria-label="Roblox"
    >
      <g transform="translate(14 14) rotate(13)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M-10 -10H10V10H-10V-10ZM-3.1 -3.1V3.1H3.1V-3.1H-3.1Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
