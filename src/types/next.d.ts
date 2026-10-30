// Type declarations for Next.js App Router files in this project
declare module 'next/server' {
  export class NextResponse extends Response {
    static json<T>(data: T, init?: ResponseInit): Response;
  }
  export type NextRequest = Request;
}

declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    appleWebApp?: {
      capable?: boolean;
      statusBarStyle?: string;
      title?: string;
    };
    icons?: {
      icon?: string;
      apple?: string;
      shortcut?: string;
    };
    [key: string]: unknown;
  }

  export interface Viewport {
    themeColor?: string;
    width?: string;
    initialScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    [key: string]: unknown;
  }
}
