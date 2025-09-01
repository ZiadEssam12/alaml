import { cookies } from "next/headers";
import UsersClient from "./UsersClient";

async function getUsers(role = "user", page = 1, pageSize = 10, q = "") {
  const params = new URLSearchParams({ role, page, pageSize });
  if (q) params.set("q", q);

  const cookieStore = await cookies();
  const token =
    cookieStore.get("authjs.session-token")?.value ||
    cookieStore.get("__Secure-authjs.session-token")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/users?${params.toString()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    console.error("Failed to fetch users:", await res.json());
    throw new Error("Failed to fetch users");
  }
  return res.json();
}

export default async function UsersPage({ searchParams }) {
  const q = (await searchParams)?.q || "";
  const page = parseInt((await searchParams)?.page || "1", 10);

  try {
    const [usersData, adminsData] = await Promise.all([
      getUsers("user", page, 10, q),
      getUsers("admin", 1, 50, q),
    ]);

    console.log("users:", usersData);

    return (
      <UsersClient
        initialUsersData={usersData}
        initialAdminsData={adminsData}
        initialSearchQuery={q}
        initialPage={page}
      />
    );
  } catch (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">
          خطأ في تحميل البيانات: {error.message}
        </div>
      </div>
    );
  }
}
