import NextAuthProvider from "@/providers/session-provider";
import { AuthErrorProvider } from "@/providers/auth-error-provider";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/providers/react-query-provider";
import ClientLayout from "@/components/ClientLayout";

const fontSans = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <NextAuthProvider>
          <ReactQueryProvider>
            <AuthErrorProvider>
              {children}
            </AuthErrorProvider>
          </ReactQueryProvider>
        </NextAuthProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
