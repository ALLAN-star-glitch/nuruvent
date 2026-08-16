import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { InstallPrompt } from "@/components/PWA/InstallPrompt";
import { PushNotificationManager } from "@/components/PWA/PushNotificationManager";
import Script from "next/script";
import StoreProvider from "./StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A73E8",
};

export const metadata: Metadata = {
  title: {
    default: "Nuruvent",
    template: "%s | Nuruvent",
  },
  description: "Light Your Training Events. Illuminate Your Growth.",
  keywords: [
    "training events",
    "professional development",
    "workshops",
    "webinars",
    "bootcamps",
    "meetups",
    "CPD events",
    "professional training",
    "Nuruvent",
    "global training platform",
  ].join(", "),
  robots: "index, follow",
  alternates: {
    canonical: "https://nuruvent.com/",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  other: {
    "msvalidate.01": "7F9BEC1255ABF3C4802D7356DC131BE7",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        {/* Render child layout route groups: (public) or (dashboard) */}
        <StoreProvider>{children}</StoreProvider>

        {/* Global Analytics */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        {/* Global PWA Utilities */}
        <InstallPrompt />
        <PushNotificationManager />
      </body>
    </html>
  );
}