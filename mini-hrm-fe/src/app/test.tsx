"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Briefcase,
  DollarSign,
  Settings,
  Search,
  Bell,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */
type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
};
type EmpStatus = "active" | "leave" | "remote";
type ReqStatus = "pending" | "approved" | "rejected";
type Employee = {
  id: number;
  name: string;
  dept: string;
  role: string;
  initials: string;
  status: EmpStatus;
  joinDate: string;
};
type Request = {
  id: number;
  name: string;
  initials: string;
  type: string;
  detail: string;
  status: ReqStatus;
};

/* ─── Static data ─── */
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Nhân viên", icon: Users, badge: 248 },
  { id: "leave", label: "Nghỉ phép", icon: CalendarDays, badge: 5 },
  { id: "attendance", label: "Chấm công", icon: Clock },
  { id: "recruitment", label: "Tuyển dụng", icon: Briefcase },
  { id: "payroll", label: "Lương thưởng", icon: DollarSign },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

const METRICS = [
  {
    label: "Tổng nhân viên",
    value: "248",
    sub: "+3 tháng này",
    progress: 80,
    trend: "up",
    accent: false,
  },
  {
    label: "Tỷ lệ có mặt",
    value: "96%",
    sub: "Hôm nay",
    progress: 96,
    trend: "up",
    accent: true,
  },
  {
    label: "Đang nghỉ phép",
    value: "12",
    sub: "5 chờ duyệt",
    progress: 20,
    trend: "down",
    accent: false,
  },
  {
    label: "Vị trí tuyển dụng",
    value: "7",
    sub: "3 phòng ban",
    progress: 35,
    trend: "up",
    accent: false,
  },
];

const EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: "Trần Hương",
    dept: "Kỹ thuật",
    role: "Senior Dev",
    initials: "TH",
    status: "active",
    joinDate: "01/03/2022",
  },
  {
    id: 2,
    name: "Lê Văn Bình",
    dept: "Marketing",
    role: "Manager",
    initials: "LB",
    status: "active",
    joinDate: "15/06/2021",
  },
  {
    id: 3,
    name: "Phạm Mai Anh",
    dept: "Kế toán",
    role: "Analyst",
    initials: "PM",
    status: "leave",
    joinDate: "20/09/2023",
  },
  {
    id: 4,
    name: "Ngô Thị Lan",
    dept: "Kinh doanh",
    role: "Executive",
    initials: "NL",
    status: "active",
    joinDate: "08/01/2022",
  },
  {
    id: 5,
    name: "Hoàng Minh Tuấn",
    dept: "Kỹ thuật",
    role: "Dev Lead",
    initials: "HT",
    status: "remote",
    joinDate: "12/04/2020",
  },
];

const REQUESTS: Request[] = [
  {
    id: 1,
    name: "Phạm Mai Anh",
    initials: "PM",
    type: "Nghỉ phép",
    detail: "3 ngày · 10–12/4",
    status: "pending",
  },
  {
    id: 2,
    name: "Hoàng Nam",
    initials: "HN",
    type: "Làm thêm giờ",
    detail: "8h · 09/4",
    status: "pending",
  },
  {
    id: 3,
    name: "Đinh Thị Thu",
    initials: "DT",
    type: "Nghỉ ốm",
    detail: "1 ngày · 08/4",
    status: "approved",
  },
  {
    id: 4,
    name: "Vũ Khánh",
    initials: "VK",
    type: "Đổi ca",
    detail: "14/4",
    status: "rejected",
  },
  {
    id: 5,
    name: "Bùi Linh",
    initials: "BL",
    type: "Nghỉ phép",
    detail: "5 ngày · 15–19/4",
    status: "pending",
  },
];

/* Avatar dùng màu semantic từ globals.css */
const AVATAR_SEED: Record<string, string> = {
  TH: "bg-primary-tint  text-primary",
  LB: "bg-success-bg    text-success",
  PM: "bg-warning-bg    text-warning",
  NL: "bg-primary-tint  text-primary",
  HT: "bg-primary-tint  text-primary",
  HN: "bg-primary-tint  text-primary",
  DT: "bg-success-bg    text-success",
  VK: "bg-danger-bg     text-danger",
  BL: "bg-primary-tint  text-primary",
};

