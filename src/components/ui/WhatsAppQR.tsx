import { encode, QrCodeDataType } from "uqr";

// A QR code for a WhatsApp link, drawn in the site's own style: ink dots on marigold (or
// paper), rounded corner markers, and the header's RP badge in the middle. It's encoded
// with the highest error correction (H, about 30% can be lost), which is what lets the
// badge cover the centre and still scan.
//
// The badge only goes in when the square it covers holds nothing but data. A longer link
// (the calculator's plan as a message) makes a denser code with an alignment marker in
// the middle; covering that would break it, so a long link is encoded at medium error
// correction instead (fewer, larger dots, which scan more easily) and drawn without it.

const BADGE = 9; // the badge's side, in modules

export function WhatsAppQR({
  href,
  tone = "marigold",
  quiet = 3,
  className = "",
}: {
  href: string;
  tone?: "marigold" | "paper";
  /**
   * Clear space drawn around the code, in modules. Scanners need it, so keep it wherever the
   * code sits on a different colour (the ink card); on a surface of the code's own colour the
   * surface gives the clear space, and 0 lets the dots line up with what's beside them.
   */
  quiet?: number;
  className?: string;
}) {
  const QUIET = quiet;
  const centre = (size: number) => Math.floor((size - BADGE) / 2);
  const clear = ({ types, size }: { types: QrCodeDataType[][]; size: number }) =>
    types
      .slice(centre(size), centre(size) + BADGE)
      .every((row) => row.slice(centre(size), centre(size) + BADGE).every((t) => t === QrCodeDataType.Data));
  const strong = encode(href, { ecc: "H", border: 0 });
  const badge = clear(strong);
  const { data, size } = badge ? strong : encode(href, { ecc: "M", border: 0 });
  const S = size + QUIET * 2;

  const lo = centre(size);
  const hi = lo + BADGE;
  const inBadge = (r: number, c: number) => r >= lo && r < hi && c >= lo && c < hi;

  // The three corner markers, drawn whole below; the data dots skip them.
  const markers = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];
  const inMarker = (r: number, c: number) => markers.some(([mr, mc]) => r >= mr && r < mr + 7 && c >= mc && c < mc + 7);

  const dots: React.ReactNode[] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (!data[r][c] || inMarker(r, c) || (badge && inBadge(r, c))) continue;
      dots.push(<circle key={`${r}-${c}`} cx={c + QUIET + 0.5} cy={r + QUIET + 0.5} r={0.47} />);
    }

  const at = lo + QUIET;
  const pad = 0.7;
  const side = BADGE - pad * 2;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={className} role="img" aria-label="QR code for Raghav's WhatsApp">
      <rect width={S} height={S} className={tone === "marigold" ? "fill-marigold" : "fill-paper"} />
      <g className="fill-ink">{dots}</g>
      {markers.map(([mr, mc]) => (
        <g key={`${mr}-${mc}`} transform={`translate(${mc + QUIET} ${mr + QUIET})`}>
          <rect x={0.5} y={0.5} width={6} height={6} rx={1.4} className="fill-none stroke-ink" strokeWidth={1} />
          <rect x={2} y={2} width={3} height={3} rx={0.6} className="fill-ink" />
        </g>
      ))}
      {badge && (
        <g>
          {/* The RP badge, with the site's trimmed top-right corner. */}
          <path d={`M${at + pad} ${at + pad}h${side - 2}l2 2v${side - 2}h${-side}z`} className="fill-ink" />
          <text
            x={at + BADGE / 2}
            y={at + BADGE / 2 + 1.55}
            textAnchor="middle"
            fontSize={4.6}
            className="fill-marigold font-display"
          >
            RP
          </text>
        </g>
      )}
    </svg>
  );
}
