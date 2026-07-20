import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SRIRAM.OS | AI Operating System Portfolio",
  description: "Interactive AI Operating System Portfolio - Sriram V, AI Engineer & ML Developer",
  keywords: ["AI Engineer", "Machine Learning", "Portfolio", "Sriram", "GenAI", "Computer Vision"],
  authors: [{ name: "Sriram V" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#050816] text-white overflow-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
