import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EV In-Wheel Motor Simulator",
  description: "Educational 3D driving simulator with independent rear wheel drive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
