'use client';

/**
 * Cartoon-style SVG illustrations for error pages
 */

export function NotFoundIllustration() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#db2777', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#9333ea', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="200" cy="200" r="150" fill="url(#grad1)" />
      
      {/* Cartoon character - sad face */}
      <circle cx="200" cy="180" r="80" fill="#1f2937" stroke="#db2777" strokeWidth="3" />
      
      {/* Eyes */}
      <circle cx="180" cy="160" r="12" fill="#db2777" />
      <circle cx="220" cy="160" r="12" fill="#db2777" />
      <circle cx="182" cy="158" r="4" fill="#fff" />
      <circle cx="222" cy="158" r="4" fill="#fff" />
      
      {/* Sad mouth */}
      <path d="M 170 200 Q 200 220 230 200" stroke="#db2777" strokeWidth="4" fill="none" strokeLinecap="round" />
      
      {/* 404 text */}
      <text x="200" y="320" fontFamily="Arial, sans-serif" fontSize="64" fill="#db2777" textAnchor="middle" fontWeight="bold">404</text>
      
      {/* Decorative stars */}
      <path d="M 100 100 L 105 115 L 120 115 L 108 125 L 113 140 L 100 130 L 87 140 L 92 125 L 80 115 L 95 115 Z" fill="#9333ea" opacity="0.6" />
      <path d="M 300 120 L 303 130 L 313 130 L 306 137 L 309 147 L 300 140 L 291 147 L 294 137 L 287 130 L 297 130 Z" fill="#db2777" opacity="0.6" />
    </svg>
  );
}

export function ErrorIllustration() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#ea580c', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <circle cx="200" cy="200" r="150" fill="url(#grad2)" />
      
      {/* Warning triangle */}
      <path d="M 200 100 L 250 220 L 150 220 Z" fill="#dc2626" stroke="#fff" strokeWidth="3" />
      <path d="M 200 100 L 250 220 L 150 220 Z" fill="none" stroke="#dc2626" strokeWidth="4" />
      
      {/* Exclamation mark */}
      <rect x="195" y="140" width="10" height="40" rx="5" fill="#fff" />
      <circle cx="200" cy="195" r="6" fill="#fff" />
      
      {/* Cartoon character - surprised */}
      <circle cx="200" cy="280" r="50" fill="#1f2937" stroke="#dc2626" strokeWidth="3" />
      <circle cx="185" cy="270" r="8" fill="#dc2626" />
      <circle cx="215" cy="270" r="8" fill="#dc2626" />
      <ellipse cx="200" cy="295" rx="15" ry="10" fill="#dc2626" />
    </svg>
  );
}

export function ServerErrorIllustration() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fb9237', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <circle cx="200" cy="200" r="150" fill="url(#grad3)" />
      
      {/* Server box */}
      <rect x="120" y="100" width="160" height="180" rx="10" fill="#1f2937" stroke="#fb9237" strokeWidth="4" />
      <rect x="130" y="110" width="140" height="20" rx="5" fill="#fb9237" opacity="0.3" />
      
      {/* Server lights - all red (error) */}
      <circle cx="150" cy="160" r="8" fill="#dc2626" />
      <circle cx="200" cy="160" r="8" fill="#dc2626" />
      <circle cx="250" cy="160" r="8" fill="#dc2626" />
      
      {/* Cartoon character - confused */}
      <circle cx="200" cy="240" r="30" fill="#1f2937" stroke="#fb9237" strokeWidth="2" />
      <circle cx="192" cy="235" r="4" fill="#fb9237" />
      <circle cx="208" cy="235" r="4" fill="#fb9237" />
      <path d="M 190 250 Q 200 255 210 250" stroke="#fb9237" strokeWidth="2" fill="none" />
      
      {/* 500 text */}
      <text x="200" y="330" fontFamily="Arial, sans-serif" fontSize="64" fill="#fb9237" textAnchor="middle" fontWeight="bold">500</text>
    </svg>
  );
}

export function OfflineIllustration() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <circle cx="200" cy="200" r="150" fill="url(#grad4)" />
      
      {/* WiFi signal - broken */}
      <path d="M 200 120 Q 250 120 280 150" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 200 140 Q 230 140 250 160" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 200 160 Q 220 160 230 170" stroke="#3b82f6" strokeWidth="6" fill="none" strokeLinecap="round" />
      
      {/* X mark over WiFi */}
      <path d="M 180 100 L 220 140 M 220 100 L 180 140" stroke="#dc2626" strokeWidth="6" strokeLinecap="round" />
      
      {/* Cartoon character - looking confused */}
      <circle cx="200" cy="250" r="60" fill="#1f2937" stroke="#3b82f6" strokeWidth="3" />
      <circle cx="185" cy="240" r="8" fill="#3b82f6" />
      <circle cx="215" cy="240" r="8" fill="#3b82f6" />
      <ellipse cx="200" cy="265" rx="20" ry="12" fill="#3b82f6" />
      
      {/* Text */}
      <text x="200" y="340" fontFamily="Arial, sans-serif" fontSize="36" fill="#3b82f6" textAnchor="middle" fontWeight="bold">Offline</text>
    </svg>
  );
}

export function EmptySearchIllustration() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#db2777', stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: '#9333ea', stopOpacity: 0.2 }} />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="200" cy="200" r="150" fill="url(#grad5)" />
      
      {/* Magnifying glass */}
      <circle cx="180" cy="180" r="50" fill="none" stroke="#db2777" strokeWidth="6" strokeLinecap="round" />
      <line x1="220" y1="220" x2="260" y2="260" stroke="#db2777" strokeWidth="6" strokeLinecap="round" />
      
      {/* Cartoon character - detective with magnifying glass */}
      <circle cx="200" cy="280" r="60" fill="#1f2937" stroke="#9333ea" strokeWidth="3" />
      
      {/* Eyes - looking through magnifying glass */}
      <circle cx="185" cy="270" r="10" fill="#9333ea" />
      <circle cx="215" cy="270" r="10" fill="#9333ea" />
      <circle cx="187" cy="268" r="4" fill="#fff" />
      <circle cx="217" cy="268" r="4" fill="#fff" />
      
      {/* Confused/thinking expression */}
      <path d="M 190 295 Q 200 300 210 295" stroke="#9333ea" strokeWidth="3" fill="none" strokeLinecap="round" />
      
      {/* Question marks floating around */}
      <text x="120" y="150" fontFamily="Arial, sans-serif" fontSize="48" fill="#db2777" opacity="0.6" fontWeight="bold">?</text>
      <text x="280" y="160" fontFamily="Arial, sans-serif" fontSize="40" fill="#9333ea" opacity="0.6" fontWeight="bold">?</text>
      <text x="100" y="250" fontFamily="Arial, sans-serif" fontSize="36" fill="#db2777" opacity="0.5" fontWeight="bold">?</text>
      
      {/* Decorative sparkles */}
      <circle cx="150" cy="120" r="3" fill="#db2777" opacity="0.7" />
      <circle cx="250" cy="130" r="3" fill="#9333ea" opacity="0.7" />
      <circle cx="130" cy="200" r="3" fill="#db2777" opacity="0.7" />
      <circle cx="270" cy="210" r="3" fill="#9333ea" opacity="0.7" />
    </svg>
  );
}

