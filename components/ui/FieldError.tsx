"use client";
import { C } from "@/constants/theme";

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <div style={{ fontSize: "0.65rem", color: C.s4, marginTop: 4 }}>⚠ {msg}</div>
  );
}
