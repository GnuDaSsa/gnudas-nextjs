import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "GnuDaS GPT World",
  description: "Deep Learning Crew - AI Tools Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
