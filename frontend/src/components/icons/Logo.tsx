import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
    >
      <defs>
        <linearGradient id="logoGradient" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5BC4F7" />
          <stop offset="50%" stopColor="#3BA8B8" />
          <stop offset="100%" stopColor="#1A8A9C" />
        </linearGradient>
        <clipPath id="roundedRect">
          <rect width="100" height="100" rx="22" />
        </clipPath>
      </defs>

      {/* Background with gradient */}
      <rect width="100" height="100" rx="22" fill="url(#logoGradient)" />

      {/* Mountain */}
      <path
        d="M15 65 L42 28 L50 38 L58 28 L85 65"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Winding path/road */}
      <path
        d="M50 38
           Q55 48, 48 55
           Q40 63, 52 72
           Q60 78, 50 88"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
