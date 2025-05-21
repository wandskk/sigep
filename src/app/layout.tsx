import { ReactNode } from "react";
import { Inter, Geist } from "next/font/google";
import { Metadata } from "next";
import "./globals.css";
import { NextAuthProvider } from "@/providers/auth-provider";
import Navbar from "@/components/ui/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "SIGEP - Sistema de Gestão Escolar de Baraúna",
  description: "Sistema de Gestão Escolar para a rede municipal de ensino de Baraúna/RN",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geist.variable} font-sans`}
      >
        <NextAuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}
