import "./globals.css";

import { ThemeProvider } from "../../Contexts/Theme";
import Navbar from "@/components/Layout/Navbar";

export default function RootLayout({ children }) {
  return (
    <>
      <html lang="ar" dir="rtl" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main className="container mt-[60px]">{children}</main>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
