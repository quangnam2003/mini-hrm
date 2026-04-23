"use client";

import { PageHeader } from "@/components/common/layout/page-header";
import { Typography } from "@/components/ui/typography";
import { EmployeeActions } from "@/features/attendance/components/employee-actions";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { LeaveDetailDialog } from "../components/LeaveDetailDialog";
import { LeaveHistoryTable } from "../components/LeaveHistoryTable";
import { useLeave } from "../hooks/use-leave";
import { LeaveRequest } from "../types";

export default function EmployeeLeavePage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );

  const handleCreateSuccess = () => {};

  const { historyQuery } = useLeave({
    page: currentPage,
    per_page: perPage,
  });

  const { data, isLoading } = historyQuery;

  const handleViewDetail = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden animate-in fade-in duration-500">
      <PageHeader
        icon={CalendarDays}
        title="Lịch sử xin nghỉ"
        description="Theo dõi trạng thái và lịch sử các yêu cầu nghỉ phép cá nhân"
        actions={
          <EmployeeActions onLeaveRequestSuccess={handleCreateSuccess} />
        }
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"></div>

      <div className="space-y-4">
        <Typography variant="h3" className="text-lg font-bold">
          Lịch sử nghỉ phép
        </Typography>

        {isLoading ? (
          <div className="h-[400px] w-full bg-slate-50/50 border border-black/10 rounded-xl animate-pulse" />
        ) : (
          <LeaveHistoryTable
            data={data?.data || []}
            pagination={{
              currentPage: data?.current_page || 1,
              totalPage: data?.last_page || 1,
              totalItems: data?.total || 0,
              perPage: perPage,
            }}
            onPageChange={setCurrentPage}
            onPerPageChange={setPerPage}
            onViewDetail={handleViewDetail}
          />
        )}
      </div>

      <LeaveDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        request={selectedRequest}
        onCancelSuccess={() => {}}
      />
    </div>
  );
}
