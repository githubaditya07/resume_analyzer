import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerLens AI — Resume feedback & career guidance",
  description: "Evidence-based resume feedback, indicative job-role matches, and a personalized learning roadmap."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
