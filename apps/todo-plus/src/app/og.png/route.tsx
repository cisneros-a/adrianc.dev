import { ImageResponse } from "next/og";
import { OG_IMAGE_SIZE } from "@/lib/og";

// Share image (TD87), generated once at build time and served as /og.png.
// Colors are hard-coded because the image can't use CSS variables; they match
// the light theme in src/app/globals.css (--background, --accent-decor).
// Default font only; it has no bold, so the title is regular weight.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        background: "#f6f5f3",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 120,
          color: "#252422",
        }}
      >
        To Do +
      </div>
      <div
        style={{
          display: "flex",
          width: 96,
          height: 8,
          borderRadius: 4,
          background: "#e87033",
          margin: "24px 0",
        }}
      />
      <div style={{ display: "flex", fontSize: 40, color: "#6f6c68" }}>
        A to-do list with priorities, deadlines and task types.
      </div>
    </div>,
    { ...OG_IMAGE_SIZE },
  );
}
