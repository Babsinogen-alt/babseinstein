import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/button";
import { Button } from "@/components/button";
import { ReviewsChart } from "@/components/reviews-chart";
import { PageHeader, Shell } from "@/components/shell";
import { useDeskReady } from "@/components/use-desk";
import { addDays, dayKey, formatDay, weekdayNarrow } from "@/lib/study/dates";
import { dayCounts } from "@/lib/study/insights";
import { isNew } from "@/lib/study/schedule";
import { useStudy } from "@/lib/study/store";
import type { DayPlan } from "@/lib/study/types";

export const Route = createFileRoute("/plan")({ component: PlanPage });

const EMPTY: DayPlan = { cue: "", action: "", place: "", minutes: 20 };

const field =
  "w-full rounded-xl border border-line bg-paper px-3 py-3 text-sm text-ink outline-none focus:border-ink";

function PlanPage() {
  const ready = useDeskReady();
  return (
    <Shell>
      <PageHeader
        kicker="Plan"
        title="A sentence that starts you. A gap that keeps it."
        lede="Implementation intentions help you begin. Spacing is what makes the hour stay. Neither one is a reason to pull tomorrow’s cards into tonight."
      />
      {ready ? <PlanBody /> : <p className="text-sm text-muted">Opening the week.</p>}
    </Shell>
  );
}

