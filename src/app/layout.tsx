import type { Metadata } from "next";
import {
  Playfair_Display,
  Cormorant_Garamond,
  DM_Sans,
  Space_Grotesk,
  Inter,
  Plus_Jakarta_Sans,
  Manrope,
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/firebase/auth-context";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FolioCraft — The Editorial Portfolio Builder",
  description:
    "Design and publish your personal portfolio website with bespoke typography, curated themes, and effortless no-code publishing.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${playfair.variable} 
        ${cormorant.variable} 
        ${dmSans.variable} 
        ${spaceGrotesk.variable} 
        ${inter.variable} 
        ${plusJakartaSans.variable} 
        ${manrope.variable}
      `}
    >
      <body className="min-h-screen bg-editorial-ivory text-editorial-charcoal antialiased selection:bg-editorial-charcoal selection:text-editorial-ivory">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
