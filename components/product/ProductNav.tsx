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
      <div className="hidden items-center gap-2 md:flex">
        {navItems.map((item) => (
          <Link
            className={cn(
              "rounded-md border border-border/70 bg-background/45 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/50 hover:bg-primary/10 hover:text-foreground",
              active === item.key &&
                "border-primary/60 bg-primary/15 text-foreground shadow-sm shadow-primary/10",
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
        {!isSignedIn ? (
          <Button asChild variant={active === "auth" ? "default" : "secondary"}>
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
    </nav>
  );
}
