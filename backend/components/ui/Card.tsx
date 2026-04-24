"use client";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ glass = true, className = "", children, style, ...props }: CardProps) {
  return (
    <div
      className={`${glass ? "glass-card" : ""} ${className}`}
      style={{ borderRadius: 16, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
