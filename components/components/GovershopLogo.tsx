interface GovershopLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'light';
  className?: string;
}

export function GovershopLogo({ size = 'medium', variant = 'default', className = '' }: GovershopLogoProps) {
  const sizes = {
    small: { width: 160, height: 160 },
    medium: { width: 240, height: 240 },
    large: { width: 360, height: 360 },
  };

  const colors = {
    default: {
      primary: '#C3110C',   // Theme Primary (Red)
      secondary: '#E6501B', // Theme Accent (Orange)
      accent: '#740A03',    // Theme Secondary (Dark Red)
      text: '#E7F2EF',      // Theme Foreground (Light Text)
    },
    light: {
      primary: '#C3110C',
      secondary: '#E6501B',
      accent: '#740A03',
      text: '#262626',      // Dark Text for light backgrounds
    },
  };

  const { width, height } = sizes[size];
  const palette = colors[variant];

  return (
    <svg
      width={width}
      height={height}
      viewBox="50 70 260 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mx-auto ${className}`}
    >
      {/* Handheld Game Console Design - PS Vita/Switch style */}
      <g transform="translate(60, 30)">
        {/* Left grip - Made wider */}
        <path
          d="M 5 50 Q 0 50 0 55 L 0 90 Q 0 100 5 105 L 35 105 L 35 50 Z"
          fill={palette.accent}
          stroke={palette.text}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Right grip - Made wider */}
        <path
          d="M 205 50 Q 210 50 210 55 L 210 90 Q 210 100 205 105 L 175 105 L 175 50 Z"
          fill={palette.primary}
          stroke={palette.text}
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* Main console body */}
        <rect
          x="35"
          y="40"
          width="140"
          height="75"
          rx="8"
          fill={palette.text}
          opacity="0.15"
          stroke={palette.text}
          strokeWidth="2"
        />

        {/* Console inner body */}
        <rect
          x="38"
          y="43"
          width="134"
          height="69"
          rx="6"
          fill="#2a2a2a"
          opacity="0.9"
        />

        {/* Screen - centered and proper size */}
        <rect
          x="55"
          y="52"
          width="100"
          height="55"
          rx="3"
          fill="#000000"
        />

        {/* Screen glow effect - layered for depth */}
        <rect
          x="57"
          y="54"
          width="96"
          height="51"
          rx="2"
          fill={palette.secondary}
          opacity="0.4"
        />

        <rect
          x="59"
          y="56"
          width="92"
          height="47"
          rx="2"
          fill={palette.primary}
          opacity="0.3"
        />

        {/* Pixel grid background */}
        <g opacity="0.15">
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={60 + i * 9}
              y1="57"
              x2={60 + i * 9}
              y2="102"
              stroke={palette.text}
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="60"
              y1={58 + i * 8}
              x2="148"
              y2={58 + i * 8}
              stroke={palette.text}
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* Scanline effect */}
        <g opacity="0.1">
          {Array.from({ length: 15 }).map((_, i) => (
            <line
              key={`scan-${i}`}
              x1="57"
              y1={54 + i * 3.5}
              x2="153"
              y2={54 + i * 3.5}
              stroke="#ffffff"
              strokeWidth="0.8"
            />
          ))}
        </g>

        {/* Pixel text: GOVER */}
        <text
          x="105"
          y="75"
          textAnchor="middle"
          fill={palette.secondary}
          fontSize="16"
          fontWeight="900"
          letterSpacing="2"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          GOVER
        </text>

        {/* Pixel text: SHOP */}
        <text
          x="105"
          y="93"
          textAnchor="middle"
          fill={palette.secondary}
          fontSize="16"
          fontWeight="900"
          letterSpacing="2"
          style={{ fontFamily: 'Courier New, monospace' }}
        >
          SHOP
        </text>

        {/* Pixel decorative elements on screen */}
        <g fill={palette.secondary} opacity="0.6">
          <rect x="70" y="62" width="3" height="3" />
          <rect x="76" y="62" width="3" height="3" />
          <rect x="82" y="62" width="3" height="3" />

          <rect x="127" y="62" width="3" height="3" />
          <rect x="133" y="62" width="3" height="3" />
          <rect x="139" y="62" width="3" height="3" />
        </g>

        {/* Power indicator icon on screen */}
        <g transform="translate(105, 98)">
          <circle cx="0" cy="0" r="2" fill={palette.primary} opacity="0.8" />
        </g>

        {/* Left D-Pad - smaller and positioned on grip */}
        <g transform="translate(18, 75)">
          {/* D-Pad background circle */}
          <circle cx="0" cy="0" r="9" fill={palette.text} opacity="0.3" />

          {/* Up */}
          <path d="M -3 -8 L 3 -8 L 3 -1 L -3 -1 Z" fill={palette.text} opacity="0.8" />
          {/* Down */}
          <path d="M -3 1 L 3 1 L 3 8 L -3 8 Z" fill={palette.text} opacity="0.8" />
          {/* Left */}
          <path d="M -8 -3 L -1 -3 L -1 3 L -8 3 Z" fill={palette.text} opacity="0.8" />
          {/* Right */}
          <path d="M 1 -3 L 8 -3 L 8 3 L 1 3 Z" fill={palette.text} opacity="0.8" />
        </g>

        {/* Left analog stick - smaller */}
        <g transform="translate(18, 95)">
          <circle cx="0" cy="0" r="6" fill={palette.text} opacity="0.4" />
          <circle cx="0" cy="0" r="4.5" fill={palette.accent} opacity="0.7" />
        </g>

        {/* Right action buttons (A, B, X, Y) - smaller and positioned on grip */}
        <g transform="translate(192, 75)">
          {/* Button background */}
          <circle cx="0" cy="0" r="9" fill={palette.text} opacity="0.2" />

          {/* Y button (top) */}
          <circle cx="0" cy="-6" r="3" fill={palette.secondary} />

          {/* B button (right) */}
          <circle cx="6" cy="0" r="3" fill={palette.primary} />

          {/* A button (bottom) */}
          <circle cx="0" cy="6" r="3" fill={palette.secondary} />

          {/* X button (left) */}
          <circle cx="-6" cy="0" r="3" fill={palette.accent} />
        </g>

        {/* Right analog stick - smaller */}
        <g transform="translate(192, 95)">
          <circle cx="0" cy="0" r="6" fill={palette.text} opacity="0.4" />
          <circle cx="0" cy="0" r="4.5" fill={palette.primary} opacity="0.7" />
        </g>

        {/* Top details - Start/Select */}
        <ellipse cx="95" cy="48" rx="4" ry="2" fill={palette.text} opacity="0.4" />
        <ellipse cx="115" cy="48" rx="4" ry="2" fill={palette.text} opacity="0.4" />

        {/* Speaker holes - left */}
        <circle cx="60" cy="48" r="1" fill={palette.text} opacity="0.3" />
        <circle cx="65" cy="48" r="1" fill={palette.text} opacity="0.3" />
        <circle cx="70" cy="48" r="1" fill={palette.text} opacity="0.3" />

        {/* Speaker holes - right */}
        <circle cx="140" cy="48" r="1" fill={palette.text} opacity="0.3" />
        <circle cx="145" cy="48" r="1" fill={palette.text} opacity="0.3" />
        <circle cx="150" cy="48" r="1" fill={palette.text} opacity="0.3" />

        {/* Power LED */}
        <circle cx="105" cy="46" r="1.5" fill={palette.secondary} opacity="0.9" />
      </g>

      {/* Tagline below console */}
      {/* <text
        x="105"
        y="130"
        textAnchor="middle"
        fill={palette.text}
        fontSize="14"
        fontWeight="600"
        letterSpacing="3"
        opacity="0.9"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        GOVERSHOP
      </text> */}
{/* 
      <text
        x="105"
        y="145"
        textAnchor="middle"
        fill={palette.text}
        fontSize="10"
        fontWeight="400"
        letterSpacing="1"
        opacity="0.6"
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        GAME TOP-UP CENTER
      </text> */}
    </svg>
  );
}