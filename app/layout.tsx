import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/components/RoleProvider";
import PlatformShell from "@/components/PlatformShell";

export const metadata: Metadata = {
  title: "Hunt — Developer Knowledge Network",
  description: "Discover verified problem-solving investigations, root causes, and reproducible engineering solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fafafa] text-[#171717] antialiased">
        <RoleProvider>
          <PlatformShell>
            {children}
          </PlatformShell>
        </RoleProvider>
      </body>
    </html>
  );
}
