import { useId } from "react";

/**
 * Americana decorative SVG set.
 *
 * All shapes are built from simple, exact geometry (no traced artwork) so they
 * stay crisp at any size and inherit theme colors via `currentColor` where
 * appropriate. Shared visual language: the US escutcheon shield — a blue chief
 * with stars above vertical red/white pales, the same device used on the
 * national coat of arms and on highway route markers.
 */

/** Classic US shield / escutcheon outline. */
const SHIELD_PATH =
  "M24 3 L43 9 V26 C43 39 34 49 24 53 C14 49 5 39 5 26 V9 Z";

/** Five-pointed star, centered in a 24x24 box. */
const STAR_PATH =
  "M12 2.6 L14.7 9.1 L21.7 9.7 L16.4 14.3 L18 21.2 L12 17.5 L6 21.2 L7.6 14.3 L2.3 9.7 L9.3 9.1 Z";

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={STAR_PATH} />
    </svg>
  );
}

/** A horizontal run of stars, used as a small accent rule. */
export function StarRow({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-2.5 h-2.5" />
      ))}
    </span>
  );
}

/**
 * Stars-and-stripes shield. Renders the full flag device when `flag` is true,
 * otherwise a flat silhouette in the current text color.
 */
export function FlagShield({
  className = "",
  flag = true,
}: {
  className?: string;
  flag?: boolean;
}) {
  // useId keeps clipPath ids unique when several shields render on one page.
  const rawId = useId();
  const clipId = `shield-clip-${rawId.replace(/:/g, "")}`;

  if (!flag) {
    return (
      <svg viewBox="0 0 48 56" fill="currentColor" className={className} aria-hidden="true">
        <path d={SHIELD_PATH} />
      </svg>
    );
  }

  // Seven vertical pales across the shield body, alternating red and white.
  const paleCount = 7;
  const paleWidth = 38 / paleCount;

  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={SHIELD_PATH} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* White field */}
        <rect x="0" y="0" width="48" height="56" fill="#F8FAFC" />

        {/* Vertical pales below the chief */}
        {Array.from({ length: paleCount }).map((_, i) =>
          i % 2 === 0 ? (
            <rect
              key={i}
              x={5 + i * paleWidth}
              y="20"
              width={paleWidth}
              height="36"
              fill="#C8102E"
            />
          ) : null
        )}

        {/* Blue chief */}
        <rect x="0" y="0" width="48" height="20" fill="#0A3161" />

        {/* Stars across the chief */}
        <g fill="#F8FAFC">
          {[10, 17, 24, 31, 38].map((cx) => (
            <g key={cx} transform={`translate(${cx - 3.2}, 6.3) scale(0.27)`}>
              <path d={STAR_PATH} />
            </g>
          ))}
        </g>
      </g>

      {/* Outline */}
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

/**
 * Brand mark: US shield carrying a car silhouette.
 *
 * Tuned for legibility at small sizes (the top bar renders this around 26px),
 * so the lower field is solid red rather than striped — a white car over
 * red/white pales would break up and read as noise. Two thin stripes below the
 * car keep the flag reference without crowding the silhouette.
 */
export function FlagShieldCar({ className = "" }: { className?: string }) {
  const rawId = useId();
  const clipId = `shieldcar-clip-${rawId.replace(/:/g, "")}`;

  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={SHIELD_PATH} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Red field */}
        <rect x="0" y="0" width="48" height="56" fill="#C8102E" />

        {/* Blue chief with stars */}
        <rect x="0" y="0" width="48" height="18" fill="#0A3161" />
        <g fill="#F8FAFC">
          {[11, 17.5, 24, 30.5, 37].map((cx) => (
            <g key={cx} transform={`translate(${cx - 2.8}, 5.2) scale(0.235)`}>
              <path d={STAR_PATH} />
            </g>
          ))}
        </g>

        {/* Car silhouette */}
        <g fill="#F8FAFC">
          <path
            d="M12 35.4 C12 33.6 13.1 32.7 14.6 32.7 L16.8 27.9 C17.4 26.7 18.4 26.1 19.8 26.1 H28.2 C29.6 26.1 30.6 26.7 31.2 27.9 L33.4 32.7 C34.9 32.7 36 33.6 36 35.4 V38 H12 Z"
          />
          <circle cx="17.2" cy="38.4" r="3" />
          <circle cx="30.8" cy="38.4" r="3" />
        </g>
        {/* Wheel hubs punched out so the wheels read as wheels */}
        <circle cx="17.2" cy="38.4" r="1.2" fill="#C8102E" />
        <circle cx="30.8" cy="38.4" r="1.2" fill="#C8102E" />

        {/* Two stripes below the car */}
        <rect x="0" y="43.5" width="48" height="2.6" fill="#F8FAFC" />
        <rect x="0" y="48.5" width="48" height="2.6" fill="#F8FAFC" />
      </g>

      {/* Outline */}
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

/**
 * Highway route marker shield with a label inside — the familiar black-on-white
 * US route sign. Defaults to "US".
 */
export function RouteMarker({
  label = "US",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 56" className={className} aria-hidden="true">
      <path d={SHIELD_PATH} fill="currentColor" opacity="0.12" />
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fill="currentColor"
        fontSize={label.length > 2 ? 15 : 19}
        fontWeight="900"
        fontFamily="var(--font-sans, sans-serif)"
        letterSpacing="-0.5"
      >
        {label}
      </text>
    </svg>
  );
}

/** Red/white stripe band — a thin flag-inspired rule. */
export function FlagStripes({ className = "" }: { className?: string }) {
  return <div className={`flag-stripes ${className}`} aria-hidden="true" />;
}

/** Centered star divider with optional label, for section breaks. */
export function StarDivider({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      {label ? (
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          <Star className="w-2.5 h-2.5 text-primary" />
          {label}
          <Star className="w-2.5 h-2.5 text-primary" />
        </span>
      ) : (
        <StarRow count={3} className="text-primary" />
      )}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}
