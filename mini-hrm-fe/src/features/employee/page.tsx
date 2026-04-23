"use client";
import { ConfirmDialog } from "@/components/common/feedback/ConfirmDialog";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";
import { EmployeeDialog } from "@/features/employee/components/EmployeeDialog";
import { EmployeeTable } from "@/features/employee/components/EmployeeTable";
import { BulkLeaveInitToolbar } from "@/features/employee/components/BulkLeaveInitToolbar";
import { PageHeader } from "@/components/common/layout/page-header";
import { TablePagination } from "@/components/common/table/Pagination";
import { ExportExcelButton } from "@/components/common/button/ExportExcelButton";
import { useEmployees } from "@/features/employee/hooks/use-employees";
import { getListEmployee } from "@/features/employee/services";
import {
  AddEmployeeValues,
  EditEmployeeValues,
} from "@/features/employee/schemas";
import { Employee, StatusFilter } from "@/features/employee/types";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExcelColumn } from "@/types/common";
import { Role } from "../auth/types/auth";
import { Can } from "@/components/common/auth/Can";
import { useLeavePolicy } from "@/features/leave-policy/hooks/use-leave-policy";

export default function EmployeeManagePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [confirmToggleTarget, setConfirmToggleTarget] =
    useState<Employee | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const isCodeSearch = /\d/.test(debouncedSearch);

  const currentFilters = {
    page,
    per_page: perPage,
    ...(debouncedSearch
      ? isCodeSearch
        ? { empCode: debouncedSearch }
        : { name: debouncedSearch }
      : {}),
    ...(statusFilter !== "all" ? { is_active: statusFilter === "active" } : {}),
    role: "employee" as Role,
  };

  const { updateLeaveBalance } = useLeavePolicy();

  const {
    listQueryEmployee,
    statsQueryEmployee,
    createEmployee,
    updateEmployee,
    toggleStatus,
    isCreating,
    isToggling,
    isFetching,
  } = useEmployees(currentFilters);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const isInitialLoading = listQueryEmployee.isLoading;

  const employees = listQueryEmployee.data?.data || [];
  const totalEmployees = listQueryEmployee.data?.meta?.total || 0;
  const totalPage = listQueryEmployee.data?.meta?.last_page || 1;

  const stats = useMemo(() => {
    const allEmployees = statsQueryEmployee.data?.data || [];
    return {
      total: statsQueryEmployee.data?.meta?.total || totalEmployees,
      admins: allEmployees.filter((e) => e.role === "admin").length,
      active: allEmployees.filter((e) => e.is_active).length,
      inactive: allEmployees.filter((e) => !e.is_active).length,
    };
  }, [statsQueryEmployee.data, totalEmployees]);

  const excelColumns: ExcelColumn<Employee>[] = useMemo(
    () => [
      { header: "ID", key: "id", width: 10 },
      {
        header: "Mã nhân viên",
        key: "empCode",
        width: 15,
        render: (row) => row.empCode.replaceAll("-", ""),
      },
      { header: "Họ và tên", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      {
        header: "Số điện thoại",
        key: "phone",
        width: 18,
        render: (row) => row.phone || "Chưa cập nhật",
      },
      {
        header: "Địa chỉ",
        key: "address",
        width: 40,
        render: (row) => row.address || "Chưa cập nhật",
      },
      {
        header: "Vai trò",
        key: "role",
        width: 18,
        render: (row) => (row.role === "employee" ? "Nhân viên" : ""),
      },
      {
        header: "Trạng thái",
        key: "is_active",
        width: 18,
        render: (row) => (row.is_active ? "Đang hoạt động" : "Vô hiệu hóa"),
      },
      {
        header: "Ngày tạo",
        key: "created_at",
        width: 20,
        render: (row) => {
          const date = new Date(row.created_at);
          return !isNaN(date.getTime()) ? format(date, "dd/MM/yyyy") : "Chưa cập nhật";
        },
      },
      {
        header: "Phép năm",
        key: "leave_balances",
        width: 20,
        render: (row) => {
          const annualLeave = row.leave_balances?.find(
            (lb) => lb.leave_type.id === 1,
          );
          return `${annualLeave?.remaining_days || 0} / ${annualLeave?.balance || 0}`;
        },
      },
    ],
    [],
  );

  const statCards = [
    {
      label: "Tổng nhân viên",
      value: stats.total,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/8",
      border: "border-primary/15",
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Vô hiệu hóa",
      value: stats.inactive,
      icon: UserX,
      color: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  ];

  const hasFilter = search.length > 0 || statusFilter !== "all";

  const resetFilters = async () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  const handleAdd = async (values: AddEmployeeValues) => {
    createEmployee(
      {
        ...values,
        role: "employee",
      },
      {
        onSuccess: () => setAddOpen(false),
      },
    );
  };

  const handleEdit = async (id: number, values: EditEmployeeValues) => {
    if (values.leave_balances && values.leave_balances.length > 0) {
      values.leave_balances.forEach((lb) => {
        if (lb.id) {
          updateLeaveBalance({
            id: lb.id,
            leave_type_id: lb.leave_type.id,
            balance: lb.balance,
            year: lb.year || new Date().getFullYear(),
            used_days: lb.used_days,
          });
        }
      });
    }

    updateEmployee(
      {
        id,
        ...values,
      },
      {
        onSuccess: () => setEditTarget(null),
      },
    );
  };

  const handleToggleActive = async () => {
    if (!confirmToggleTarget) return;
    toggleStatus(confirmToggleTarget.id, {
      onSuccess: () => setConfirmToggleTarget(null),
    });
  };

  const getAllData = async () => {
    const res = await getListEmployee({ per_page: 9999 });
    return res.data;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Quản lý nhân viên"
        description="Quản lý tài khoản và thông tin toàn bộ nhân viên"
        icon={Users}
        actions={
          <div className="flex items-center gap-2.5">
            <Can permission="employee.export">
              <ExportExcelButton
                columns={excelColumns}
                fileName={`Danh_Sach_Nhan_Vien_${new Date().toISOString().split("T")[0]}`}
                sheetName="DS Nhân viên"
                disabled={
                  isFetching || isInitialLoading || employees.length === 0
                }
                getCurrentData={() => employees}
                getAllData={getAllData}
              />
            </Can>

            <Can permission="employee.edit">
              {!isSelectionMode && (
                <Button
                  size="sm"
                  className="h-9 gap-2 text-xs"
                  onClick={() => setAddOpen(true)}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  Thêm nhân viên
                </Button>
              )}
            </Can>
          </div>
        }
      />

      <Can
        permission="employee.view"
        fallback={
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-primary/20">
            <Typography variant="h4" className="text-muted-foreground mb-2">
              Không có quyền truy cập
            </Typography>
            <Typography variant="small" className="text-muted-foreground/60">
              Bạn không có quyền xem danh sách nhân viên.
            </Typography>
          </div>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-xl border px-4 py-3.5 flex items-center gap-3 bg-white",
                s.border,
              )}
            >
              <div className={cn("rounded-lg p-2 shrink-0", s.bg)}>
                <s.icon size={15} className={s.color} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <Typography
                  variant="h4"
                  className={cn(
                    "text-xl font-bold leading-none mb-0.5",
                    s.color,
                  )}
                >
                  {s.value}
                </Typography>
                <Typography
                  variant="small"
                  className="text-[11px] leading-none truncate"
                >
                  {s.label}
                </Typography>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            {isFetching && debouncedSearch ? (
              <Loader2
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary animate-spin pointer-events-none"
              />
            ) : (
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            )}
            <Input
              placeholder="Tìm theo tên hoặc mã nhân viên..."
              className="pl-9 h-10 text-sm bg-white border-primary/20 rounded-xl focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Can permission="leave_balance.edit">
              {!isSelectionMode ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 gap-2 text-xs bg-white border-primary/20 text-primary hover:bg-primary/5 rounded-xl transition-all shadow-none px-4"
                  onClick={() => setIsSelectionMode(true)}
                >
                  <CalendarDays size={14} />
                  Khởi tạo nghỉ phép
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-10 gap-2 text-xs text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-600 transition-all rounded-xl px-4"
                  onClick={() => {
                    setIsSelectionMode(false);
                    setRowSelection({});
                  }}
                >
                  <X size={14} />
                  Hủy chọn
                </Button>
              )}
            </Can>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="h-10 w-fit min-w-[155px] whitespace-nowrap text-sm bg-white border-primary/20 rounded-xl transition-all px-4">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang làm việc</SelectItem>
                <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>

            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-10 px-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors gap-1.5 rounded-xl border border-dashed border-border/60 hover:border-rose-200"
              >
                <X size={14} />
                Xóa lọc
              </Button>
            )}

            {hasFilter && (
              <div className="hidden lg:block h-4 w-px bg-border/60 mx-1" />
            )}

            {hasFilter && !listQueryEmployee.isLoading && (
              <div className="text-[11px] font-medium text-muted-foreground bg-gray-100/50 px-2 py-1 rounded-md">
                <span className="text-foreground">{employees.length}</span> /{" "}
                {totalEmployees}
              </div>
            )}
          </div>
        </div>

        {isInitialLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <Typography variant="small" className="text-muted-foreground">
              Đang tải dữ liệu...
            </Typography>
          </div>
        ) : (
          <div
            className={cn(
              "transition-opacity duration-200",
              isFetching ? "opacity-60 pointer-events-none" : "opacity-100",
            )}
          >
            <EmployeeTable
              employees={employees}
              onEdit={(emp) => setEditTarget(emp)}
              onToggleActive={(emp) => setConfirmToggleTarget(emp)}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              isSelectionMode={isSelectionMode}
            />
            <TablePagination
              currentPage={page}
              totalPage={totalPage}
              totalItems={totalEmployees}
              perPage={perPage}
              onPageChange={setPage}
              onPerPageChange={(size) => {
                setPerPage(size);
                setPage(1);
              }}
            />
          </div>
        )}

        {isSelectionMode && (
          <BulkLeaveInitToolbar
            employees={employees}
            selectedEmployeeIds={Object.keys(rowSelection)
              .filter((key) => rowSelection[key])
              .map((key) => employees[parseInt(key)]?.id)
              .filter((id) => id !== undefined)}
            onClearSelection={() => {
              setRowSelection({});
              setIsSelectionMode(false);
            }}
          />
        )}
      </Can>

      <EmployeeDialog
        mode="add"
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
      />
      <EmployeeDialog
        mode="edit"
        employee={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSubmit={(values) => {
          if (editTarget) {
            handleEdit(editTarget.id, values);
          }
        }}
      />

      <ConfirmDialog
        open={!!confirmToggleTarget}
        onOpenChange={(open) => !open && setConfirmToggleTarget(null)}
        title={
          confirmToggleTarget?.is_active
            ? "Vô hiệu hóa nhân viên?"
            : "Kích hoạt nhân viên?"
        }
        description={
          confirmToggleTarget?.is_active
            ? `Bạn có chắc chắn muốn vô hiệu hóa nhân viên "${confirmToggleTarget?.name}"? Nhân viên này sẽ không thể đăng nhập vào hệ thống.`
            : `Hành động này sẽ kích hoạt lại tài khoản cho nhân viên "${confirmToggleTarget?.name}".`
        }
        variant={confirmToggleTarget?.is_active ? "danger" : "primary"}
        confirmText={
          confirmToggleTarget?.is_active ? "Vô hiệu hóa" : "Kích hoạt"
        }
        onConfirm={handleToggleActive}
        isLoading={isToggling}
      />

      <BulkLeaveInitToolbar
        employees={employees}
        selectedEmployeeIds={Object.keys(rowSelection)
          .filter((key) => rowSelection[key])
          .map((key) => employees[parseInt(key)]?.id)
          .filter((id) => id !== undefined)}
        onClearSelection={() => setRowSelection({})}
      />
    </div>
  );
}
