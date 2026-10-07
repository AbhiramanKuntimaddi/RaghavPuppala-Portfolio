// Top-down F-16-style silhouette: long pointed nose, clipped delta wings with
// wingtip missile rails, squared tail planes. Nose points right (+x),
// centered on 12,12 in a 24×24 box so it rotates cleanly along a motion path.
export const JET_PATH =
  "M24 12C22.5 11.7 20.5 11.1 18.5 10.9L16.5 10.8C15 10.7 13.5 10.2 12.5 9.6L7.8 2.6L9.8 2.2V1.7H5.2V2.2L6.6 2.6V10.4L5.2 10.6L2.6 6.2H1.6L1.8 10.4L.4 10.9V13.1L1.8 13.6L1.6 17.8H2.6L5.2 13.4L6.6 13.6V21.4L5.2 21.8V22.3H9.8V21.8L7.8 21.4L12.5 14.4C13.5 13.8 15 13.3 16.5 13.2L18.5 13.1C20.5 12.9 22.5 12.3 24 12Z";

export function JetIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d={JET_PATH} fill="currentColor" />
    </svg>
  );
}
