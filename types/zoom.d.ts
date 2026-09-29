// types/zoom.d.ts

export {};

declare global {
  interface Window {
    ZoomMtg?: {
      setZoomJSLib: (path: string, dir: string) => void;
      preLoadWasm: () => void;
      prepareWebSDK: () => void;
      i18n: {
        load: (lang: string) => void;
        reload: (lang: string) => void;
      };
      init: (opts: {
        leaveUrl: string;
        patchJsMedia?: boolean;
        success: () => void;
        error: (err: unknown) => void;
      }) => void;
      join: (opts: {
        signature: string;
        meetingNumber: string;
        passWord: string;
        userName: string;
        userEmail?: string;
        zak?: string;
        tk?: string;
        success: () => void;
        error: (err: unknown) => void;
      }) => void;
    };
  }
}