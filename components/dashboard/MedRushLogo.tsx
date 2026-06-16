import { cn } from "@/lib/helpers";

export default function MedRushLogo({ className }: { className?: string }) {
  return (
    <svg
      aria-label="MedRush"
      className={cn("transition-transform duration-300 hover:scale-105", className)}
      role="img"
      viewBox="0 0 280 170"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stethoscope arms */}
      <path
        d="M24 105H74V58"
        fill="none"
        stroke="#45b9bc"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="18"
      />
      <path
        d="M256 105H206V58"
        fill="none"
        stroke="#45b9bc"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="18"
      />
      {/* Stethoscope bottom arc */}
      <path
        d="M74 103C86 142 113 158 140 158C167 158 194 142 206 103"
        fill="none"
        stroke="#2c9fa3"
        strokeLinecap="round"
        strokeWidth="18"
      />
      {/* Red dot (status indicator) */}
      <circle cx="140" cy="30" fill="#df2f38" r="24" stroke="#ffffff" strokeWidth="3" />
      {/* Heart shape */}
      <path
        d="M88 91C110 94 128 109 140 132C152 109 170 94 192 91C178 122 159 145 140 153C121 145 102 122 88 91Z"
        fill="#b70f21"
        stroke="#ffffff"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      {/* Medical cross circle */}
      <circle cx="140" cy="87" fill="#168b8d" r="32" stroke="#ffffff" strokeWidth="4" />
      <path d="M140 66V108" stroke="#ffffff" strokeLinecap="square" strokeWidth="10" />
      <path d="M119 87H161" stroke="#ffffff" strokeLinecap="square" strokeWidth="10" />
    </svg>
  );
}
