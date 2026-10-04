/**
 * Road & signage clip art.
 *
 * Flat-design SVG illustrations drawn from exact geometry (regular polygons,
 * rounded rects, circles) so they stay crisp at any size. Signs use real
 * MUTCD-style shapes: octagon for stop, inverted triangle for yield, vertical
 * white rectangle for speed limit, diamond for warnings.
 */

/* ---------------- Signs ---------------- */

/** Regular octagon, flat top — the standard stop sign silhouette. */
const OCTAGON =
  "M7.79 1.84 H16.21 L22.16 7.79 V16.21 L16.21 22.16 H7.79 L1.84 16.21 V7.79 Z";

export function StopSign({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d={OCTAGON} fill="#C8102E" />
      <path d={OCTAGON} fill="none" stroke="#F8FAFC" strokeWidth="1.1" />
      <text
        x="12"
        y="14.2"
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="6.2"
        fontWeight="900"
        fontFamily="var(--font-sans, sans-serif)"
        letterSpacing="-0.2"
      >
        STOP
      </text>
    </svg>
  );
}

export function YieldSign({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M2.4 3.4 H21.6 L12 21.2 Z" fill="#C8102E" />
      <path d="M5.9 5.9 H18.1 L12 17.2 Z" fill="#F8FAFC" />
    </svg>
  );
}

/** Vertical white sign with a posted limit. */
export function SpeedLimitSign({
  limit = "55",
  className = "",
}: {
  limit?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3.5" y="1.5" width="17" height="21" rx="1.8" fill="#F8FAFC" />
      <rect
        x="3.5"
        y="1.5"
        width="17"
        height="21"
        rx="1.8"
        fill="none"
        stroke="#1E293B"
        strokeWidth="1.3"
      />
      <text
        x="12"
        y="7.3"
        textAnchor="middle"
        fill="#1E293B"
        fontSize="3.3"
        fontWeight="800"
        fontFamily="var(--font-sans, sans-serif)"
      >
        SPEED
      </text>
      <text
        x="12"
        y="10.6"
        textAnchor="middle"
        fill="#1E293B"
        fontSize="3.3"
        fontWeight="800"
        fontFamily="var(--font-sans, sans-serif)"
      >
        LIMIT
      </text>
      <text
        x="12"
        y="19.4"
        textAnchor="middle"
        fill="#1E293B"
        fontSize="8.6"
        fontWeight="900"
        fontFamily="var(--font-sans, sans-serif)"
      >
        {limit}
      </text>
    </svg>
  );
}

/** Yellow diamond warning sign. */
export function WarningSign({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1.6 L22.4 12 L12 22.4 L1.6 12 Z" fill="#FACC15" />
      <path
        d="M12 1.6 L22.4 12 L12 22.4 L1.6 12 Z"
        fill="none"
        stroke="#1E293B"
        strokeWidth="1.2"
      />
      <rect x="10.9" y="6.6" width="2.2" height="7.6" rx="1.1" fill="#1E293B" />
      <circle cx="12" cy="17.1" r="1.4" fill="#1E293B" />
    </svg>
  );
}

export function TrafficLight({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="6.5" y="1.5" width="11" height="18" rx="3" fill="#1E293B" />
      <circle cx="12" cy="6.2" r="2.5" fill="#EF4444" />
      <circle cx="12" cy="12" r="2.5" fill="#FACC15" opacity="0.45" />
      <circle cx="12" cy="17.8" r="2.5" fill="#22C55E" opacity="0.45" />
      <rect x="10.8" y="19.5" width="2.4" height="3.5" rx="0.6" fill="#475569" />
    </svg>
  );
}

export function TrafficCone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 2.2 L18.6 19 H5.4 Z" fill="#F97316" />
      <path d="M8.75 11.5 H15.25 L16.2 14 H7.8 Z" fill="#F8FAFC" />
      <rect x="3" y="19" width="18" height="2.8" rx="1.4" fill="#EA580C" />
    </svg>
  );
}

