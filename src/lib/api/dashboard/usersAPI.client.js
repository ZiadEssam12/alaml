import Cookies from "js-cookie";

// Client-side API functions for users management (no server-side dependencies)

export const createAdmin = async ({ name, email }) => {
  try {
    const token =
      Cookies.get("authjs.session-token") ||
      Cookies.get("__Secure-authjs.session-token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create admin");
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating admin:", error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const token =
      Cookies.get("authjs.session-token") ||
      Cookies.get("__Secure-authjs.session-token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/users/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to update user");
    }

    return await res.json();
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const token =
      Cookies.get("authjs.session-token") ||
      Cookies.get("__Secure-authjs.session-token");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/users/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete user");
    }

    return await res.json();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
