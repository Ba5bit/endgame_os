"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Crown,
  MapPin,
  ShieldCheck,
  Swords,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  LockedProFeature,
  PRO_FEATURES,
  ProUpgradeModal,
} from "@/components/product/ProUpgradeModal";
import { ProductNav } from "@/components/product/ProductNav";

const metrics = [
  { label: "Step 1", value: "Play a game" },
  { label: "Step 2", value: "Analyze mistakes" },
  { label: "Step 3", value: "Save progress" },
];

const proDescriptions = [
  "Run deeper engine analysis without prototype caps.",
  "Switch between serious board themes for longer sessions.",
  "Turn repeated mistakes into a focused training plan.",
  "Prepare practical lines before your next rated game.",
];

export function LandingPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  return (
    <>
      <ProductNav onUpgrade={() => setUpgradeOpen(true)} />
      <main className="overflow-hidden px-4 pb-12 sm:px-6">
        <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 py-8 lg:grid-cols-[1fr_0.92fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/55 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Play, review, improve
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
              Endgame OS
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Endgame OS is a chess training app where you play against
              Stockfish, review your mistakes after the game, and track your
              progress on your profile and city leaderboard.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11">
                <Link href="/play">
                  Play Now
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="h-11"
                onClick={() => setUpgradeOpen(true)}
              >
                <Crown />
                Upgrade to Pro
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div className="glass-panel rounded-lg p-4" key={metric.label}>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ProductMockup />
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-4 py-10 md:grid-cols-3">
          <FeatureCard
            icon={<BrainCircuit />}
            title="AI Coach Review"
            text="After the game, click Analyze Game to see your biggest mistakes and better moves."
          />
          <FeatureCard
            icon={<Swords />}
            title="Live Stockfish Opponent"
            text="You play White. Pick Casual, Focused, or Brutal and the AI replies as Black."
          />
          <FeatureCard
            icon={<MapPin />}
            title="City Leaderboards"
            text="Create a profile, save finished games, and compare results with players from your city."
          />
        </section>

        <section className="mx-auto w-full max-w-6xl py-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Coming Later
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-foreground">
                Pro tools are previewed, not required
              </h2>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              You can use the core app now. Pro buttons only explain future
              features; they do not charge money.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {PRO_FEATURES.map((feature, index) => (
              <LockedProFeature
                key={feature}
                title={feature}
                description={proDescriptions[index]}
                onUpgrade={() => setUpgradeOpen(true)}
              />
            ))}
          </div>
        </section>
      </main>
      <ProUpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}

function ProductMockup() {
  const squares = Array.from({ length: 64 }, (_, index) => index);

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Example Session
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            King and rook conversion
          </p>
        </div>
        <div className="rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          92%
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_12rem]">
        <div className="grid aspect-square grid-cols-8 overflow-hidden rounded-md border border-border/80">
          {squares.map((square) => (
            <div
              className={
                (Math.floor(square / 8) + square) % 2 === 0
                  ? "bg-[#d9cda8]"
                  : "bg-[#31443e]"
              }
              key={square}
            />
          ))}
        </div>
        <div className="space-y-3">
          <CoachLine label="Best" text="Keep the king boxed." />
          <CoachLine label="Mistake" text="Check before drifting." />
          <CoachLine label="Weakness" text="Forcing moves." />
        </div>
      </div>
    </div>
  );
}

function CoachLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/55 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{text}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="mb-4 flex size-10 items-center justify-center rounded-md border border-border/70 bg-background/60 text-primary [&_svg]:size-5">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
        <CheckCircle2 className="size-4" />
        Prototype ready
      </div>
    </div>
  );
}
