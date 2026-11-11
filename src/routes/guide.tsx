import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonClass } from "@/components/button";
import { PageHeader, Shell } from "@/components/shell";

export const Route = createFileRoute("/guide")({ component: GuidePage });

function GuidePage() {
  return (
    <Shell>
      <PageHeader
        kicker="First time"
        title="Produce the answer. Then leave it."
        lede="Focus is a desk for retrieval. You try before you look. The cards stay on this device. Nothing is sent anywhere."
      />
      <article className="max-w-2xl space-y-8 text-sm leading-relaxed text-ink">
        <section>
          <h2 className="font-serif text-2xl">What is already there</h2>
          <p className="mt-3">
            The first time the desk opens, it places three sample subjects so you can practice the motion before you
            write your own cards.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>How study works — retrieval, spacing, and why rereading feels easier than it is.</li>
            <li>Early pregnancy ultrasound — teaching cards. Not a protocol, and not medical advice.</li>
            <li>Spanish in clinic — short phrases to say aloud.</li>
          </ul>
          <p className="mt-3 text-muted">
            Delete a subject in Library when it is in the way. Your own cards are not samples.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl">The first sitting</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Open Today. Read the line that starts with Now.</li>
            <li>Tap Full session if you can sit. Tap 15-minute burst if this is only a gap.</li>
            <li>If it asks for a dump, write from memory. Do not open Library while you are doing it.</li>
            <li>Tick only what you retrieved before the list appeared.</li>
            <li>On a card, write the answer. Rate how sure you are. Then show it.</li>
            <li>Grade what you produced, not how familiar the answer looked.</li>
            <li>Stop when the session ends. Do not reread the pile tonight.</li>
          </ol>
          <p className="mt-4">
            <Link to="/practice" search={{ mode: "today" }} className={buttonClass("primary")}>
              Start today’s session
            </Link>
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl">How to grade</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Again — you did not produce it. It will return.</li>
            <li>Hard — you did, with strain.</li>
            <li>Good — a clean retrieval.</li>
            <li>Easy — it was immediate. The next gap gets longer.</li>
          </ul>
          <p className="mt-3 text-muted">
            Saying the answer once is optional. Turn it off in Plan if the room is quiet. Speaking does not replace
            the written attempt.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl">The three numbers</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Due — cards whose date is today or earlier. This is the work.</li>
            <li>New — cards you have not been tested on yet. A few may enter as a pretest.</li>
            <li>Secured — cards you retrieved today. Leave them until their next date.</li>
          </ul>
          <p className="mt-3 text-muted">Tap Due on Today to see the last fourteen days and the last session.</p>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Add your own cards</h2>
          <p className="mt-3">
            In Library, add a subject, then a card. A card is a question you can fail. Write the prompt and shut the
            answer. A reason, a concrete case, or an image cue is optional. The image should carry the idea, not
            decorate the card.
          </p>
          <p className="mt-3">
            A subject row on Today opens that subject in the library. Download a backup from Library if you want a
            copy. The backup is a file on your device, not an account.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl">Where things live</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Today — start, or resume the session already open. Do not start a second one beside it.</li>
            <li>Library — the material.</li>
            <li>Plan — a sentence for when you will begin, and the dates already set. Do not pull tomorrow’s cards into tonight.</li>
            <li>Methods — one technique only, when the mixed session is the wrong job. Open it from the link on Today.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl">What to skip</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Rereading the notes and calling it a session.</li>
            <li>Restudying a card you already retrieved today.</li>
            <li>A long cram the night before. Sleep does more for the trace than another pass.</li>
            <li>Treating the sample ultrasound cards as a clinical protocol.</li>
          </ul>
        </section>
      </article>
    </Shell>
  );
}
