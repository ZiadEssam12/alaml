import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">الصفحة غير موجودة</h2>
        <p className="text-muted-foreground mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة. ربما تم حذفها أو تغيير
          عنوانها.
        </p>
        <Button asChild>
          <Link href="/">العودة إلى الصفحة الرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
