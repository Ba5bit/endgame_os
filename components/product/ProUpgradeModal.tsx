"use client";

import { Lock, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export const PRO_FEATURES = [
  "Unlimited deep reviews",
  "Custom board skins",
  "Advanced weakness report",
  "Opening preparation mode",
];

type ProUpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProUpgradeModal({ open, onOpenChange }: ProUpgradeModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-lg p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Endgame OS Pro
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Train like every move is reviewable.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pro is a prototype preview. Payments are not connected yet, but
              this is the direction for deeper training tools.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close upgrade modal"
          >
            <X />
          </Button>
        </div>

        <div className="space-y-2">
          {PRO_FEATURES.map((feature) => (
            <div
              className="flex items-center gap-3 rounded-md border border-border/70 bg-background/50 px-3 py-3"
              key={feature}
            >
              <Lock className="size-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <Button className="mt-5 w-full" onClick={() => onOpenChange(false)}>
          <Sparkles />
          Upgrade to Pro
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Prototype only. No Stripe checkout is connected.
        </p>
      </div>
    </div>
  );
}

export function LockedProFeature({
  title,
  description,
  onUpgrade,
}: {
  title: string;
  description: string;
  onUpgrade: () => void;
}) {
  return (
    <button
      className="group rounded-lg border border-border/70 bg-card/60 p-4 text-left transition hover:border-primary/60 hover:bg-primary/10"
      onClick={onUpgrade}
      type="button"
    >
      <div className="mb-3 flex size-9 items-center justify-center rounded-md border border-border/70 bg-background/60 text-primary">
        <Lock className="size-4" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Locked Pro
      </p>
    </button>
  );
}
