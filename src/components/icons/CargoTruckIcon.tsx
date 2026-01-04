interface CargoTruckIconProps {
  className?: string;
}

export default function CargoTruckIcon({ className }: CargoTruckIconProps) {
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
      <path d="M14 17V5H4a1 1 0 00-1 1v10a1 1 0 001 1h1" />

      {/* Front cab with window */}
      <path d="M14 17h-3" />
      <path d="M14 8h2.5a1 1 0 01.8.4l2.5 3.3a1 1 0 01.2.6V16a1 1 0 01-1 1h-1" />

      {/* Cab window */}
      <path d="M14 8v5h4" />

      {/* Cargo box on back */}
      <rect x="3" y="5" width="11" height="8" rx="0.5" />

      {/* Wheels */}
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />

      {/* Wheel connectors */}
      <path d="M9 17h5" />
    </svg>
  );
}
