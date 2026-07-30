import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Script from "next/script";

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
  themeColor: '#1A73E8',
};

// ✅ Layout metadata - ONLY global stuff, NO openGraph or twitter
export const metadata: Metadata = {
  title: {
    default: "Nuruvent",
    template: "%s | Nuruvent"
  },
  description: "Light Your Training Events. Illuminate Your Growth. The all-in-one platform for professional training events worldwide.",
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
    "event management",
    "virtual events",
    "hybrid events",
  ].join(", "),
  robots: "index, follow",
  alternates: {
    canonical: "https://nuruvent.com/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  // ❌ NO openGraph here
  // ❌ NO twitter here
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  
  return (
    <html lang="en">
      <head>
        {/* Bing Webmaster Validation */}
        <meta name="msvalidate.01" content="7F9BEC1255ABF3C4802D7356DC131BE7" />
        
        {/* PWA: Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* PWA: iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Google Analytics */}
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

        {/* Tawk.to Chat Widget */}
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
            (function() {
              var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
              s1.async = true;
              s1.src = 'https://embed.tawk.to/6a6afad8d285f11d460611a5/1juou7nou';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
            })();
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}