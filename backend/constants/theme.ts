// ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
export const C = {
  bg:     "#f0f5fb",
  cream:  "#f7fafd",
  white:  "#ffffff",
  ink:    "#0a1628",
  inkM:   "#2d4a6e",
  inkL:   "#6b8aaa",
  inkXL:  "#c2d4e8",
  gold:   "#1A6FC4",
  goldL:  "#4A9FE0",
  goldBg: "rgba(26,111,196,0.08)",
  s1:     "#1A6FC4",
  s2:     "#E8162B",
  s3:     "#0D9E6E",
  s4:     "#F07C1A",
  s5:     "#6B3FA0",
  navy:   "#0D2B52",
} as const;

export type ThemeColors = typeof C;
