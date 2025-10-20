import React from 'react';

export const AppLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 3L3 7V13.5C3 17.9 6.8 21.7 12 23C17.2 21.7 21 17.9 21 13.5V7L12 3Z" fill="#111827"/>
    <path d="M5 14.5C5 14.5 7.5 16 12 16C16.5 16 19 14.5 19 14.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9.5L12 12M19 9.5L12 12M12 12V21" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
