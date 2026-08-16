// app/(public)/layout.tsx

import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Nuruvent | Light Your Training Events',
  description: 'The all-in-one platform for professional training events worldwide.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* ✅ Header reads auth state from Redux automatically */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <Header />
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <Footer />

      {/* Tawk.to Chat Widget */}
      <Script
        id="tawk-to"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
            
            if (typeof window !== 'undefined' && window.Tawk_API && window.Tawk_API.showWidget) {
              window.Tawk_API.showWidget();
            }

            (function() {
              if (document.getElementById('tawk-script-loader')) return;
              var s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0];
              s1.id = 'tawk-script-loader';
              s1.async = true;
              s1.src = 'https://embed.tawk.to/6a6afad8d285f11d460611a5/1juou7nou';
              s1.charset = 'UTF-8';
              s1.setAttribute('crossorigin', '*');
              s0.parentNode.insertBefore(s1, s0);
            })();

            if (typeof window !== 'undefined') {
              var hideTawkOnDashboard = function() {
                if (window.location.pathname.startsWith('/dashboard')) {
                  if (window.Tawk_API && window.Tawk_API.hideWidget) {
                    window.Tawk_API.hideWidget();
                  }
                } else {
                  if (window.Tawk_API && window.Tawk_API.showWidget) {
                    window.Tawk_API.showWidget();
                  }
                }
              };

              var originalPushState = history.pushState;
              history.pushState = function() {
                originalPushState.apply(this, arguments);
                setTimeout(hideTawkOnDashboard, 100);
              };

              var originalReplaceState = history.replaceState;
              history.replaceState = function() {
                originalReplaceState.apply(this, arguments);
                setTimeout(hideTawkOnDashboard, 100);
              };

              window.addEventListener('popstate', hideTawkOnDashboard);
            }
          `,
        }}
      />
    </div>
  );
}