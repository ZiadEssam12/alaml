"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  ShoppingCart,
  Shield,
  Search,
} from "lucide-react";
import { PaginationClient } from "@/components/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";

import Cookies from "js-cookie";

async function createAdmin(email) {
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
      body: JSON.stringify({ email }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create admin");
  }
  return res.json();
}

async function updateUser(id, data) {
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
  return res.json();
}

async function deleteUser(id) {
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
  return res.json();
}

export default function UsersClient({
  initialUsersData,
  initialAdminsData,
  initialSearchQuery,
  initialPage,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState("users");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [editUserData, setEditUserData] = useState({ name: "", email: "" });
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  const { data: session } = useSession();

  const handleSearch = (query) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page"); // Reset to page 1 when searching

    startTransition(() => {
      router.push(`/dashboard/users?${params.toString()}`);
    });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await createAdmin(newAdminEmail);
      setNewAdminEmail("");
      setShowAddModal(false);
      router.refresh(); // Refresh the page data
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editingUser.id, editUserData);
      setShowEditModal(false);
      setEditingUser(null);
      setEditUserData({ name: "", email: "" });
      router.refresh(); // Refresh the page data
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (confirm(`هل أنت متأكد من حذف ${user.name}؟`)) {
      try {
        await deleteUser(user.id);
        router.refresh(); // Refresh the page data
      } catch (error) {
        alert(error.message || "حدث خطأ أثناء حذف المستخدم");
      }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditUserData({ name: user.name, email: user.email || "" });
    setShowEditModal(true);
  };

  const currentUsers =
    activeTab === "users" ? initialUsersData.data : initialAdminsData.data;
  const currentPagination =
    activeTab === "users"
      ? initialUsersData.pagination
      : initialAdminsData.pagination;

  const sortedUsers = currentUsers;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
        {activeTab === "admins" && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <UserPlus size={18} />
            إضافة مشرف جديد
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        <Input
          type="text"
          placeholder="البحث بالاسم أو البريد الإلكتروني..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
          disabled={isPending}
        />
      </div>

      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "users"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users size={18} />
          المستخدمين ({initialUsersData.pagination.totalCount})
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "admins"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield size={18} />
          المشرفين ({initialAdminsData.pagination.totalCount})
        </button>
      </div>

      {isPending && (
        <div className="text-center py-4 text-gray-500">جاري التحديث...</div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-right">الاسم</th>
              <th className="px-4 py-2 text-right">البريد الإلكتروني</th>
              {activeTab === "users" && (
                <th className="px-4 py-2 text-center">عدد الطلبات</th>
              )}
              <th className="px-4 py-2 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "users" ? 4 : 3}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا توجد بيانات.
                </td>
              </tr>
            ) : (
              sortedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b hover:bg-gray-50 ${
                    user.email === session?.user?.email
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {user.name}
                      {user.email === session?.user?.email && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          أنت
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 lowercase">{user.email || "-"}</td>

                  {activeTab === "users" && (
                    <td className="px-4 py-2 text-center">
                      {user._count.orders}
                    </td>
                  )}

                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        title="تعديل"
                      >
                        <Edit2 size={16} />
                      </Button>
                      {activeTab === "admins" &&
                        user.email !== session?.user?.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            title="حذف"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Only show for users tab */}
      {activeTab === "users" && currentPagination.maxPage > 1 && (
        <div className="mt-6 flex justify-center">
          <PaginationClient
            maxPage={currentPagination.maxPage}
            currentPage={currentPagination.page}
            basePath="/dashboard/users"
          />
        </div>
      )}

      {/* Add Admin Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة مشرف جديد</DialogTitle>
            <DialogDescription>
              أدخل البريد الإلكتروني للمشرف الجديد
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAdmin}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-4">
                <Label htmlFor="email" className="text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">إضافة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>قم بتعديل بيانات المستخدم</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  الاسم
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={editUserData.name}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, name: e.target.value })
                  }
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserData.email}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">حفظ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
