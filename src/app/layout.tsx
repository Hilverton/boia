import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boia · gere mais, gaste menos",
  description: "Estúdio de imagem e vídeo com IA em que você paga o preço real de cada geração, direto na sua conta da Runware. Gere mais, gaste menos.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="antialiased selection:bg-[#FF5500]/30 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
