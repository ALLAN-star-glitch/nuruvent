// app/(meeting)/layout.tsx

import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Meeting',
  robots: 'noindex, nofollow',
};

export default function MeetingRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        {/* Minimal reset. No Tailwind. No globals.css.
            Per Zoom docs, Client View must be mounted on a route that
            does NOT load the host app's global CSS. This layout is that
            route. */}
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
            background: #000;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
          }
          #zmmtg-root {
            position: fixed;
            inset: 0;
            z-index: 1;
          }
        `}</style>

        {/* Zoom Meeting SDK — Client View.
            Loaded from the standard Zoom CDN. The SDK handles regional
            routing internally; do not swap this for a regional host. */}
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
        <Script
          src="https://source.zoom.us/6.2.0/zoom-meeting-6.2.0.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}