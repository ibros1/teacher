import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import { listEnrollementsFn } from "../../store/slices/enrollments/listEnrollements";
import type { ColumnDef } from "@tanstack/react-table";

import {
  BookOpenCheck,
  CheckCircle,
  XCircle,
  Mail,
  BadgeDollarSign,
  CalendarClock,
} from "lucide-react";

import EditEnrolls from "../components/enrolls/EditEnrolls";
import DeleteEnrolls from "../components/enrolls/deleteEnrolls";
import LessonsSkeleton from "../../components/ui/LessonsSkeleton";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminStatsCards from "../components/AdminStatsCards";
import AdminTableShell from "../components/AdminTableShell";
import AdminPagination from "../components/AdminPagination";
import AdminDataTable from "../components/AdminDataTable";
import type { Enrollemnet } from "../../types/enrollement";

// ---------------- Types ----------------
type StatusType = "ALL" | "COMPLETED" | "IN_PROGRESS" | "FAILED";

// ---------------- Filter Options ----------------
const statusOptions: { label: string; value: StatusType }[] = [
  { label: "All", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Pending", value: "IN_PROGRESS" },
  { label: "Failed", value: "FAILED" },
];

// ---------------- Main Component ----------------
const Enrollments = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector(
    (state: RootState) => state.listEnrollementsSlice
  );
  const enrollments = data?.enrollemnets || [];

  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = data?.totalPages || 1;

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("ALL");

  // Fetch Enrollments
  useEffect(() => {
    dispatch(listEnrollementsFn({ page, perPage }));
  }, [dispatch, page, perPage]);

  // Filter + Search
  const filteredEnrollments = useMemo(() => {
    const list = enrollments.filter((enr) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : enr.status === statusFilter;

      const matchesSearch =
        enr.users!.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enr.users!.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enr.course!.title.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
    return list;
  }, [enrollments, searchTerm, statusFilter]);

  // Stats
  const stats = {
    total: data?.total || 0,
    completed: enrollments.filter((e) => e.status === "COMPLETED").length,
    pending: enrollments.filter((e) => e.status === "IN_PROGRESS").length,
    failed: enrollments.filter((e) => e.status === "FAILED").length,
  };

  const infoCards = [
    {
      title: "Total Enrollments",
      value: stats.total,
      subtitle: "All statuses",
      icon: <BookOpenCheck className="w-5 h-5" />,
    },
    {
      title: "Completed",
      value: stats.completed,
      subtitle: "Finished",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      title: "Pending",
      value: stats.pending,
      subtitle: "In progress",
      icon: <CalendarClock className="w-5 h-5" />,
    },
    {
      title: "Failed",
      value: stats.failed,
      subtitle: "Needs attention",
      icon: <XCircle className="w-5 h-5" />,
    },
  ];

  const columns: ColumnDef<Enrollemnet>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: (info) => <span>{info.getValue() as string}</span>,
    },
    {
      id: "full_name",
      header: "Full Name",
      accessorFn: (row) => row.users?.full_name,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <img
            src={row.original.users?.profilePhoto}
            alt={row.original.users?.full_name}
            className="w-10 h-10 rounded-full object-cover shadow"
          />
          <span className="truncate">{row.original.users?.full_name}</span>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorFn: (row) => row.users?.email,
      cell: ({ row }) => (
        <div className="flex gap-2 items-center text-green-700 dark:text-green-400 max-w-[220px]">
          <Mail className="w-4 h-4" />
          <span className="truncate">{row.original.users?.email}</span>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessorFn: (row) => row.users?.phone_number,
      cell: ({ row }) => <span>{row.original.users?.phone_number}</span>,
    },
    {
      id: "course",
      header: "Course Title",
      accessorFn: (row) => row.course?.title,
      cell: ({ row }) => <span>{row.original.course?.title}</span>,
    },
    {
      accessorKey: "courseId",
      header: "Course ID",
      cell: (info) => <span>{String(info.getValue() as number)}</span>,
    },
    {
      id: "price",
      header: "Price",
      accessorFn: (row) => row.course?.price,
      cell: ({ row }) => (
        <span className="text-green-600 dark:text-green-400">
          <BadgeDollarSign className="w-4 h-4 inline" /> ${row.original.course?.price}
        </span>
      ),
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: (info) => <span>{String(info.getValue() as number)}%</span>,
    },
    {
      accessorKey: "is_enrolled",
      header: "Enrolled",
      cell: (info) => <span>{String(info.getValue() as boolean).toUpperCase()}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              status === "COMPLETED"
                ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                : status === "IN_PROGRESS"
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300"
                : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: (info) => (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <CalendarClock className="w-4 h-4" />
          {new Date(info.getValue() as Date).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <EditEnrolls enrollement={row.original} />
          <DeleteEnrolls enrollement={row.original} />
        </div>
      ),
    },
  ];

  // Loading State
  if (loading) return <LessonsSkeleton />;

  return (
    <div className="p-6 dark:bg-[#091025] min-h-screen text-gray-900 dark:text-white">
      <AdminPageHeader
        title="Enrollments"
        description="Track course enrollment status and progress"
      />

      <div className="mt-6">
        <AdminStatsCards
          items={infoCards.map((c) => ({
            title: c.title,
            value: c.value,
            subtitle: c.subtitle,
            icon: c.icon,
          }))}
        />
      </div>

      <AdminTableShell
        toolbar={
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Input
              placeholder="Search by name, email, or course"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-72"
            />

            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={statusFilter === opt.value ? "default" : "secondary"}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        }
      >
        <AdminDataTable
          data={filteredEnrollments}
          columns={columns}
          emptyText="No enrollments found."
        />
      </AdminTableShell>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
};

export default Enrollments;
