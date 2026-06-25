import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Mohamed Irfan — Portfolio Terminal",
  description: "A retro 3D CRT computer portfolio. Drag to rotate the rig, watch the resume boot up on the screen.",
  keywords: ["portfolio", "3D", "retro", "CRT", "developer", "AI", "Python", "FastAPI", "RAG", "LLM"],
  authors: [{ name: "Mohamed Irfan" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Mohamed Irfan — Portfolio Terminal",
    description: "A retro 3D CRT computer portfolio.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohamed Irfan — Portfolio Terminal",
    description: "A retro 3D CRT computer portfolio.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
