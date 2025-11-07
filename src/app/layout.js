import "./globals.css";
import { ThemeProvider } from "../../Contexts/Theme";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/Context/Cart";
import { LoadingProvider } from "@/Context/LoadinContext";
import { ReviewDialogProvider } from "@/Context/ReviewDialogContext";
import Loading from "@/components/Loading";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
export const metadata = {
  title: "مكتبة الأمل",
  description: "متجر الأدوات المكتبية الإلكتروني",
  metadataBase: new URL("https://alaml-theta.vercel.app"),
  openGraph: {
    siteName: "مكتبة الأمل",
    type: "website",
    locale: "ar_EG",
  },
  verification: {
    google: "ei3UX4cKwo_F9uckJtUy0D44rV6VVIuzKlcvgfopyWM",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow",
  },
  applicationName: "مكتبة الأمل",
  appleWebApp: {
    title: "مكتبة الأمل",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/cairo/cairo-v31-latin-300.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cairo/cairo-v31-latin-500.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cairo/cairo-v31-latin-700.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/cairo/cairo-v31-latin-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`no-scroll`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <SessionProvider>
              <CartProvider>
                <ReviewDialogProvider>
                  <div className="min-h-screen flex flex-col overflow-x-hidden">
                    {children}
                  </div>
                </ReviewDialogProvider>
                <Toaster position="bottom-right" />
                <Loading />
              </CartProvider>
            </SessionProvider>
          </LoadingProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
