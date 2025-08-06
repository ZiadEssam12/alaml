"use client";

import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const cartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const isInCart = (id) => {
    return cart.some((item) => item.id === id);
  };

  const addToCart = (product, quantity) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      toast.error(`المنتج ${product.name} موجود بالفعل في السلة!`);
      return;
    }
    const newProduct = { ...product, quantity };
    setCart((prev) => [...prev, newProduct]);
    toast.success(`تم إضافة ${product.name} إلى السلة!`);
  };

  const removeCartItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("تم إزالة المنتج من السلة!");
  };

  const emptyCart = () => {
    setCart([]);
    toast.success("تم إفراغ السلة بنجاح!");
  };

  const totalItemInCart = cart.length;

  return (
    <cartContext.Provider
      value={{
        cart,
        setCart,
        total,
        isInCart,
        addToCart,
        removeCartItem,
        totalItemInCart,
        emptyCart,
      }}
    >
      {children}
    </cartContext.Provider>
  );
};
