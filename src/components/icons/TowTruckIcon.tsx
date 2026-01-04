interface TowTruckIconProps {
  className?: string;
}

export default function TowTruckIcon({ className }: TowTruckIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Truck cabin */}
      <path d="M12 17V9H5a1 1 0 00-1 1v6a1 1 0 001 1h1" />

      {/* Cab window */}
      <path d="M5 11h5v3H5" />

      {/* Flatbed platform */}
      <path d="M12 14h9" />
      <path d="M12 17h7" />

      {/* Flatbed support */}
      <path d="M19 14v3" />

      {/* Ramp/tilt indicator */}
      <path d="M21 14l-2 3" />

      {/* Towed car silhouette on flatbed */}
      <path d="M13 11h4a1 1 0 011 1v2h-6v-2a1 1 0 011-1z" />
      <circle cx="14" cy="14" r="0.5" fill="currentColor" />
      <circle cx="17" cy="14" r="0.5" fill="currentColor" />

      {/* Main wheels */}
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />

      {/* Wheel connector */}
      <path d="M9 17h6" />
    </svg>
  );
}
