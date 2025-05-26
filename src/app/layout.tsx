import type { Metadata } from "next";
import { APP_CONSTANTS } from "@/lib/constants/app";
import "./globals.css";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoadingProvider } from "@/providers/loading-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_CONSTANTS.name}`,
    default: APP_CONSTANTS.name,
  },
  description: APP_CONSTANTS.description,
  metadataBase: new URL(APP_CONSTANTS.serverUrl),
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
      <body suppressHydrationWarning>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </body>
    </html>
  );
}
