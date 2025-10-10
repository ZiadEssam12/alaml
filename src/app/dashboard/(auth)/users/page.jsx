import UsersClient from "./UsersClient";
import { getUsers } from "@/lib/api/dashboard/usersAPI";

export default async function UsersPage({ searchParams }) {
  const q = (await searchParams)?.q || "";
  const page = parseInt((await searchParams)?.page || "1", 10);

  try {
    const [usersData, adminsData] = await Promise.all([
      getUsers("user", page, 10, q),
      getUsers("admin", 1, 50, q),
    ]);

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
