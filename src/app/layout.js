import "./globals.css";
import { Cairo } from "next/font/google";
import { ThemeProvider } from "../../Contexts/Theme";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/Context/Cart";
import { LoadingProvider } from "@/Context/LoadinContext";
import Loading from "@/components/Loading";
import { SessionProvider } from "next-auth/react";

// Configure Cairo font
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata = {
  title: "مكتبة الأمل",
  description: "متجر القرطاسية الإلكتروني",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/tajawal/tajawal-v11-latin-300.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/tajawal/tajawal-v11-latin-500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/tajawal/tajawal-v11-latin-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/tajawal/tajawal-v11-latin-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${cairo.variable} font-cairo no-scroll`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <CartProvider>
              <SessionProvider>
                <div className="min-h-screen flex flex-col overflow-x-hidden">
                  {children}
                </div>
              </SessionProvider>
              <Toaster position="bottom-right" />
              <Loading />
            </CartProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
