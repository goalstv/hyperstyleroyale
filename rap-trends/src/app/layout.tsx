import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "RAP TRENDS — Hip-Hop Is Happening Now.",
    template: "%s — RAP TRENDS",
  },
  description:
    "The real-time network for hip-hop culture. 24/7 television, radio, streaming, charts, and reporting on what is moving the format right now.",
  openGraph: {
    title: "RAP TRENDS — Hip-Hop Is Happening Now.",
    description: "The real-time network for hip-hop culture.",
    type: "website",
    siteName: "RAP TRENDS",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050506",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
