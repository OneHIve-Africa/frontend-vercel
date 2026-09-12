import React, { useId } from "react";

interface HoneycombPatternProps {
  className?: string;
  opacity?: number;
  color?: string;
}

export const HoneycombPattern: React.FC<HoneycombPatternProps> = ({
  className = "",
  opacity = 0.06,
  color = "#266B3F",
}) => {
  const uniqueId = useId();
  const patternId = `honeycomb-${uniqueId.replace(/:/g, "")}`;

  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      fill="none"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          width="28"
          height="48.5"
          patternUnits="userSpaceOnUse"
        >
          {/* Top center hexagon */}
          <path
            d="M14 0 L28 8.08 L28 24.25 L14 32.33 L0 24.25 L0 8.08 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {/* Bottom left shifted hexagon */}
          <path
            d="M0 48.5 L14 40.42 L14 24.25 L0 16.17 L-14 24.25 L-14 40.42 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {/* Bottom right shifted hexagon */}
          <path
            d="M28 48.5 L42 40.42 L42 24.25 L28 16.17 L14 24.25 L14 40.42 Z"
            fill="none"
            stroke={color}
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
};

export default HoneycombPattern;
