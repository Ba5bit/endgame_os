"use client";

import Link from "next/link";
import { Crown, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/product/ThemeToggle";
import { cn } from "@/lib/utils";

type ProductNavProps = {
  onUpgrade: () => void;
  active?: "home" | "trainer" | "leaderboard" | "auth" | "profile";
  maxWidth?: string;
};

const navItems = [
  { label: "Trainer", href: "/play", key: "trainer" },
  { label: "Leaderboard", href: "/leaderboard", key: "leaderboard" },
] as const;

export function ProductNav({
  onUpgrade,
  active = "home",
  maxWidth = "max-w-6xl",
}: ProductNavProps) {
  return (
    <nav
      className={cn(
        "mx-auto flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-6",
        maxWidth,
      )}
    >
      <Link className="flex items-center gap-3 text-foreground" href="/">
        <span className="flex size-9 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-sm font-bold text-primary">
          EO
        </span>
        <span className="text-xl font-semibold tracking-normal">Endgame OS</span>
      </Link>
      <div className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
        {navItems.map((item) => (
          <Link
            className={cn(
              "hover:text-foreground",
              active === item.key && "font-medium text-foreground",
            )}
            href={item.href}
            key={item.key}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="secondary" onClick={onUpgrade}>
          <Crown />
          Pro
        </Button>
        <Button asChild variant={active === "auth" ? "default" : "secondary"}>
          <Link href="/auth">Sign in</Link>
        </Button>
        <Button asChild variant="secondary" size="icon">
          <Link
            className={cn(active === "profile" && "text-primary")}
            href="/profile"
            aria-label="Open profile"
            title="Open profile"
          >
            <UserCircle />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
