"use client";

import { getCookie, setCookie } from "@/lib/getCookies";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { loadingContext } from "./LoadinContext";

export const cartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const { loading, setLoading } = useContext(loadingContext);

  useEffect(() => {
    let userId = getCookie("userid");

    const createAnonymousUser = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "anonymous", role: "user", email: null }),
      });
      const data = await res.json();
      return data.data?.id;
    };
    (async () => {
      if (!userId) {
        userId = await createAnonymousUser();
        if (userId) setCookie("userid", userId);
      }
      if (!userId) return;
      // Fetch cart from API
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/user/`, {
        method: "GET",
        headers: { "Content-Type": "application/json", userid: userId },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.newUserId) {
            setCookie("userid", data.newUserId);
          }
          setCart(data.data.items || []);
        })
        .catch(() => {
          setCart([]);
        })
        .finally(() => {
          setLoading(false);
        });
    })();
  }, []);

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const isInCart = (id) => {
    return cart.some((item) => item.productId === id);
  };

  const addToCart = (product, quantity) => {
    const userId = getCookie("userid");
    if (!userId) {
      toast.error("لم يتم العثور على معرف المستخدم!");
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
        userid: userId,
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
    const userId = getCookie("userid");
    if (!userId) {
      toast.error("لم يتم العثور على معرف المستخدم!");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart/item/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        userid: userId,
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
    const userId = getCookie("userid");
    if (!userId) {
      toast.error("لم يتم العثور على معرف المستخدم!");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/cart`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        userid: userId,
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

  const updateCartItem = (id, updatedItem) => {
    const userId = getCookie("userid");
    if (!userId) {
      toast.error("لم يتم العثور على معرف المستخدم!");
      return;
    }
    fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        userid: userId,
      },
      body: JSON.stringify({ userId, items: [updatedItem] }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "حدث خطأ أثناء تحديث المنتج!");
          return;
        }
        setCart((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          )
        );
        toast.success("تم تحديث المنتج في السلة!");
      })
      .catch(() => {
        toast.error("حدث خطأ أثناء تحديث المنتج!");
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
