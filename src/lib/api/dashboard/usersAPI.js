import { cookies } from "next/headers";

// Server-side API functions for users management

export const getUsers = async (
  role = "user",
  page = 1,
  pageSize = 10,
  q = ""
) => {
  try {
    const params = new URLSearchParams({ role, page, pageSize });
    if (q) params.set("q", q);

    const cookieStore = await cookies();
    const token =
      cookieStore.get("authjs.session-token")?.value ||
      cookieStore.get("__Secure-authjs.session-token")?.value;

    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL
      }/dashboard/users?${params.toString()}`,
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

    return await res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
