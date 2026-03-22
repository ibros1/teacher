import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Trash2,
  Pencil,
  Users,
  UserCheck,
  GraduationCap,
  BookUser,
  Shield,
  KeyRound,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { AppDispatch, RootState } from "../../store/store";
import { listUsersFn_admins } from "../../store/slices/auth/user/getAllUsersAsAdmin";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router";
import { Label } from "../../components/ui/label";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  resetUpdateUserFn,
  updateUserFn,
} from "../../store/slices/auth/user/updateUser";
import {
  resetUpdatedRoleState,
  updateRoleFn,
} from "../../store/slices/auth/user/updateRole";
import { toast } from "sonner";
import {
  deleteUserFn,
  resetDeleteUserState,
} from "../../store/slices/auth/user/deleteUser";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import {
  resetResetPasswordState,
  resetPasswordFn,
} from "../../store/slices/auth/user/resetPassword";
import { updateUserInLogin } from "../../store/slices/auth/login";
import Spinner from "../../components/spinner";
import UsersAdminsSkeleton from "../../components/ui/userSkeleton";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminStatsCards from "../components/AdminStatsCards";
import AdminTableShell from "../components/AdminTableShell";
import AdminPagination from "../components/AdminPagination";
import AdminDataTable from "../components/AdminDataTable";
import type { User } from "../../types/adminUsers";

