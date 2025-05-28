import type { Metadata, Viewport } from "next";
import { APP_CONSTANTS } from "@/lib/constants/app";
import "./globals.css";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoadingProvider } from "@/providers/loading-provider";
import { Providers } from "@/providers/providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_CONSTANTS.name}`,
    default: APP_CONSTANTS.name,
  },
  description: APP_CONSTANTS.description,
  metadataBase: new URL(APP_CONSTANTS.serverUrl),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_CONSTANTS.name,
  },
  icons: {
    icon: '/icons/icon-512x512.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': APP_CONSTANTS.name,
    'apple-mobile-web-app-title': APP_CONSTANTS.name,
    'theme-color': '#000000',
    'msapplication-navbutton-color': '#000000',
    'msapplication-starturl': '/',
    'msapplication-TileColor': '#000000',
    'msapplication-TileImage': '/icons/icon-144x144.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="pt-BR"
      className={inter.className}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content={APP_CONSTANTS.name} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_CONSTANTS.name} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body suppressHydrationWarning>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
