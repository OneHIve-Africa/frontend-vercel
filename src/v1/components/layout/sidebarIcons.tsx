import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * FarmerIcon: A clean, Lucide-styled icon representing an agricultural farmer / beekeeper
 * featuring a wide-brim straw hat, facial silhouette, shoulders, and bib overalls.
 */
export const FarmerIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
  size,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    {/* Straw hat crown */}
    <path d="M7 9V5.5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2V9" />
    {/* Wide-brim straw hat */}
    <path d="M2 10.5c3-1.5 6.5-2 10-2s7 0.5 10 2" />
    {/* Face / neck */}
    <path d="M8.5 12v1a3.5 3.5 0 0 0 7 0v-1" />
    {/* Shoulders & body (proportional to Lucide User) */}
    <path d="M4 21v-1a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v1" />
    {/* Overalls straps */}
    <path d="M9.5 15v3.5" />
    <path d="M14.5 15v3.5" />
  </svg>
);

/**
 * BeehiveIcon: A clean, Lucide-styled icon representing a traditional bee hive (skep)
 * with tiered honey straw rings, entrance hole, and base board.
 */
export const BeehiveIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
  size,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    {/* Top dome tier */}
    <path d="M7.5 7.5a4.5 4.5 0 0 1 9 0" />
    {/* Upper middle tier */}
    <path d="M5.5 11.5c0-1.8 1.8-3.5 6.5-3.5s6.5 1.7 6.5 3.5" />
    {/* Lower middle tier */}
    <path d="M4 15.5c0-1.8 2-3.5 8-3.5s8 1.7 8 3.5" />
    {/* Bottom tier */}
    <path d="M3 19.5c0-1.8 2-3.5 9-3.5s9 1.7 9 3.5" />
    {/* Base flight board */}
    <line x1="2" y1="20" x2="22" y2="20" />
    {/* Hive entrance arch */}
    <path d="M10 20v-2a2 2 0 0 1 4 0v2" />
  </svg>
);

/**
 * StackOfCashIcon: A clean, Lucide-styled icon representing a stack/bundle of cash banknotes
 * layered with depth and banknote currency details.
 */
export const StackOfCashIcon: React.FC<IconProps> = ({
  className = "w-5 h-5",
  size,
  ...props
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    className={className}
    {...props}
  >
    {/* Back / 3rd banknote */}
    <path d="M16 4H4a2 2 0 0 0-2 2v6" />
    {/* Middle / 2nd banknote */}
    <path d="M19 7H7a2 2 0 0 0-2 2v6" />
    {/* Front / 1st banknote */}
    <rect x="6" y="10" width="16" height="10" rx="2" />
    {/* Central currency emblem */}
    <circle cx="14" cy="15" r="2" />
    {/* Banknote side markers */}
    <path d="M9.5 15h.01M18.5 15h.01" />
  </svg>
);

