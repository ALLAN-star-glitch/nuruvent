import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { InstallPrompt } from "@/components/PWA/InstallPrompt";
import { PushNotificationManager } from "@/components/PWA/PushNotificationManager";
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
        
        {/* PWA: Manifest - Use .webmanifest (Next.js auto-generates from app/manifest.ts) */}
        <link rel="manifest" href="/manifest.webmanifest" />
        
        {/* PWA: Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        
        {/* PWA: iOS Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />

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

        {/* Tawk.to Chat Widget - Force reload on every navigation */}
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Function to load Tawk.to
              function loadTawkTo() {
                // Check if already loaded and visible
                if (typeof Tawk_API !== 'undefined' && Tawk_API.isLoaded) {
                  // Check if widget is actually visible
                  var widget = document.querySelector('iframe[src*="tawk.to"]');
                  if (widget) {
                    return; // Already loaded and visible
                  }
                }

                // Reset Tawk_API to force fresh load
                window.Tawk_API = window.Tawk_API || {};
                window.Tawk_LoadStart = new Date();

                // Remove old script if exists
                var oldScript = document.getElementById('tawk-to-script');
                if (oldScript) {
                  oldScript.remove();
                }

                // Remove old iframe if exists
                var oldIframe = document.querySelector('iframe[src*="tawk.to"]');
                if (oldIframe) {
                  oldIframe.remove();
                }

                // Create new script
                var s1 = document.createElement('script');
                var s0 = document.getElementsByTagName('script')[0];
                s1.id = 'tawk-to-script';
                s1.async = true;
                s1.src = 'https://embed.tawk.to/6a6afad8d285f11d460611a5/1juou7nou';
                s1.charset = 'UTF-8';
                s1.setAttribute('crossorigin', '*');
                s0.parentNode.insertBefore(s1, s0);
              }

              // Load immediately
              loadTawkTo();

              // Re-load on every page navigation (for client-side routing)
              if (typeof window !== 'undefined') {
                // Listen for route changes
                var originalPushState = history.pushState;
                history.pushState = function() {
                  originalPushState.apply(this, arguments);
                  setTimeout(loadTawkTo, 500);
                };

                var originalReplaceState = history.replaceState;
                history.replaceState = function() {
                  originalReplaceState.apply(this, arguments);
                  setTimeout(loadTawkTo, 500);
                };

                // Also reload on popstate (back/forward)
                window.addEventListener('popstate', function() {
                  setTimeout(loadTawkTo, 500);
                });

                // Reload on visibility change (user comes back to tab)
                document.addEventListener('visibilitychange', function() {
                  if (!document.hidden) {
                    setTimeout(loadTawkTo, 500);
                  }
                });
              }
            `
          }}
        />

        {/* PWA Components - Always rendered in layout */}
        <InstallPrompt />
        <PushNotificationManager />
      </body>
    </html>
  );
}