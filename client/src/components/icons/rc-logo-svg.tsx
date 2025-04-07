import React from "react";

interface RCLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export default function RCLogoSVG({ className = "", size = 32, color = "#000000" }: RCLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none"
      className={className}
      style={{ color: color }} // Use currentColor through styling
    >
      {/* Left X shape */}
      <rect x="20" y="50" width="40" height="10" rx="5" transform="rotate(45 20 50)" fill="currentColor"/>
      <rect x="14" y="75" width="40" height="10" rx="5" transform="rotate(-45 14 75)" fill="currentColor"/>
      <rect x="60" y="89" width="40" height="10" rx="5" transform="rotate(45 60 89)" fill="currentColor"/>
      <rect x="55" y="115" width="40" height="10" rx="5" transform="rotate(-45 55 115)" fill="currentColor"/>
      
      {/* Dots pattern */}
      <circle cx="85" cy="60" r="6" fill="currentColor"/>
      <circle cx="105" cy="60" r="6" fill="currentColor"/>
      <circle cx="95" cy="75" r="6" fill="currentColor"/>
      <circle cx="115" cy="75" r="6" fill="currentColor"/>
      <circle cx="125" cy="90" r="6" fill="currentColor"/>
      <circle cx="145" cy="90" r="6" fill="currentColor"/>
      <circle cx="135" cy="105" r="6" fill="currentColor"/>
      <circle cx="155" cy="105" r="6" fill="currentColor"/>
      <circle cx="165" cy="120" r="6" fill="currentColor"/>
      
      {/* Right diagonal lines */}
      <rect x="115" y="39" width="40" height="10" rx="5" transform="rotate(45 115 39)" fill="currentColor"/>
      <rect x="145" y="65" width="40" height="10" rx="5" transform="rotate(45 145 65)" fill="currentColor"/>
      <rect x="170" y="95" width="40" height="10" rx="5" transform="rotate(45 170 95)" fill="currentColor"/>
    </svg>
  );
}