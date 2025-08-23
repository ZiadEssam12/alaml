import { auth } from "@/auth/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="-my-10 h-screen flex items-center justify-center">
      <div className=" p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">مرحباً بك في لوحة التحكم</h1>
        <p className="text-lg">مرحباً، {session?.user?.name}!</p>
      </div>
    </div>
  );
}