const UsersAdmins = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userState = useSelector(
    (state: RootState) => state.listUsers_Admins_Slice
  );

  const [page, setPage] = useState(1);
  const perPage = 10;
  const [globalFilter, setGlobalFilter] = useState("");

  const users =
    userState.data?.users
      ?.slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ) || [];
  const totalPages = userState.data?.totalPages || 1;
  const navigate = useNavigate();
  const [isEditUserDailogOpen, setIsEditDialogUserOpen] = useState(false);

  const updateState = useSelector((state: RootState) => state.updateUserSlice);
  const updateRoleState = useSelector(
    (state: RootState) => state.updateRoleSlice
  );
  const resetPasswordState = useSelector(
    (state: RootState) => state.resetPasswordSlice
  );

  const [fullName, setFullname] = useState("");
  const [userName, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [role, setRole] = useState("");

  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const user = selectedUser;

  // Calculate summary statistics
  const totalUsers = userState.data?.total || users.length;
  const activeUsers = users.filter((user) => user.is_active).length;
  const totalStudents = users.filter((user) => user.role === "STUDENT").length;
  const totalInstructors = users.filter(
    (user) => user.role === "INSTRUCTOR"
  ).length;
  const totalAdmins = users.filter((user) => user.role === "ADMIN").length;

  useEffect(() => {
    if (selectedUser) {
      setFullname(selectedUser.full_name);
      setUsername(selectedUser.username);
      setEmail(selectedUser.email);
      setPhoneNumber(selectedUser.phone_number);
      setRole(selectedUser.role?.toUpperCase() || "STUDENT");
    }
  }, [selectedUser]);

  useEffect(() => {
    dispatch(listUsersFn_admins({ page, perPage }));
  }, [dispatch, page, perPage]);

  const updateUserHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName || !userName || !email) {
      toast.error("Full name, username, and email are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", user.id.toString());
      formData.append("email", email);
      formData.append("fullName", fullName);
      formData.append("username", userName);
      formData.append("phone_number", phoneNumber);
      if (profilePhoto) formData.append("profilePhoto", profilePhoto);
      if (coverPhoto) formData.append("coverPhoto", coverPhoto);

      const updateUserAction = await dispatch(updateUserFn(formData));
      const updatedUser = updateUserAction.payload;

      if (updateUserFn.fulfilled.match(updateUserAction)) {
        const updateRoleAction = await dispatch(
          updateRoleFn({
            email: email,
            role: role,
          })
        );

        if (updateRoleFn.fulfilled.match(updateRoleAction)) {
          toast.dismiss();
          toast.success("User updated successfully!");
          const loggedInUserId = updateState?.data?.user?.id;
          if (updatedUser.id === loggedInUserId) {
            dispatch(updateUserInLogin(updatedUser));
          }
          setIsEditDialogUserOpen(false);
          dispatch(listUsersFn_admins({ page, perPage }));
          dispatch(resetUpdateUserFn());
          dispatch(resetUpdatedRoleState());
        } else {
          toast.error("Failed to update user role.");
        }
      } else if (updateRoleState.loading) {
        toast.dismiss();
        toast.loading("updating....");
        return;
      } else {
        toast.dismiss();
        toast.error("Failed to update user details.");
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  const resetPasswordHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const action = await dispatch(
        resetPasswordFn({
          userId: user.id,
          newPassword,
        })
      );

      if (resetPasswordFn.fulfilled.match(action)) {
        toast.success("Password reset successfully!");
        setIsResetPasswordDialogOpen(false);
        setNewPassword("");
        dispatch(resetResetPasswordState());
      } else {
        toast.error(resetPasswordState.error || "Failed to reset password.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  const [isDeletedDailogOpen, setIsDeletedDailogOpen] = useState(false);
  const deleteHandler = (userId: number) => {
    dispatch(deleteUserFn(userId));
  };
  const deleteState = useSelector((state: RootState) => state.deleteUserSlice);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: (info) => (
        <span className="text-muted-foreground">
          {String(info.getValue() as number)}
        </span>
      ),
    },
    {
      id: "user",
      header: "User",
      accessorFn: (row) => row.full_name,
      cell: ({ row }) => {
        const u = row.original;
        const src = u.profilePhoto
          ? `${u.profilePhoto}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(
              u.full_name
            )}`;
        return (
          <div className="flex items-center gap-2 min-w-[220px]">
            <img
              src={src}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border shadow-sm"
            />
            <span
              onClick={() => navigate(`/dashboard/students/${u.id}`)}
              className="cursor-pointer font-medium dark:text-green-400 hover:underline truncate max-w-[200px]"
              title={u.full_name}
            >
              {u.full_name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "username",
      header: "Username",
      cell: (info) => (
        <span className="truncate">@{String(info.getValue() as string)}</span>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: (info) => <span>{(info.getValue() as string) || "-"}</span>,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: (info) => {
        const email = String(info.getValue() as string);
        return (
          <span
            className="max-w-[260px] truncate text-green-700 dark:text-green-400"
            title={email}
          >
            {email}
          </span>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: (info) => {
        const role = info.getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              role === "ADMIN"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : role === "INSTRUCTOR"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      id: "enrollements",
      header: "Enrollments",
      accessorFn: (row) => row.enrollements?.length ?? 0,
      cell: (info) => (
        <span className="text-center">{String(info.getValue() as number)}</span>
      ),
    },
    {
      id: "courses",
      header: "Courses Created",
      accessorFn: (row) => row.courses?.length ?? 0,
      cell: (info) => (
        <span className="text-center">{String(info.getValue() as number)}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: (info) =>
        new Date(info.getValue() as Date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: (info) =>
        new Date(info.getValue() as Date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }),
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: (info) => {
        const active = info.getValue() as boolean;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              active
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1 border-slate-300 dark:border-slate-700"
            onClick={() => {
              setSelectedUser(row.original);
              setIsResetPasswordDialogOpen(true);
            }}
          >
            <KeyRound className="w-4 h-4" />
            Reset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedUser(row.original);
              setIsEditDialogUserOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setSelectedUser(row.original);
              setIsDeletedDailogOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (deleteState.error) {
      toast.error(deleteState.error);
      return;
    }
    if (deleteState.data.isSuccess) {
      toast.success("User deleted successfully!");
      dispatch(listUsersFn_admins({ page, perPage }));
      dispatch(resetDeleteUserState());
    }
  }, [deleteState, dispatch, page, perPage]);

  if (userState.loading) {
    return <UsersAdminsSkeleton />;
  }

  return (
    <div className="p-6 dark:bg-[#091025] min-h-screen transition-colors duration-300">
      <AdminPageHeader
        title="User Management"
        description="Manage students, instructors and admins"
      />

      <div className="mt-6">
        <AdminStatsCards
          columnsClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          items={[
            {
              title: "Total Users",
              value: totalUsers,
              icon: <Users className="w-5 h-5" />,
            },
            {
              title: "Active Users",
              value: activeUsers,
              icon: <UserCheck className="w-5 h-5" />,
            },
            {
              title: "Students",
              value: totalStudents,
              icon: <GraduationCap className="w-5 h-5" />,
            },
            {
              title: "Instructors",
              value: totalInstructors,
              icon: <BookUser className="w-5 h-5" />,
            },
            {
              title: "Administrators",
              value: totalAdmins,
              icon: <Shield className="w-5 h-5" />,
            },
          ]}
        />
      </div>

      <AdminTableShell>
        <AdminDataTable
          data={users}
          columns={columns}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          searchPlaceholder="Search users..."
          emptyText="No users found."
        />
      </AdminTableShell>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
      <Dialog
        open={isEditUserDailogOpen}
        onOpenChange={setIsEditDialogUserOpen}
      >
        <DialogContent className="sm:max-w-[98vw] md:max-w-[650px] lg:max-w-[800px] max-h-[90vh] overflow-auto rounded-2xl xl:max-w-[900px] bg-white dark:bg-neutral-900 shadow-xl border border-gray-200 dark:border-neutral-800 transition-colors duration-300">
          <form onSubmit={updateUserHandler}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold dark:text-white tracking-tight">
                Edit User Profile
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                Update user details below
              </DialogDescription>
            </DialogHeader>

            {/* Profile Preview */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="relative">
                <img
                  src={
                    profilePhoto
                      ? URL.createObjectURL(profilePhoto)
                      : user?.profilePhoto
                      ? `${user?.profilePhoto}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user?.full_name || ""
                        )}&background=fff&color=222`
                  }
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-white dark:border-white object-cover shadow-lg transition-transform duration-300 hover:scale-105"
                />
                <span className="absolute bottom-0 right-0 bg-white text-gray-800 rounded-full p-1 text-xs shadow-md">
                  ✎
                </span>
              </div>
              <span className="font-semibold text-lg dark:text-white">
                {fullName || user?.full_name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 px-2 py-1 rounded-full">
                @{userName || user?.username}
              </span>
            </div>

            <div className="grid gap-5 py-2">
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullname(e.target.value)}
                  className="dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200 focus:border-gray-400"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  Username
                </Label>
                <Input
                  id="Username"
                  value={userName}
                  onChange={(e) => setUsername(e.target.value)}
                  className="dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200 focus:border-gray-400"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200 focus:border-gray-400"
                  required
                  type="email"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  Role
                </Label>
                <select
                  name="role"
                  id="role"
                  className="py-2 px-2 border rounded-md dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200 focus:border-gray-400"
                  value={role || user?.role?.toUpperCase() || ""}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="INSTRUCTOR">INSTRUCTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  type="tel"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200 focus:border-gray-400"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  Change Profile Photo
                </Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      setProfilePhoto(file);
                    }
                  }}
                  className="dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200 focus:border-gray-400"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  Change Cover Photo
                </Label>
                <Input
                  id="coverPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.currentTarget.files?.[0];
                    if (file) {
                      setCoverPhoto(file);
                    }
                  }}
                  className="dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200 focus:border-gray-400"
                />
              </div>
            </div>

            {/* Extra Features */}
            <div className="flex flex-col gap-2 mt-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated:{" "}
                  {user?.updated_at
                    ? new Date(user.updated_at).toLocaleString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {user ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 mt-6">
              <Button
                disabled={updateState.loading || updateRoleState.loading}
                type="submit"
                className="disabled:bg-gray-500 disabled:cursor-auto disabled:hover:bg-gray-500 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg w-full lg:w-auto rounded-xl py-2 px-6 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {updateState.loading || updateRoleState.loading ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <>
                    <Pencil className="w-4 h-4" />
                    Update User
                  </>
                )}
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="w-full lg:w-auto rounded-xl py-2 px-6 border-gray-200 dark:border-white"
                >
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeletedDailogOpen}
        onOpenChange={setIsDeletedDailogOpen}
      >
        <AlertDialogContent className="rounded-2xl p-6 shadow-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Delete User Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">{selectedUser?.full_name}</span>?
              This action cannot be undone and will remove all user data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex justify-end gap-4">
            <AlertDialogCancel className="px-6 py-2 rounded-lg border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser && selectedUser.id) {
                  deleteHandler(selectedUser.id);
                } else {
                  toast.error("No user selected for deletion.");
                }
              }}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleteState.loading ? <Spinner /> : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsResetPasswordDialogOpen(open);
          if (!open) {
            setNewPassword("");
            dispatch(resetResetPasswordState());
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-gray-200 dark:border-neutral-800">
          <form onSubmit={resetPasswordHandler}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold dark:text-white tracking-tight flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-green-500" />
                Reset Password
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 dark:text-gray-300">
                Enter a new password for{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedUser?.full_name}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label className="text-gray-800 dark:text-white font-medium">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="dark:bg-neutral-800 dark:text-white bg-white text-gray-800 border-gray-200"
                  required
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full sm:w-auto rounded-xl"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={resetPasswordState.loading}
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-lg w-full sm:w-auto rounded-xl py-2 px-6 flex items-center justify-center gap-2"
              >
                {resetPasswordState.loading ? (
                  <Spinner className="w-4 h-4" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default UsersAdmins;
