"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ArrowRight, BookOpen, PenTool, Palette } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-secondary rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent rounded-full"></div>
        <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-primary rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-right space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                اكتشف عالم القرطاسية
                <span className="block text-primary">مع مكتبة الأمل</span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                نقدم لك أفضل المنتجات القرطاسية بأسعار تنافسية وجودة عالية. من
                الأقلام إلى الكتب، كل ما تحتاجه للدراسة والعمل.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>كتب متنوعة</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <PenTool className="h-5 w-5 text-primary" />
                <span>أدوات كتابة</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Palette className="h-5 w-5 text-primary" />
                <span>أدوات فنية</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link href="/products">
                  تصفح المنتجات
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3"
              >
                <Link href="/categories">الفئات</Link>
              </Button>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <Card className="bg-card/80 backdrop-blur-sm shadow-xl border-border">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="font-semibold text-primary">كتب مدرسية</p>
                  </div>
                  <div className="bg-secondary/10 rounded-lg p-4 text-center hover:bg-secondary/20 transition-colors">
                    <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="font-semibold text-muted-foreground">أقلام</p>
                  </div>
                  <div className="bg-muted/10 rounded-lg p-4 text-center hover:bg-muted/20 transition-colors">
                    <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="font-semibold text-muted-foreground">
                      أدوات فن
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center hover:bg-primary/20 transition-colors">
                    <div className="h-12 w-12 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">
                        %
                      </span>
                    </div>
                    <p className="font-semibold text-primary">خصومات</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-secondary text-secondary-foreground rounded-full p-3 shadow-lg">
              <PenTool className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
