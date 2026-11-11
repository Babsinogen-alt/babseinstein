import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Shell, Stat, Now } from "@/components/shell";
import { buttonClass } from "@/components/button";
import { ReviewsChart } from "@/components/reviews-chart";
import { useDeskReady } from "@/components/use-desk";
import { dayKey, formatDay } from "@/lib/study/dates";
import { calibrationLine, dayCounts, securedToday } from "@/lib/study/insights";
import { isDueReview, isNew } from "@/lib/study/schedule";
import { useStudy } from "@/lib/study/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ready = useDeskReady();
  return (
    <Shell>
      {ready ? <Desk /> : <Waiting />}
    </Shell>
  );
}

function Waiting() {
  return (
    <>
      <PageHeader
        kicker="Study desk"
        title="Retrieval, then a gap. Not another reading."
        lede="Focus runs the methods with the strongest evidence: practice testing, spacing, and the supports around them. Your cards stay on this device."
      />
      <p className="text-sm text-muted">Opening today’s desk.</p>
    </>
  );
}

function Desk() {
  const today = dayKey();
  const cards = useStudy((s) => s.cards);
  const logs = useStudy((s) => s.logs);
  const subjects = useStudy((s) => s.subjects);
  const settings = useStudy((s) => s.settings);
  const setSettings = useStudy((s) => s.setSettings);
  const session = useStudy((s) => s.session);
  const lastSummary = useStudy((s) => s.lastSummary);
  const [detail, setDetail] = useState(false);

  const due = cards.filter((c) => isDueReview(c, today)).length;
  const fresh = cards.filter((c) => isNew(c)).length;
  const secured = securedToday(logs, today);
  const line = calibrationLine(logs.slice(-40));
  const chart = dayCounts(logs, today, 14);
  const open = session !== null;
  const showGuide = settings.guide !== false && !lastSummary;

  return (
    <>
      <PageHeader kicker={formatDay(today)} title={deskTitle(open, due, fresh)} />

      <div className="max-w-2xl">
        <Now>{nextLine(open, due, fresh)}</Now>
        {showGuide ? (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Write the answer, then show it, then grade it.{" "}
            <Link to="/guide" className="text-secure underline decoration-line underline-offset-4">
              First time here
            </Link>
            .{" "}
            <button
              type="button"
              className="min-h-11 text-secure underline decoration-line underline-offset-4"
              onClick={() => setSettings({ guide: false })}
            >
              Hide this
            </button>
          </p>
        ) : null}
      </div>

      <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2 md:gap-3">
        <button
          type="button"
          aria-expanded={detail}
          onClick={() => setDetail((openDetail) => !openDetail)}
          className="lift min-w-0 rounded-2xl bg-sheet px-3 py-3 text-left md:px-4"
        >
          <p className="truncate text-xs uppercase tracking-widest text-muted">Due</p>
          <p className="mt-1 font-serif text-3xl tabular-nums text-ink">{due}</p>
        </button>
        <Stat label="New" value={String(fresh)} />
        <Stat label="Secured" value={String(secured)} />
      </div>

      {detail ? (
        <section className="mt-4 max-w-2xl">
          <h2 className="sr-only">Fourteen days of retrieval</h2>
          <ReviewsChart data={chart} />
          {lastSummary ? (
            <p className="mt-3 text-sm leading-relaxed text-ink">
              Last session: {lastSummary.results.filter((r) => r.grade === "good" || r.grade === "easy").length}{" "}
              secured, {lastSummary.againIds.length} still missed.
            </p>
          ) : null}
          {line ? <p className="mt-2 text-sm leading-relaxed text-muted">{line}</p> : null}
        </section>
      ) : null}

      <div className="mt-6 flex max-w-2xl flex-col gap-2">
        {open && session ? (
          <Link to="/practice" search={{ mode: session.mode }} className={buttonClass("primary")}>
            Resume the open session
          </Link>
        ) : (
          <Link to="/practice" search={{ mode: "today" }} className={buttonClass("primary")}>
            Full session
          </Link>
        )}
        <Link to="/practice" search={{ mode: "burst" }} className={buttonClass("quiet")}>
          15-minute burst
        </Link>
        <p className="text-sm leading-relaxed text-muted">
          One technique only, not the mixed session, is under{" "}
          <Link to="/methods" className="text-secure underline decoration-line underline-offset-4">
            Methods
          </Link>
          .
        </p>
      </div>

      <section className="mt-8 max-w-2xl">
        <h2 className="font-serif text-xl text-ink">On the desk today</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {subjects.map((subject) => {
            const n = cards.filter((c) => c.subjectId === subject.id && isDueReview(c, today)).length;
            const neu = cards.filter((c) => c.subjectId === subject.id && isNew(c)).length;
            return (
              <li key={subject.id}>
                <Link
                  to="/library"
                  search={{ subject: subject.id }}
                  className="flex min-h-11 items-center justify-between gap-4 py-3"
                >
                  <p className="min-w-0 truncate text-sm font-medium text-ink">{subject.name}</p>
                  <p className="shrink-0 text-sm tabular-nums text-muted">
                    {n} due · {neu} new
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function deskTitle(open: boolean, due: number, fresh: number): string {
  if (open) return "A session is open.";
  if (due === 1) return "1 card is due.";
  if (due > 1) return `${due} cards are due.`;
  if (fresh > 0) return "Nothing is due.";
  return "What is due has waited long enough.";
}

function nextLine(open: boolean, due: number, fresh: number): string {
  if (open) return "A session is already open. Resume it. Do not start a second one beside it.";
  if (due > 0) {
    const label = due === 1 ? "1 card is" : `${due} cards are`;
    return `${label} due. Take the full session if you can sit. Take the burst if this is only a gap.`;
  }
  if (fresh > 0) return "Nothing is due. New cards can still be pretested in a burst. Otherwise leave them.";
  return "Nothing is due. Add your own cards in the library, or leave what you secured until its date.";
}
