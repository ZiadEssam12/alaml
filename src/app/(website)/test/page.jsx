"use client";

import { useState, Suspense, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DynamicIcons from "@/components/DynamicIcons";

export default function Page() {
  const [form, setForm] = useState({ name: "", icon: "" });
  const [product, setProduct] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProduct(form);
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          placeholder="اسم المنتج"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          name="icon"
          placeholder="اسم الأيقونة من lucide-react (مثال: BookOpen)"
          value={form.icon}
          onChange={handleChange}
          required
        />
        <Button type="submit" className="w-full">
          عرض المنتج
        </Button>
      </form>

      {product && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DynamicIcons icon={product.icon} size={32} />
            </CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      )}
    </div>
  );
}
