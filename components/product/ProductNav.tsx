"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/product/ThemeToggle";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setIsSignedIn(Boolean(data.session));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-3 sm:px-6",
        maxWidth,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          className="flex min-w-0 items-center gap-2 text-foreground sm:gap-3"
          href="/"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/50 bg-primary/10 text-sm font-bold text-primary">
            EO
          </span>
          <span className="hidden truncate text-xl font-semibold tracking-normal sm:inline">
            Endgame OS
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavItem
              active={active === item.key}
              href={item.href}
              key={item.key}
              label={item.label}
            />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button
            variant="secondary"
            size="sm"
            onClick={onUpgrade}
            title="Upgrade to Pro"
          >
            <Crown />
            <span className="hidden sm:inline">Pro</span>
          </Button>
          {!isSignedIn ? (
            <Button
              asChild
              size="sm"
              variant={active === "auth" ? "default" : "secondary"}
            >
              <Link href="/auth">Sign in</Link>
            </Button>
          ) : null}
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
      </div>

      <nav className="mt-3 grid grid-cols-2 gap-2 md:hidden">
        {navItems.map((item) => (
          <NavItem
            active={active === item.key}
            href={item.href}
            key={item.key}
            label={item.label}
            mobile
          />
        ))}
      </nav>
    </div>
  );
}

function NavItem({
  active,
  href,
  label,
  mobile,
}: {
  active: boolean;
  href: string;
  label: string;
  mobile?: boolean;
}) {
  return (
    <Link
      className={cn(
        "rounded-md border border-border/70 bg-background/45 px-4 py-2 text-center text-sm font-semibold text-muted-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-foreground",
        active &&
          "border-primary/60 bg-primary/15 text-foreground shadow-sm shadow-primary/10",
        mobile && "px-3",
      )}
      href={href}
    >
      {label}
    </Link>
  );
}