/* ---------------- Vehicles ---------------- */

/** Flat side-view car. Body inherits `currentColor`. */
export function CarSide({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      {/* Cabin */}
      <path d="M19 17 L24.5 8.5 H39.5 L45 17 Z" fill="currentColor" opacity="0.75" />
      {/* Windows */}
      <path d="M25.5 10.5 H31 V16 H22 Z" fill="#F8FAFC" opacity="0.65" />
      <path d="M33 10.5 H38.5 L42.5 16 H33 Z" fill="#F8FAFC" opacity="0.65" />
      {/* Body */}
      <rect x="5" y="16" width="54" height="9.5" rx="3.5" fill="currentColor" />
      {/* Lights */}
      <rect x="56" y="18.5" width="3.5" height="2.4" rx="1.2" fill="#FACC15" />
      <rect x="4.5" y="18.5" width="3.5" height="2.4" rx="1.2" fill="#EF4444" />
      {/* Wheels */}
      <circle cx="18.5" cy="25.5" r="5.5" fill="#1E293B" />
      <circle cx="18.5" cy="25.5" r="2.3" fill="#94A3B8" />
      <circle cx="45.5" cy="25.5" r="5.5" fill="#1E293B" />
      <circle cx="45.5" cy="25.5" r="2.3" fill="#94A3B8" />
    </svg>
  );
}

/** Flat side-view pickup truck. Body inherits `currentColor`. */
export function PickupTruck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" className={className} aria-hidden="true">
      {/* Cab */}
      <path d="M12 16 L16 8 H30 V16 Z" fill="currentColor" opacity="0.75" />
      <path d="M17.5 10 H28 V15.5 H14.8 Z" fill="#F8FAFC" opacity="0.65" />
      {/* Bed + body */}
      <rect x="5" y="16" width="54" height="9" rx="2.5" fill="currentColor" />
      <rect x="32" y="11" width="25" height="5.5" rx="1.5" fill="currentColor" opacity="0.55" />
      {/* Wheels */}
      <circle cx="17.5" cy="25" r="5.5" fill="#1E293B" />
      <circle cx="17.5" cy="25" r="2.3" fill="#94A3B8" />
      <circle cx="46.5" cy="25" r="5.5" fill="#1E293B" />
      <circle cx="46.5" cy="25" r="2.3" fill="#94A3B8" />
    </svg>
  );
}

/* ---------------- Road elements ---------------- */

/**
 * Horizontal asphalt strip with a dashed center line. Useful as a section
 * divider or as a base for a scene.
 */
export function RoadDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 14"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="0" y="0" width="200" height="14" fill="#334155" />
      <line
        x1="0"
        y1="7"
        x2="200"
        y2="7"
        stroke="#FACC15"
        strokeWidth="2"
        strokeDasharray="12 10"
      />
    </svg>
  );
}

/**
 * Wide scene: a road receding toward the horizon with lane markings, a car,
 * and roadside signage. Sized to a 320x140 box; scale with width/height
 * classes on the wrapper.
 */