/* ─── Badge trạng thái ─── */
function StatusBadge({ status }: { status: EmpStatus | ReqStatus }) {
  const cls: Record<string, string> = {
    active: "bg-success-bg  text-success border border-success-bd",
    leave: "bg-warning-bg  text-warning border border-warning-bd",
    remote: "bg-primary-tint text-primary border border-primary-border",
    pending: "bg-warning-bg  text-warning border border-warning-bd",
    approved: "bg-success-bg  text-success border border-success-bd",
    rejected: "bg-danger-bg   text-danger  border border-danger-bd",
  };
  const lbl: Record<string, string> = {
    active: "Đang làm",
    leave: "Nghỉ phép",
    remote: "Remote",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
  };
  return (
    <span
      className={cn(
        "text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap",
        cls[status],
      )}
    >
      {lbl[status]}
    </span>
  );
}

/* ─── Progress bar ─── */
function ProgressBar({ value, accent }: { value: number; accent?: boolean }) {
  return (
    <div
      className={cn(
        "h-1 w-full rounded-full",
        accent ? "bg-white/20" : "bg-subtle",
      )}
    >
      <div
        className={cn(
          "h-full rounded-full",
          accent ? "bg-white/80" : "bg-primary",
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* ─── Main page ─── */
export default function Test() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [search, setSearch] = useState("");

  const pageTitle =
    NAV_ITEMS.find((n) => n.id === activeNav)?.label ?? "Dashboard";

  const filtered = EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.dept.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-page text-base">
      {/* ── Sidebar ── */}
      <aside className="w-[220px] flex-shrink-0 bg-primary flex flex-col px-3 py-5 gap-0.5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2.5 pb-5">
          <div className="w-8 h-8 rounded-lg bg-white/95 flex items-center justify-center text-primary text-xs font-semibold">
            HR
          </div>
          <span className="text-white text-sm font-semibold tracking-tight">
            HRM Pro
          </span>
        </div>

        {/* Nav items */}
        <p className="text-[10px] uppercase tracking-widest text-white/30 px-2.5 pb-1">
          Menu
        </p>
        {NAV_ITEMS.slice(0, 6).map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] w-full text-left transition-colors",
                isActive
                  ? "bg-white text-primary font-medium"
                  : "text-white/55 hover:bg-white/[0.08] hover:text-white/85",
              )}
            >
              <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 rounded-full",
                    isActive
                      ? "bg-primary-tint text-primary"
                      : "bg-white/20 text-white/80",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <p className="text-[10px] uppercase tracking-widest text-white/30 px-2.5 pt-4 pb-1">
          Hệ thống
        </p>
        {NAV_ITEMS.slice(6).map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg text-[13px] w-full text-left transition-colors",
                isActive
                  ? "bg-white text-primary font-medium"
                  : "text-white/55 hover:bg-white/[0.08] hover:text-white/85",
              )}
            >
              <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="flex-1" />

        {/* User info */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.07] cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">
              NM
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-white/90 font-medium leading-none mb-0.5">
                Nguyễn Minh
              </p>
              <p className="text-[11px] text-white/40 leading-none">
                HR Manager
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Topbar ── */}
        <header className="bg-surface border-b border-line h-14 flex items-center px-6 gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[15px] font-semibold">{pageTitle}</h1>
            <span className="text-subtle-text text-xs hidden sm:block">
              / Tổng quan
            </span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-[280px] ml-2">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle-text pointer-events-none"
            />
            <Input
              placeholder="Tìm nhân viên, phòng ban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-[13px] bg-page border-line focus-visible:ring-primary/20 focus-visible:border-primary-border placeholder:text-subtle-text"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Bell */}
            <button className="relative w-8 h-8 rounded-lg border border-line bg-surface hover:bg-page flex items-center justify-center transition-colors">
              <Bell size={15} className="text-muted" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full border-2 border-surface" />
            </button>

            {/* Avatar */}
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="bg-primary-tint text-primary text-[11px] font-semibold">
                NM
              </AvatarFallback>
            </Avatar>

            <Button
              size="sm"
              className="h-8 bg-primary hover:bg-primary-hover text-primary-fg text-[13px] gap-1.5 px-3"
            >
              <Plus size={13} />
              Thêm nhân viên
            </Button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-3">
            {METRICS.map((m) => (
              <Card
                key={m.label}
                className={cn(
                  "rounded-xl shadow-none",
                  m.accent
                    ? "bg-primary border-primary"
                    : "bg-surface border-line",
                )}
              >
                <CardContent className="p-4">
                  <p
                    className={cn(
                      "text-[11.5px] mb-2",
                      m.accent ? "text-white/60" : "text-muted",
                    )}
                  >
                    {m.label}
                  </p>
                  <p
                    className={cn(
                      "text-[26px] font-semibold leading-none mb-2.5 tracking-tight",
                      m.accent ? "text-white" : "text-base",
                    )}
                  >
                    {m.value}
                  </p>
                  <ProgressBar value={m.progress} accent={m.accent} />
                  <div className="flex items-center gap-1 mt-2">
                    {m.trend === "up" ? (
                      <TrendingUp
                        size={11}
                        className={m.accent ? "text-white/50" : "text-success"}
                      />
                    ) : (
                      <TrendingDown
                        size={11}
                        className={m.accent ? "text-white/50" : "text-danger"}
                      />
                    )}
                    <p
                      className={cn(
                        "text-[11px]",
                        m.accent ? "text-white/45" : "text-subtle-text",
                      )}
                    >
                      {m.sub}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Two-column tables */}
          <div className="grid grid-cols-2 gap-4">
            {/* Employee list */}
            <Card className="rounded-xl shadow-sm bg-surface">
              <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[13px] font-semibold">
                  Nhân viênnn
                </CardTitle>
                <button className="text-[12px] text-primary hover:underline flex items-center gap-0.5">
                  Xem tất cả <ChevronRight size={12} />
                </button>
              </CardHeader>
              <Separator className="bg-line" />
              <CardContent className="p-0">
                {filtered.length === 0 && (
                  <p className="text-center text-subtle-text text-[13px] py-8">
                    Không tìm thấy
                  </p>
                )}
                {filtered.map((emp, i) => (
                  <div
                    key={emp.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 hover:bg-page transition-colors cursor-pointer",
                      i < filtered.length - 1 && "border-b border-line-subtle",
                    )}
                  >
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-[11px] font-semibold",
                          AVATAR_SEED[emp.initials],
                        )}
                      >
                        {emp.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium leading-none mb-0.5 truncate">
                        {emp.name}
                      </p>
                      <p className="text-[11.5px] text-muted leading-none truncate">
                        {emp.dept} · {emp.role}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={emp.status} />
                      <span className="text-[10.5px] text-subtle-text">
                        {emp.joinDate}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Request list */}
            <Card className="rounded-xl shadow-none bg-surface border-line">
              <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[13px] font-semibold">
                  Yêu cầu chờ duyệt
                </CardTitle>
                <button className="text-[12px] text-primary hover:underline flex items-center gap-0.5">
                  Xem tất cả <ChevronRight size={12} />
                </button>
              </CardHeader>
              <Separator className="bg-line" />
              <CardContent className="p-0">
                {REQUESTS.map((req, i) => (
                  <div
                    key={req.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 hover:bg-page transition-colors cursor-pointer",
                      i < REQUESTS.length - 1 && "border-b border-line-subtle",
                    )}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-[10px] font-semibold",
                          AVATAR_SEED[req.initials],
                        )}
                      >
                        {req.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium leading-none mb-0.5 truncate">
                        {req.name}
                      </p>
                      <p className="text-[11.5px] text-muted leading-none">
                        {req.type} · {req.detail}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
