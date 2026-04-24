import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "Creative Innovation Index | Infopace",
  description: "A multi-method psychometric assessment measuring creative and innovative potential — powered by AI analysis.",
  icons:       { icon: "/favicon.ico" },
  openGraph: {
    title:       "Creative Innovation Index | Infopace",
    description: "Discover your creative and innovative potential with AI-powered analysis.",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
