import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Shell } from "@/components/shell";
import { buttonClass } from "@/components/button";
import { METHODS, WEAK, type MethodGrade } from "@/lib/study/methods";

export const Route = createFileRoute("/methods")({ component: MethodsPage });

function MethodsPage() {
  return (
    <Shell>
      <PageHeader
        kicker="Evidence"
        title="What is worth your hour, and what only feels like study."
        lede="Pick the job in front of you. High utility works across ages and materials. Supportive findings are real and narrower. A full sitting, a burst, and the week are on Today and Plan."
      />

      <ol className="max-w-2xl divide-y divide-line border-y border-line">
        {METHODS.map((method) => (
          <li key={method.id} className="py-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="font-serif text-2xl text-ink">{method.name}</h2>
              <Grade grade={method.grade} />
            </div>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted">{method.source}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink">{method.summary}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{method.inQuire}</p>
            <div className="mt-4">
              {method.mode ? (
                <Link to="/practice" search={{ mode: method.mode }} className={buttonClass("ghost")}>
                  Use this
                </Link>
              ) : (
                <Link to={method.to} className={buttonClass("ghost")}>
                  Open it
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-12 max-w-2xl">
        <h2 className="font-serif text-2xl text-ink">Do not build the hour out of these</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Dunlosky and colleagues rated several popular habits low utility. They are not banned. They are a poor main
          method.
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {WEAK.map((item) => (
            <li key={item.name} className="lift rounded-2xl bg-sheet px-4 py-4">
              <p className="text-sm font-medium text-accent-ink">{item.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-ink">{item.why}</p>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}

function Grade({ grade }: { grade: MethodGrade }) {
  return (
    <span className="text-xs font-medium uppercase tracking-widest text-accent-ink">{grade}</span>
  );
}
