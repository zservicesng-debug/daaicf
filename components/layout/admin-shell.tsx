"use client";

import Link from "next/link";
import {
  ExternalLink,
  FolderKanban,
  HandCoins,
  HandHeart,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareMore,
  Settings,
  SquarePen,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutPortal } from "@/app/_actions/auth";
import { BrandMark } from "@/components/layout/brand-mark";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: SquarePen },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/applications", label: "Applications", icon: HandHeart },
  { href: "/admin/comments", label: "Comments", icon: MessageSquareMore },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/sponsors", label: "Sponsors", icon: HandCoins },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/chat", label: "Chat", icon: MessageSquareMore },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const logoutAction = logoutPortal.bind(null, "admin");

  const sidebar = (
    <aside className="flex h-full w-[280px] flex-col border-r border-white/10 bg-[linear-gradient(180deg,#0f4a20_0%,#0b3718_100%)] px-4 py-5 text-white">
      <div className="border-b border-white/10 px-2 pb-5">
        <BrandMark inverse />
        <div className="mt-4 rounded-[18px] border border-white/10 bg-white/10 px-4 py-3">
          <p className="text-sm font-semibold tracking-[0.02em]">Admin Portal</p>
          <p className="mt-1 text-xs text-white/70">
            Real-time operations, approvals, and publishing.
          </p>
        </div>
      </div>
      <nav className="mt-5 space-y-1.5">
        {adminNav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-[18px] px-4 text-sm font-medium transition",
                active
                  ? "bg-white !text-[var(--color-primary)] shadow-[0_14px_30px_rgba(8,22,10,0.18)]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
              onClick={() => setOpen(false)}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-[var(--color-primary)]" : "text-current"
                )}
              />
              <span
                className={cn(
                  active ? "text-[var(--color-primary)]" : "text-current"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2 pt-5">
        <Link
          href="/"
          className="mb-3 flex min-h-12 items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          Open Website
        </Link>
        <form action={logoutAction} data-submit-toast="off">
          <button
            type="submit"
            className="flex min-h-12 w-full items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-white px-4 py-3">
          <div>
            <p className="font-semibold text-[var(--color-text)]">DAAICF Admin</p>
            <p className="text-xs muted-copy">Management Portal</p>
          </div>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)]"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle admin menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <div className="fixed inset-0 z-40 flex bg-[rgba(8,22,10,0.4)]">
            <button
              type="button"
              className="flex-1"
              onClick={() => setOpen(false)}
              aria-label="Close admin menu"
            />
            {sidebar}
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <div className="hidden md:block">{sidebar}</div>
        <main className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top,rgba(26,92,42,0.06),transparent_48%),var(--color-bg)] p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