function PlanBody() {
  const today = dayKey();
  const days = [0, 1, 2, 3, 4, 5, 6].map((offset) => addDays(today, offset));
  const [selected, setSelected] = useState(today);
  const plans = useStudy((s) => s.plans);
  const setPlan = useStudy((s) => s.setPlan);
  const cards = useStudy((s) => s.cards);
  const logs = useStudy((s) => s.logs);
  const settings = useStudy((s) => s.settings);
  const setSettings = useStudy((s) => s.setSettings);
  const plan = plans[selected] ?? EMPTY;
  const loads = days.map((day) => ({
    day,
    n: cards.filter((c) => !isNew(c) && c.due === day).length,
  }));
  const heaviest = loads.reduce((a, b) => (b.n > a.n ? b : a), loads[0]);

  return (
    <div className="max-w-2xl">
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const load = loads.find((l) => l.day === day)?.n ?? 0;
          const active = day === selected;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelected(day)}
              className={`flex min-h-16 flex-col items-center justify-center rounded-2xl px-1 text-center ${
                active ? "bg-ink text-sheet" : "bg-sheet text-ink ring-1 ring-line"
              }`}
            >
              <span className="text-xs uppercase">{weekdayNarrow(day)}</span>
              <span className="font-serif text-lg tabular-nums">{day.slice(-2)}</span>
              <span className={`text-xs tabular-nums ${active ? "text-sheet" : "text-muted"}`}>{load}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">The small number is reviews already dated for that day. New cards are not in it.</p>
      {heaviest && heaviest.n >= 12 ? (
        <p className="mt-4 text-sm leading-relaxed text-ink">
          {formatDay(heaviest.day)} is carrying {heaviest.n} reviews. That is a massed pile. Do a short burst of what is
          actually due today and leave the rest on their dates.
        </p>
      ) : null}

      <section className="lift mt-8 rounded-2xl bg-sheet p-5">
        <h2 className="font-serif text-2xl text-ink">{formatDay(selected)}</h2>
        <p className="mt-3 font-serif text-lg leading-snug text-ink">{sentence(plan)}</p>
        <div className="mt-4 grid gap-3">
          <label className="text-sm text-ink">
            When
            <input
              className={`${field} mt-1`}
              value={plan.cue}
              placeholder="I close the clinic list"
              onChange={(e) => setPlan(selected, { cue: e.target.value })}
            />
          </label>
          <label className="text-sm text-ink">
            I will
            <input
              className={`${field} mt-1`}
              value={plan.action}
              placeholder="start the due session"
              onChange={(e) => setPlan(selected, { action: e.target.value })}
            />
          </label>
          <label className="text-sm text-ink">
            At
            <input
              className={`${field} mt-1`}
              value={plan.place}
              placeholder="the desk by the window"
              onChange={(e) => setPlan(selected, { place: e.target.value })}
            />
          </label>
          <div>
            <p className="text-sm text-ink">For</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {[15, 25, 50].map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setPlan(selected, { minutes })}
                  className={`min-h-11 rounded-full px-4 text-sm ${
                    plan.minutes === minutes ? "bg-ink text-sheet" : "bg-paper text-ink ring-1 ring-line"
                  }`}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>
        </div>
        <Link to="/practice" search={{ mode: "today" }} className={`${buttonClass("primary")} mt-5`}>
          Start today’s session
        </Link>
      </section>

      <FocusTimer />

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-ink">How many new cards a day</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          New cards enter as pretests: you guess before you study them. A small number keeps the session from becoming
          a lecture.
        </p>
        <div className="mt-3 flex gap-2">
          {[3, 5, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSettings({ newPerDay: n })}
              className={`min-h-11 rounded-full px-4 text-sm ${
                settings.newPerDay === n ? "bg-ink text-sheet" : "bg-sheet text-ink ring-1 ring-line"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <label className="mt-5 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-sheet px-4 py-3 ring-1 ring-line">
          <span className="text-sm text-ink">Say each answer once</span>
          <button
            type="button"
            role="switch"
            aria-checked={settings.aloud}
            onClick={() => setSettings({ aloud: !settings.aloud })}
            className={`relative h-7 w-12 shrink-0 rounded-full ${settings.aloud ? "bg-ink" : "bg-line"}`}
          >
            <span
              className={`absolute top-0.5 size-6 rounded-full bg-sheet ${settings.aloud ? "translate-x-5" : "translate-x-0.5"}`}
            />
            <span className="sr-only">Say answers aloud</span>
          </button>
        </label>
        <p className="mt-2 text-sm text-muted">
          Saying it is the production effect. Modest. Turn it off in a quiet room. It does not replace meaning.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-ink">Retrievals, last fourteen days</h2>
        <div className="mt-4">
          <ReviewsChart data={dayCounts(logs, today, 14)} />
        </div>
        <p className="mt-6 text-sm leading-relaxed text-muted">
          Sleep after a session does more for the traces than another pass tonight. Cards you secured are already
          dated. Leave them.
        </p>
      </section>
    </div>
  );
}

function sentence(plan: DayPlan): string {
  const cue = plan.cue?.trim() || "I have a free window";
  const action = plan.action?.trim() || "start the due session";
  const place = plan.place?.trim() || "this desk";
  const minutes = plan.minutes || 20;
  return `When ${cue}, I will ${action} at ${place} for ${minutes} minutes.`;
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function FocusTimer() {
  const focus = useStudy((s) => s.focus);
  const startFocus = useStudy((s) => s.startFocus);
  const clearFocus = useStudy((s) => s.clearFocus);
  const finishFocusIfDue = useStudy((s) => s.finishFocusIfDue);
  const [now, setNow] = useState<number | null>(null);
  const [done, setDone] = useState<null | { phase: "focus" | "break"; minutes: number }>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!focus || now === null || now < focus.endsAt || done) return;
    const finished = focus;
    if (finished.phase === "focus") finishFocusIfDue();
    else clearFocus();
    setDone({ phase: finished.phase, minutes: finished.minutes });
  }, [focus, now, done, finishFocusIfDue, clearFocus]);

  const remaining = focus && now !== null ? focus.endsAt - now : null;

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-ink">A protected block</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Uninterrupted attention, then a real break, beats switching. Fifteen, twenty-five, and fifty minutes are
        conventions. Pick from the work in front of you. None of them is a proven optimum.
      </p>
      {done ? (
        <div className="lift mt-4 rounded-2xl bg-sheet p-5">
          <p className="font-serif text-2xl text-ink">
            {done.phase === "focus" ? "Block finished." : "Break finished."}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {done.phase === "focus"
              ? "Stand up and look at something distant. Then either break or go back to the cards."
              : "The break is over. Start a session only if you still have one in you."}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {done.phase === "focus" ? (
              <Button
                onClick={() => {
                  setDone(null);
                  startFocus(5, "break");
                }}
              >
                5-minute break
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                setDone(null);
                clearFocus();
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      ) : focus ? (
        <div className="lift mt-4 rounded-2xl bg-sheet p-5">
          <p className="text-xs uppercase tracking-widest text-muted">
            {focus.phase === "focus" ? "Focus" : "Break"}
          </p>
          <p className="mt-2 font-serif text-5xl tabular-nums text-ink">
            {remaining === null ? "—" : formatRemaining(remaining)}
          </p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              clearFocus();
              setDone(null);
            }}
          >
            Stop
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {[15, 25, 50].map((minutes) => (
            <Button key={minutes} variant="quiet" onClick={() => startFocus(minutes, "focus")}>
              {minutes} min
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
