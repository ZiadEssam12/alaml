import { getUserTokenFromHeaders } from "@/lib/auth-helpers";

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

    const token = await getUserTokenFromHeaders();
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
