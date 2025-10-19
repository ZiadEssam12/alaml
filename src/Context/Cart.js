"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { loadingContext } from "./LoadinContext";
import { getUserTokenCSR } from "@/lib/auth-helpers-client";

export const cartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { loading, setLoading } = useContext(loadingContext);
  const [userToken, setUserToken] = useState(null);
  console.log("User Token in Cart Context:", userToken);

  useEffect(() => {
    const getToken = () => {
      try {
        const token = getUserTokenCSR();
        setUserToken(token);
      } catch (error) {
        console.error("Failed to get token:", error);
        setUserToken(null);
      }
    };
    getToken();
  }, []);

  // Fetch cart when token is available
  useEffect(() => {
    // Fetch cart from API using token
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/user/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCart(data.data?.items || []);
      })
      .catch(() => {
        setCart([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const isInCart = (id) => {
    return cart.some((item) => item.productId === id);
  };

  const addToCart = (product, quantity) => {
    if (!isInCart(product.id)) {
      setCart((prev) => [...prev, { ...product, quantity }]);
    }

    if (!userToken) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    const item = {
      productId: product.id,
      quantity,
    };

    fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ item }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "حدث خطأ أثناء إضافة المنتج للسلة!");
          return;
        }
        // Update cart state with returned cart items
        setCart(data.data.items || []);
        toast.success("تم إضافة المنتج إلى السلة!");
      })
      .catch(() => {
        toast.error("حدث خطأ أثناء إضافة المنتج للسلة!");
      });
  };

  const removeCartItem = (id) => {
    if (!userToken) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/item/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "حدث خطأ أثناء إزالة المنتج!");
          return;
        }
        setCart((prev) => prev.filter((item) => item.id !== id));
        toast.success("تم إزالة المنتج من السلة!");
      })
      .catch(() => {
        toast.error("حدث خطأ أثناء إزالة المنتج!");
      });
  };

  const emptyCart = () => {
    if (!userToken) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "حدث خطأ أثناء إفراغ السلة!");
          return;
        }
        setCart([]);
        toast.success("تم إفراغ السلة بنجاح!");
      })
      .catch(() => {
        toast.error("حدث خطأ أثناء إفراغ السلة!");
      });
  };

  const totalItemInCart = cart.length;

  const updateCartItem = (id, newQuantity) => {
    if (!userToken) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + newQuantity }
          : item
      )
    );
    toast.success("تم تحديث المنتج في السلة!");

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/item/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ quantity: newQuantity }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "حدث خطأ أثناء تحديث المنتج!");
        }
      })
      .catch((error) => {
        toast.error(error.message || "حدث خطأ أثناء تحديث المنتج!");
        setCart((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, quantity: item.quantity - newQuantity }
              : item
          )
        );
      });
  };

  return (
    <cartContext.Provider
      value={{
        cart,
        setCart,
        total,
        isInCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        totalItemInCart,
        emptyCart,
      }}
    >
      {children}
    </cartContext.Provider>
  );
};
