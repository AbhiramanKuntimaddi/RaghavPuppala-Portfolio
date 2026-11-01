import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

export const alt = `${site.name}, ${site.role} in ${site.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Marigold with the trimmed corner, the headline, his credentials and portrait.
export default async function Image() {
  const photo = `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public/raghav-puppala.jpg"))).toString("base64")}`;
  const ink = "#231c15";
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#f5b82e",
        color: ink,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 0 64px 72px",
          width: 720,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              width: 52,
              height: 52,
              background: ink,
              color: "#f5b82e",
              fontSize: 24,
              fontWeight: 800,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            RP
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>{site.name}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 84,
            lineHeight: 0.98,
            letterSpacing: -2,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            // The built-in font has one weight; the stroke thickens it.
            WebkitTextStroke: `3px ${ink}`,
          }}
        >
          <span>Your finances,</span>
          <span>planned like</span>
          <span>a mission.</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 600 }}>
          {site.role} · {site.city} · MDRT · AMFI · IRDAI
        </div>
      </div>
      <div style={{ display: "flex", position: "absolute", right: 64, top: 64, width: 360, height: 502 }}>
        <img src={photo} alt="" width={360} height={502} style={{ objectFit: "cover", objectPosition: "61% 42%" }} />
      </div>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ position: "absolute", top: 0, right: 0 }}>
        <polygon points="0,0 64,0 64,64" fill={ink} />
      </svg>
    </div>,
    { ...size },
  );
}
