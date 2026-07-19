"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useEffectEvent, useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/activities", label: "Activities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNavbar({
  helpApplicationsEnabled = true,
}: {
  helpApplicationsEnabled?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const syncScrolledState = useEffectEvent(() => {
    setScrolled(window.scrollY > 12);
  });

  useEffect(() => {
    const onScroll = () => syncScrolledState();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b text-white transition-all duration-300",
        scrolled || open
          ? "border-white/10 bg-[rgba(18,61,28,0.88)] shadow-[0_18px_40px_rgba(8,22,10,0.18)] backdrop-blur-xl"
          : "border-transparent bg-[rgba(18,61,28,0.68)] backdrop-blur-md"
      )}
    >
      <div className="site-container flex min-h-20 items-center justify-between gap-6">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <BrandMark
            compact={
              pathname.startsWith("/admin") ||
              pathname.startsWith("/sponsor") ||
              pathname.startsWith("/partner")
            }
            inverse
          />
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium text-white/88 hover:text-white",
                  active && "bg-[rgba(255,255,255,0.16)] text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "hidden md:flex items-center",
            helpApplicationsEnabled
              ? "gap-5"
              : "gap-3 rounded-[var(--radius-pill)] border border-white/12 bg-white/8 p-1.5"
          )}
        >
          {helpApplicationsEnabled ? (
            <>
              <Link
                href="/apply/sponsor"
                className="text-sm font-medium text-white/82 hover:text-white"
              >
                Sponsor
              </Link>
              <Link
                href="/apply/partner"
                className="text-sm font-medium text-white/82 hover:text-white"
              >
                Partner
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/apply/sponsor"
                className={cn(
                  buttonClasses({ variant: "primary" }),
                  "px-4 py-2.5 shadow-[0_10px_24px_rgba(75,12,12,0.22)]"
                )}
              >
                Sponsor
              </Link>
              <Link
                href="/apply/partner"
                className={cn(
                  buttonClasses({ variant: "outline" }),
                  "px-4 py-2.5"
                )}
              >
                Partner
              </Link>
            </>
          )}
          {helpApplicationsEnabled ? (
            <Link href="/apply" className={buttonClasses({ variant: "outline" })}>
              Apply for Help
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[rgba(18,61,28,0.96)] md:hidden">
          <div className="site-container flex flex-col gap-3 py-4">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-[var(--radius-card)] px-4 py-3 text-base font-medium text-white/90",
                    active && "bg-[rgba(255,255,255,0.2)] text-white"
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-2 grid gap-3">
              <Link
                href="/apply/sponsor"
                className={cn(
                  buttonClasses({ variant: "surface", fullWidth: true }),
                  "border-white/15 bg-white/8 text-white hover:bg-white/12"
                )}
                onClick={() => setOpen(false)}
              >
                Become a Sponsor
              </Link>
              <Link
                href="/apply/partner"
                className={cn(
                  buttonClasses({ variant: "surface", fullWidth: true }),
                  "border-white/15 bg-white/8 text-white hover:bg-white/12"
                )}
                onClick={() => setOpen(false)}
              >
                Partner with Us
              </Link>
              {helpApplicationsEnabled ? (
                <Link
                  href="/apply"
                  className={cn(buttonClasses({ variant: "outline", fullWidth: true }))}
                  onClick={() => setOpen(false)}
                >
                  Apply for Help
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
