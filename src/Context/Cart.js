"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { loadingContext } from "./LoadinContext";

export const cartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { loading, setLoading } = useContext(loadingContext);
  const [userToken, setUserToken] = useState(null);
  console.log("User Token in Cart Context:", userToken);

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/auth/token`
        );
        const data = await response.json();
        if (data.token) {
          setUserToken(data.token);
        } else {
          setUserToken(null);
        }
      } catch (error) {
        console.error("Failed to get token:", error);
        setUserToken(null);
      }
    };
    getToken();
  }, []);

  // Fetch cart when token is available
  useEffect(() => {
    if (!userToken) {
      setLoading(false);
      return;
    }

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
  }, [userToken, setLoading]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const isInCart = (id) => {
    return cart.some((item) => item.productId === id);
  };

  const addToCart = (product, quantity, variantId) => {
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
      ...(variantId && { variantId }),
    };

    toast.promise(
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
            throw new Error(data.error || "حدث خطأ أثناء إضافة المنتج للسلة!");
          }
          // Update cart state with returned cart items
          setCart(data.data.items || []);
          return data;
        })
        .catch((error) => {
          throw error;
        }),
      {
        loading: "جاري إضافة المنتج...",
        success: "تم إضافة المنتج إلى السلة!",
        error: (err) => err.message || "حدث خطأ أثناء إضافة المنتج للسلة!",
      }
    );
  };

  const removeCartItem = (id) => {
    if (!userToken) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    toast.promise(
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
            throw new Error(data.error || "حدث خطأ أثناء إزالة المنتج!");
          }
          setCart((prev) => prev.filter((item) => item.id !== id));
          return data;
        })
        .catch((error) => {
          throw error;
        }),
      {
        loading: "جاري إزالة المنتج...",
        success: "تم إزالة المنتج من السلة!",
        error: (err) => err.message || "حدث خطأ أثناء إزالة المنتج!",
      }
    );
  };

  const emptyCart = () => {
    if (!userToken) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    toast.promise(
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
            throw new Error(data.error || "حدث خطأ أثناء إفراغ السلة!");
          }
          setCart([]);
          return data;
        })
        .catch((error) => {
          throw error;
        }),
      {
        loading: "جاري إفراغ السلة...",
        success: "تم إفراغ السلة بنجاح!",
        error: (err) => err.message || "حدث خطأ أثناء إفراغ السلة!",
      }
    );
  };

  const totalItemInCart = cart.length;

  const updateCartItem = (id, newQuantity) => {
    if (!userToken) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    // Optimistically update UI
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + newQuantity }
          : item
      )
    );

    toast.promise(
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
          return data;
        })
        .catch((error) => {
          // Revert on error
          setCart((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity - newQuantity }
                : item
            )
          );
          throw error;
        }),
      {
        loading: "جاري تحديث المنتج...",
        success: "تم تحديث المنتج في السلة!",
        error: (err) => err.message || "حدث خطأ أثناء تحديث المنتج!",
      }
    );
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
