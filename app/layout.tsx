// app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { InstallPrompt } from '@/components/PWA/InstallPrompt';
import { PushNotificationManager } from '@/components/PWA/PushNotificationManager';
import Script from 'next/script';
import StoreProvider from './StoreProvider';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { Toaster } from 'sonner';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1A73E8',
};

export const metadata: Metadata = {
  title: { default: 'Nuruvent', template: '%s | Nuruvent' },
  description: 'Light Your Training Events. Illuminate Your Growth.',
  robots: 'index, follow',
  alternates: { canonical: 'https://nuruvent.com/' },
  manifest: '/manifest.webmanifest',
  icons: { apple: '/icon-192.png' },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
  other: { 'msvalidate.01': '7F9BEC1255ABF3C4802D7356DC131BE7' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Zoom Meeting SDK — Client View.
            Vendor scripts must load before the client bundle. */}
        <Script
          src="https://source.zoom.us/6.2.0/lib/vendor/react.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/6.2.0/lib/vendor/react-dom.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/6.2.0/lib/vendor/redux.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/6.2.0/lib/vendor/redux-thunk.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/6.2.0/lib/vendor/lodash.min.js"
          strategy="beforeInteractive"
        />
        {/* Client View bundle (not the "embedded" bundle) */}
        <Script
          src="https://source.zoom.us/6.2.0/zoom-meeting-6.2.0.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />

        <StoreProvider>{children}</StoreProvider>

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

        <InstallPrompt />
        <PushNotificationManager />

        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={4000}
          visibleToasts={3}
          theme="system"
          toastOptions={{ classNames: { toast: 'font-sans' } }}
        />
      </body>
    </html>
  );
}