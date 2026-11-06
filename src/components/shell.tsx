import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarRange, Library, ScrollText, SunMedium } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useDeskReady } from "@/components/use-desk";

const LINKS = [
  { to: "/", label: "Today", icon: SunMedium },
  { to: "/library", label: "Library", icon: Library },
  { to: "/plan", label: "Plan", icon: CalendarRange },
  { to: "/methods", label: "Methods", icon: ScrollText },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const ready = useDeskReady();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-paper text-ink md:grid md:grid-cols-[15rem_1fr]">
      <aside className="hidden border-r border-line md:flex md:flex-col md:px-5 md:py-8">
        <Wordmark />
        <nav className="mt-10 flex flex-col gap-1" aria-label="Sections">
          {LINKS.map((item) => (
            <RailLink key={item.to} {...item} active={isActive(path, item.to)} />
          ))}
        </nav>
        <p className="mt-auto pt-8 text-sm leading-relaxed text-muted">
          Saved on this device. Retrieval, spaced — not a second reading.
        </p>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between px-4 pt-4 md:hidden">
          <Wordmark />
          <p className="text-xs uppercase tracking-widest text-muted">{ready ? "On this device" : "Opening"}</p>
        </header>
        <main className="px-4 pt-6 pb-28 md:px-10 md:pt-10 md:pb-16">{children}</main>
      </div>
      <nav
        className="dock fixed inset-x-0 bottom-0 z-20 border-t border-line bg-sheet/95 backdrop-blur-sm md:hidden"
        aria-label="Sections"
      >
        <ul className="grid grid-cols-4">
          {LINKS.map((item) => {
            const active = isActive(path, item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                    active ? "text-accent-ink" : "text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function Wordmark() {
  return (
    <Link to="/" className="inline-flex items-baseline gap-2">
      <span className="font-serif text-2xl tracking-tight text-ink">Babseinstein</span>
      <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
    </Link>
  );
}

function RailLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: "/" | "/library" | "/plan" | "/methods";
  label: string;
  icon: typeof SunMedium;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-full px-3 text-sm",
        active ? "bg-ink text-sheet" : "text-ink hover:bg-sheet",
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </Link>
  );
}

function isActive(path: string, to: string): boolean {
  if (to === "/") return path === "/";
  return path === to || path.startsWith(`${to}/`);
}

export function Now({ children }: { children: ReactNode }) {
  return (
    <p className="max-w-2xl rounded-2xl bg-sheet px-4 py-3 text-sm leading-relaxed text-ink ring-1 ring-line">
      <span className="font-medium text-secure">Now. </span>
      {children}
    </p>
  );
}

export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mb-8 max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-widest text-secure">{kicker}</p>
      <h1 className="mt-2 font-serif text-3xl leading-tight text-ink md:text-4xl">{title}</h1>
      {lede ? <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{lede}</p> : null}
    </header>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="lift min-w-0 rounded-2xl bg-sheet px-3 py-3 md:px-4">
      <p className="truncate text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl tabular-nums text-ink">{value}</p>
    </div>
  );
}
