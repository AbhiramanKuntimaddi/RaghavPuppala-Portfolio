import { encode, QrCodeDataType } from "uqr";

// WhatsApp QR in the site's style: ink dots, rounded markers, the RP badge in the middle.
// Short links use H error correction. Long ones (the calculator's plan) use Q, which keeps the
// dots large enough to scan; there the badge covers the centre alignment marker, which
// scanners don't rely on.

const BADGE = 9; // modules

export function WhatsAppQR({
  href,
  tone = "marigold",
  quiet = 3,
  className = "",
}: {
  href: string;
  tone?: "marigold" | "paper";
  /** Clear space in modules. 0 where the surface around it is the same colour. */
  quiet?: number;
  className?: string;
}) {
  const centre = (size: number) => Math.floor((size - BADGE) / 2);
  const clear = ({ types, size }: { types: QrCodeDataType[][]; size: number }) =>
    types
      .slice(centre(size), centre(size) + BADGE)
      .every((row) => row.slice(centre(size), centre(size) + BADGE).every((t) => t === QrCodeDataType.Data));
  const strong = encode(href, { ecc: "H", border: 0 });
  const { data, size } = clear(strong) ? strong : encode(href, { ecc: "Q", border: 0 });
  const S = size + quiet * 2;

  const lo = centre(size);
  const inBadge = (r: number, c: number) => r >= lo && r < lo + BADGE && c >= lo && c < lo + BADGE;
  const markers = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];
  const inMarker = (r: number, c: number) => markers.some(([mr, mc]) => r >= mr && r < mr + 7 && c >= mc && c < mc + 7);

  const dots: React.ReactNode[] = [];
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) {
      if (!data[r][c] || inMarker(r, c) || inBadge(r, c)) continue;
      dots.push(<circle key={`${r}-${c}`} cx={c + quiet + 0.5} cy={r + quiet + 0.5} r={0.47} />);
    }

  const at = lo + quiet;
  const pad = 0.7;
  const side = BADGE - pad * 2;

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className={className} role="img" aria-label="QR code for Raghav's WhatsApp">
      <rect width={S} height={S} className={tone === "marigold" ? "fill-marigold" : "fill-paper"} />
      <g className="fill-ink">{dots}</g>
      {markers.map(([mr, mc]) => (
        <g key={`${mr}-${mc}`} transform={`translate(${mc + quiet} ${mr + quiet})`}>
          <rect x={0.5} y={0.5} width={6} height={6} rx={1.4} className="fill-none stroke-ink" strokeWidth={1} />
          <rect x={2} y={2} width={3} height={3} rx={0.6} className="fill-ink" />
        </g>
      ))}
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
    </svg>
  );
}
