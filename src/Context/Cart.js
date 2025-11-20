"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { loadingContext } from "./LoadinContext";
import { getUserTokenCSR } from "@/lib/auth-helpers-client";

export const cartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { loading, setLoading } = useContext(loadingContext);
  const { data: session, status } = useSession();

  const userToken = getUserTokenCSR();

  // Initialize cart from database when user is authenticated
  useEffect(() => {
    if (status === "loading") {
      return; // Wait for session to load
    }

    if (status === "authenticated") {
      // Fetch cart from database for authenticated users
      const fetchCart = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/cart/user`,
            {
              cache: "no-store",
              headers: {
                Authorization: `Bearer ${userToken}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok) {
            // Endpoint returns data.data which contains the cart object with items
            setCart(data.data?.items || []);
          } else {
            console.error("Failed to fetch cart:", data.error);
            setCart([]);
          }
        } catch (error) {
          console.error("Error fetching cart:", error);
          setCart([]);
        } finally {
          setLoading(false);
        }
      };

      fetchCart();
    } else if (status === "unauthenticated") {
      // User is not logged in
      setCart([]);
      setLoading(false);
    }
  }, [status, setLoading]);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const isInCart = (id) => {
    return cart.some((item) => item.productId === id);
  };

  const addToCart = (product, quantity, variantId) => {
    if (!isInCart(product.id)) {
      setCart((prev) => [...prev, { ...product, quantity }]);
    }

    // Check if user is authenticated
    if (!session) {
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
    if (!session) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/item/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
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
    if (!session) {
      toast.error("يرجى تسجيل الدخول أولاً!");
      return;
    }

    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
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
    if (!session) {
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
