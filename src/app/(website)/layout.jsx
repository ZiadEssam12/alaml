import Footer from "@/components/Layout/Footer";
import Navbar from "@/components/Layout/Navbar";
import React from "react";

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container mt-24">{children}</main>
      <Footer />
    </>
  );
}
