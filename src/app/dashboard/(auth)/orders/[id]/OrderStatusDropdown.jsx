"use client";
import React, { useState } from "react";

const statusOptions = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

export default function OrderStatusDropdown({ orderId, currentStatus }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setStatus(e.target.value);
    setSuccess(false);
    setError("");
  };

  const handleApply = async () => {
    setLoading(true);
    setSuccess(false);
    setError("");
    try {
      const { updateOrderStatusClient } = await import(
        "@/lib/api/dashboard/ordersAPI.client"
      );
      await updateOrderStatusClient(orderId, status);
      setSuccess(true);
    } catch (err) {
      setError("حدث خطأ أثناء تحديث الحالة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        className="border rounded px-2 py-1"
        value={status}
        onChange={handleChange}
        disabled={loading}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        className="bg-primary text-white px-3 py-1 rounded disabled:opacity-50"
        onClick={handleApply}
        disabled={loading || status === currentStatus}
      >
        {loading ? "..." : "تطبيق"}
      </button>
      {success && <span className="text-green-600 text-sm">تم التحديث</span>}
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
