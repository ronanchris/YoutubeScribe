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
      viewBox="0 0 512 512" 
      fill="none"
      className={className}
      style={{ color }} 
    >
      {/* Left section (X) */}
      <rect x="56" y="130" width="100" height="36" rx="18" transform="rotate(45 56 130)" fill={color}/>
      <rect x="39" y="255" width="100" height="36" rx="18" transform="rotate(-45 39 255)" fill={color}/>
      <rect x="155" y="230" width="100" height="36" rx="18" transform="rotate(45 155 230)" fill={color}/>
      <rect x="140" y="355" width="100" height="36" rx="18" transform="rotate(-45 140 355)" fill={color}/>

      {/* Center dots */}
      <circle cx="170" cy="150" r="18" fill={color}/>
      <circle cx="225" cy="150" r="18" fill={color}/>
      <circle cx="280" cy="150" r="18" fill={color}/>
      
      <circle cx="225" cy="205" r="18" fill={color}/>
      <circle cx="280" cy="205" r="18" fill={color}/>
      <circle cx="335" cy="205" r="18" fill={color}/>
      
      <circle cx="280" cy="260" r="18" fill={color}/>
      <circle cx="335" cy="260" r="18" fill={color}/>
      <circle cx="390" cy="260" r="18" fill={color}/>
      
      <circle cx="335" cy="315" r="18" fill={color}/>
      <circle cx="390" cy="315" r="18" fill={color}/>
      <circle cx="445" cy="315" r="18" fill={color}/>
      
      <circle cx="390" cy="370" r="18" fill={color}/>
      
      {/* Right diagonal lines */}
      <rect x="255" y="110" width="100" height="36" rx="18" transform="rotate(45 255 110)" fill={color}/>
      <rect x="310" y="165" width="100" height="36" rx="18" transform="rotate(45 310 165)" fill={color}/>
      <rect x="365" y="220" width="100" height="36" rx="18" transform="rotate(45 365 220)" fill={color}/>
      <rect x="420" y="275" width="100" height="36" rx="18" transform="rotate(45 420 275)" fill={color}/>
    </svg>
  );
}