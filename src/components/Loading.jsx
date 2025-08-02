"use client";

import { cartContext } from "@/Context/Cart";
import { loadingContext } from "@/Context/LoadinContext";
import React, { useContext, useEffect } from "react";

export default function Loading() {
  const { loading, setLoading } = useContext(loadingContext);
  const { cart } = useContext(cartContext);

  useEffect(() => {
    if (!loading) {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [loading]);

  useEffect(() => {
    if (cart) {
      setLoading(false);
    }
  }, [cart, loading]);

  if (!loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col gap-6 items-center justify-center">
      <p className="font-bold text-5xl text-primary">مكتبة الأمل</p>
      <p className="text-xl">كل ما تتمناه موجود</p>
    </div>
  );
}
