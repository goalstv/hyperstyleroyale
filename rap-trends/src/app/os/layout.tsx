import type { Metadata } from "next";
import { OsShell } from "@/components/os/os-shell";

export const metadata: Metadata = {
  title: { default: "RAP TRENDS OS", template: "%s — RAP TRENDS OS" },
  description: "Media operations control for the RAP TRENDS network.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function OsLayout({ children }: { children: React.ReactNode }) {
  return <OsShell>{children}</OsShell>;
}
