"use client";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({ variant = "primary", size = "md", className = "", children, style, ...props }: ButtonProps) {
  const base = variant === "primary" ? "btn-primary" : "";
  const sizes = { sm: "0.75rem 1rem", md: "0.9rem 1.4rem", lg: "1.1rem 1.8rem" };
  return (
    <button
      className={`${base} ${className}`}
      style={{
        padding: sizes[size],
        borderRadius: 12,
        fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "0.95rem" : "0.85rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        cursor: props.disabled ? "default" : "pointer",
        opacity: props.disabled ? 0.6 : 1,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
