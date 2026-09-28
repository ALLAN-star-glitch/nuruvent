// types/zoom.d.ts

export {};

declare global {
  interface Window {
    ZoomMtgEmbedded: {
      createClient: () => {
        init: (options: Record<string, unknown>) => Promise<void>;
        join: (options: Record<string, unknown>) => Promise<void>;
        leaveMeeting: () => Promise<void>;
      };
    };
  }
}