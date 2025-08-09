import "./globals.css";
import { Cairo } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "../../Contexts/Theme";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/Context/Cart";
import { LoadingProvider } from "@/Context/LoadinContext";
import Loading from "@/components/Loading";

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
      <head />
      <body className={`${cairo.variable} font-cairo no-scroll`}>
        {/* You can provide userInfo via context/provider here if needed */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="container my-10">{children}</main>
                <Footer />
              </div>
              <Toaster position="bottom-right" />
              <Loading />
            </CartProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
