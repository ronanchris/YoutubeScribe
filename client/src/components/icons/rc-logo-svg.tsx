import React from 'react';

interface RCLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function RCLogoSVG({ className = "", size = 32, color = "#000000" }: RCLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* First group of lines and dots (X pattern) */}
      <path d="M20 15L35 30" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <path d="M35 15L20 30" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <circle cx="13" cy="40" r="5" fill={color} />
      <circle cx="42" cy="40" r="5" fill={color} />
      
      {/* Center dots */}
      <circle cx="55" cy="25" r="5" fill={color} />
      <circle cx="65" cy="25" r="5" fill={color} />
      
      {/* Second group of lines and dots (diagonal pattern) */}
      <path d="M75 15L60 30" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <path d="M85 30L70 45" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <circle cx="55" cy="45" r="5" fill={color} />
      <circle cx="65" cy="55" r="5" fill={color} />
      <path d="M75 55L60 70" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <path d="M85 75L70 90" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <circle cx="55" cy="80" r="5" fill={color} />
    </svg>
  );
}