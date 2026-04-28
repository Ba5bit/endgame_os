"use client";

import { useState } from "react";

import { ProductNav } from "@/components/product/ProductNav";
import { ProUpgradeModal } from "@/components/product/ProUpgradeModal";

type AppHeaderProps = {
  active?: "home" | "trainer" | "leaderboard" | "auth" | "profile";
  maxWidth?: string;
};

export function AppHeader({ active, maxWidth }: AppHeaderProps) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <header className="border-b border-border/70 bg-background/55 backdrop-blur-xl">
      <ProductNav
        active={active}
        maxWidth={maxWidth}
        onUpgrade={() => setUpgradeOpen(true)}
      />
      <ProUpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </header>
  );
}