export function RoadScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 140" className={className} aria-hidden="true">
      {/* Ground */}
      <rect x="0" y="86" width="320" height="54" fill="#1E293B" opacity="0.18" />

      {/* Road surface — trapezoid receding to a vanishing point */}
      <path d="M118 42 H202 L292 140 H28 Z" fill="#334155" />

      {/* Shoulder lines */}
      <path d="M118 42 L28 140" stroke="#F8FAFC" strokeWidth="2" opacity="0.5" />
      <path d="M202 42 L292 140" stroke="#F8FAFC" strokeWidth="2" opacity="0.5" />

      {/* Dashed center line, scaling with perspective */}
      <g fill="#FACC15">
        <rect x="158.4" y="46" width="3.2" height="8" />
        <rect x="157.8" y="62" width="4.4" height="11" />
        <rect x="157" y="82" width="6" height="15" />
        <rect x="155.8" y="106" width="8.4" height="20" />
      </g>

      {/* Horizon haze */}
      <rect x="118" y="42" width="84" height="10" fill="#64748B" opacity="0.35" />

      {/* Speed limit sign on the left shoulder */}
      <g transform="translate(34, 44)">
        <rect x="12.4" y="26" width="2.4" height="34" fill="#64748B" />
        <g transform="scale(1.15)">
          <SpeedLimitSignInline />
        </g>
      </g>

      {/* Stop sign on the right shoulder */}
      <g transform="translate(252, 56)">
        <rect x="11" y="22" width="2.4" height="38" fill="#64748B" />
        <g transform="scale(1.0)">
          <StopSignInline />
        </g>
      </g>

      {/* Car in the near lane */}
      <g transform="translate(118, 92) scale(1.35)">
        <CarSideInline />
      </g>
    </svg>
  );
}

/* Inline variants used inside RoadScene (no nested <svg>, so they inherit the
   parent coordinate system). */

function SpeedLimitSignInline() {
  return (
    <g>
      <rect x="3.5" y="1.5" width="17" height="21" rx="1.8" fill="#F8FAFC" />
      <rect
        x="3.5"
        y="1.5"
        width="17"
        height="21"
        rx="1.8"
        fill="none"
        stroke="#1E293B"
        strokeWidth="1.3"
      />
      <text
        x="12"
        y="8"
        textAnchor="middle"
        fill="#1E293B"
        fontSize="3.4"
        fontWeight="800"
        fontFamily="var(--font-sans, sans-serif)"
      >
        SPEED
      </text>
      <text
        x="12"
        y="19.4"
        textAnchor="middle"
        fill="#1E293B"
        fontSize="9"
        fontWeight="900"
        fontFamily="var(--font-sans, sans-serif)"
      >
        55
      </text>
    </g>
  );
}

function StopSignInline() {
  return (
    <g>
      <path d={OCTAGON} fill="#C8102E" />
      <path d={OCTAGON} fill="none" stroke="#F8FAFC" strokeWidth="1.1" />
      <text
        x="12"
        y="14.2"
        textAnchor="middle"
        fill="#F8FAFC"
        fontSize="6.2"
        fontWeight="900"
        fontFamily="var(--font-sans, sans-serif)"
      >
        STOP
      </text>
    </g>
  );
}

function CarSideInline() {
  return (
    <g>
      <path d="M19 17 L24.5 8.5 H39.5 L45 17 Z" fill="#C8102E" opacity="0.8" />
      <path d="M25.5 10.5 H31 V16 H22 Z" fill="#F8FAFC" opacity="0.6" />
      <path d="M33 10.5 H38.5 L42.5 16 H33 Z" fill="#F8FAFC" opacity="0.6" />
      <rect x="5" y="16" width="54" height="9.5" rx="3.5" fill="#C8102E" />
      <rect x="56" y="18.5" width="3.5" height="2.4" rx="1.2" fill="#FACC15" />
      <circle cx="18.5" cy="25.5" r="5.5" fill="#1E293B" />
      <circle cx="18.5" cy="25.5" r="2.3" fill="#94A3B8" />
      <circle cx="45.5" cy="25.5" r="5.5" fill="#1E293B" />
      <circle cx="45.5" cy="25.5" r="2.3" fill="#94A3B8" />
    </g>
  );
}

/* ---------------- Incident mapping ---------------- */

/** Clip-art icon for each incident type, for use on badges and pickers. */
export const INCIDENT_ART: Record<
  string,
  (props: { className?: string }) => JSX.Element
> = {
  reckless: CarSide,
  speeding: SpeedLimitSign,
  texting: WarningSign,
  parking: TrafficCone,
  "road-rage": TrafficLight,
  other: StopSign,
};
