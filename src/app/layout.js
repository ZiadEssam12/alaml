import "./globals.css";
import { Cairo } from "next/font/google";

import { ThemeProvider } from "../../Contexts/Theme";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";

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

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head />
      <body className={`${cairo.variable} font-cairo`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="container mt-[20px]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
