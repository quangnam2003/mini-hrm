"use client";
import { ChevronDown, CircleUser, LogOut, Menu, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSidebar } from "./ui/sidebar";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Typography } from "./ui/typography";
import { useLogout } from "@/features/auth/hooks/use-logout";
import Link from "next/link";

export default function Header() {
  const { toggleSidebar } = useSidebar();

  const { user } = useAuth();
  const role = user?.role;

  const { mutate: handleSignOut } = useLogout();

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-line h-14 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-40 transition-all shadow-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-9 w-9 p-0 md:border-line md:bg-page rounded-md hover:bg-subtle!"
      >
        <Menu size={18} />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity pl-1 ml-1 outline-none">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || ""} />
              <AvatarFallback className="bg-primary-tint text-primary text-[11px] font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:block text-left">
              <Typography
                variant="p"
                className="text-xs font-semibold text-base leading-none"
              >
                {user?.name || "Loading..."}
              </Typography>
              <Typography
                variant="small"
                className="text-[10px] text-muted mt-1 leading-none block capitalize"
              >
                {role}
              </Typography>
            </div>
            <ChevronDown
              size={13}
              className="text-muted hidden md:block ml-1"
            />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[200px] rounded-xl bg-surface !ring-0 border border-subtle shadow-xl p-2 mt-2"
        >
          <div className="px-3 py-2.5 mb-1">
            <Typography variant="p" className="text-sm font-medium text-base">
              {user?.name || "Loading..."}
            </Typography>
            <Typography
              variant="small"
              className="text-xs text-muted block mt-1"
            >
              {user?.email || "loading@..."}
            </Typography>
          </div>
          <DropdownMenuSeparator className="bg-line" />
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm! text-muted! focus:bg-page focus:text-base!"
            >
              <CircleUser size={15} /> Edit profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm text-muted focus:bg-page focus:text-base">
            <Settings size={15} /> Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-line my-1" />
          <DropdownMenuItem
            onSelect={() => handleSignOut()}
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm text-danger hover:text-danger focus:bg-danger-bg focus:text-danger"
          >
            <LogOut size={15} /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
