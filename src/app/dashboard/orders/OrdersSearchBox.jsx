"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

export default function OrdersSearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset to first page on new search
    router.push(`?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-wrap gap-2 items-center"
      role="search"
    >
      <input
        type="text"
        placeholder="بحث بالاسم أو البريد أو رقم الطلب..."
        className="border rounded px-3 py-2 w-64"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
        بحث
      </button>
    </form>
  );
}
