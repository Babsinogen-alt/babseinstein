import type { SeedCard, Subject } from "@/lib/study/types";

export const SEED_SUBJECTS: Subject[] = [
  {
    id: "learning",
    name: "How study works",
    blurb: "The methods themselves, so the coach can be retrieved too.",
    sample: true,
  },
  {
    id: "clinical",
    name: "Early pregnancy ultrasound",
    blurb: "Sample teaching cards. Not a protocol.",
    sample: true,
  },
  {
    id: "spanish",
    name: "Spanish in clinic",
    blurb: "Short spoken phrases. Say them aloud.",
    sample: true,
  },
];

export const SEED_CARDS: SeedCard[] = [
  {
    id: "learn-high",
    subjectId: "learning",
    type: "recall",
    prompt:
      "Which two techniques did Dunlosky and colleagues (2013) rate high utility across ages and materials?",
    answer: "Practice testing (retrieval practice) and distributed practice (spacing).",
    because:
      "They force a real memory attempt, and they do it again after a gap. Familiarity from rereading does neither.",
    example:
      "Close the notes, write the five causes you can recall, check, then leave the misses for tomorrow instead of rereading tonight.",
    dueOffset: 0,
    reps: 2,
    interval: 3,
  },
  {
    id: "learn-fluency",
    subjectId: "learning",
    type: "recall",
    prompt: "Why does rereading feel effective when it usually is not?",
    answer:
      "Fluency. Familiar text is easier to process, and that ease is mistaken for knowing. Judgments of learning after rereading run overconfident.",
    because:
      "Ease of reading is a cue about the page, not about whether you can produce the idea with the page shut.",
    dueOffset: 0,
    reps: 1,
    interval: 1,
  },
  {
    id: "learn-spacing",
    subjectId: "learning",
    type: "recall",
    prompt: "What is the spacing effect?",
    answer:
      "The same study time spread across days beats the same time massed in one sitting. A gap lets the memory fade just enough that the next retrieval is effortful.",
    because:
      "Effortful successful retrieval after a gap strengthens the route more than another pass while the idea is still in working memory.",
    dueOffset: -1,
    reps: 1,
    interval: 1,
    lapses: 1,
    streak: 0,
  },
  {
    id: "learn-interleave",
    subjectId: "learning",
    type: "recall",
    prompt: "What does interleaving mix, and what skill does that train?",
    answer:
      "It mixes topics or problem types inside one session instead of blocking one type until it feels easy. It trains discrimination: telling similar ideas apart.",
    because:
      "Blocked practice lets you reuse the last method without choosing it. Mixed practice makes you choose.",
    example:
      "Ten minutes on biometry, then a Spanish phrase, then a study-method card — not forty minutes of one chapter.",
    dueOffset: 0,
    reps: 1,
    interval: 1,
  },
  {
    id: "learn-feedback",
    subjectId: "learning",
    type: "why",
    prompt: "Why is a failed retrieval not enough on its own?",
    answer:
      "Without the correct answer afterwards, the error can stick. Feedback — especially while the attempt is still in mind — is what turns a miss into learning.",
    because:
      "The test shows the gap. The answer fills it. A later successful retrieval is what makes the correction last.",
    dueOffset: 1,
    reps: 1,
    interval: 1,
  },
  {
    id: "learn-highlight",
    subjectId: "learning",
    type: "recall",
    prompt: "How did Dunlosky et al. (2013) rate highlighting and underlining?",
    answer:
      "Low utility. They rarely beat simply reading, and they pull attention onto isolated words instead of relations between ideas.",
    because:
      "A mark on a page is not a retrieval. The mark can even become a false signal that the line was learned.",
    dueOffset: 2,
    reps: 1,
    interval: 2,
  },
  {
    id: "learn-successive",
    subjectId: "learning",
    type: "example",
    prompt: "Give a concrete example of successive relearning.",
    answer:
      "Recall a fact until you get it right today. Recall it again on a later day until you get it right. Repeat across several days. Rawson, Dunlosky, and Sciartelli found this beats one long sitting.",
    because:
      "Each day you relearn to criterion, then the spacing does the rest. One correct recall is not mastery.",
    example:
      "Miss the SRU cut-off, see 7 mm, recall it again before the session ends, then meet it again in two days.",
    dueOffset: 2,
    reps: 1,
    interval: 2,
  },
  {
    id: "learn-desirable",
    subjectId: "learning",
    type: "recall",
    prompt: "When is a difficulty desirable, in Bjork's sense?",
    answer:
      "When it slows you now but increases later retention or transfer. If the task is so hard that nothing is encoded, the difficulty stops being desirable.",
    because:
      "Spacing, retrieval, and interleaving feel worse in the moment than rereading. That feeling is not evidence they are failing.",
    fresh: true,
  },
  {
    id: "learn-pretest",
    subjectId: "learning",
    type: "recall",
    prompt: "Why try a question before you have studied the answer?",
    answer:
      "A failed guess focuses attention on the gap. The benefit appears when the correct answer follows. An uncorrected error is not the goal.",
    because:
      "Prequestions and errorful generation work as attention-setters, not as a reason to skip feedback.",
    fresh: true,
  },
  {
    id: "learn-worked",
    subjectId: "learning",
    type: "worked",
    prompt:
      "A learner rereads a chapter three times the night before an exam and feels ready. What should that same hour contain instead?",
    answer:
      "1. Close the chapter.\n2. Write everything that can be retrieved.\n3. Open the book only to check, and mark the misses.\n4. Retrieve the misses until they are correct once.\n5. Leave the next retrieval for another day, not for another hour tonight.\n\nThat hour is practice testing plus a first spacing gap. The fluent feeling from rereading is not in it.",
    because:
      "For material you have already met, unguided retrieval beats another passive pass. A worked example is for the first meeting; this card is that example.",
    fresh: true,
  },
  {
    id: "learn-clt",
    subjectId: "learning",
    type: "recall",
    prompt:
      "For a novice, what does cognitive load theory say to do before full problems?",
    answer:
      "Study a worked example, then a completion problem, then a full problem. Unguided problems overload working memory before a schema exists. Fade the help as the schema forms.",
    because:
      "Working memory is small. An example carries the solution steps so attention can go to the relations, not to a search.",
    fresh: true,
  },
  {
    id: "learn-production",
    subjectId: "learning",
    type: "recall",
    prompt: "What is the production effect, and how large is it?",
    answer:
      "Words you say or write are remembered a bit better than words you only read (MacLeod and others). The gain is modest. It does not replace retrieving the meaning.",
    because:
      "Producing the item makes it distinct. Distinctiveness is not understanding. Say the answer, then still explain it.",
    fresh: true,
  },
  {
    id: "clin-crl-fail",
    subjectId: "clinical",
    type: "recall",
    prompt:
      "At what crown–rump length, with no cardiac activity, can a failed pregnancy be diagnosed on an adequate transvaginal scan?",
    answer:
      "7 mm or more, per the Society of Radiologists in Ultrasound consensus (Doubilet et al., NEJM 2013). Below that, absent cardiac activity can still be too early.",
    because:
      "The cut-off was raised because smaller embryos are easy to mis-measure. A single still frame is not a reason to invent a stricter number.",
    example:
      "CRL 4 mm, no flicker: arrange follow-up. CRL 8 mm, no activity on a proper transvaginal study: that meets the failure criterion.",
    dueOffset: 0,
    reps: 1,
    interval: 1,
  },
  {
    id: "clin-msd",
    subjectId: "clinical",
    type: "recall",
    prompt:
      "Mean sac diameter cut-off for diagnosing failed pregnancy when no embryo is seen (SRU 2013)?",
    answer:
      "25 mm or greater without an embryo. A smaller empty sac is followed. It is not declared failed from one generous measurement.",
    because:
      "Older, tighter cut-offs (around 16 mm) produced false diagnoses of failure. The consensus moved the line.",
    dueOffset: 0,
    reps: 1,
    interval: 1,
    lapses: 1,
    streak: 0,
  },
  {
    id: "clin-dating",
    subjectId: "clinical",
    type: "recall",
    prompt: "When do you date with crown–rump length instead of mean sac diameter?",
    answer:
      "As soon as an embryo can be measured reliably. CRL is the dating measurement of choice through the first trimester (commonly to about 13+6). MSD is only a bridge before an embryo is seen.",
    because:
      "CRL tracks embryonic size directly. Sac size is looser and is abandoned once the embryo is there.",
    example:
      "LMP says 8 weeks. CRL is 6 mm, about 6 weeks 3 days. The scan date is the one later growth is judged against.",
    dueOffset: 0,
    reps: 2,
    interval: 3,
  },
  {
    id: "clin-yolk",
    subjectId: "clinical",
    type: "why",
    prompt:
      "Why does a yolk sac inside an intrauterine sac matter more than a fluid collection alone?",
    answer:
      "A yolk sac is good evidence of an intrauterine pregnancy. A fluid collection without one can be a pseudosac and does not prove the pregnancy is in the uterus.",
    because:
      "Location is the question early on. The yolk sac answers location. It does not, by itself, prove the pregnancy will continue.",
    dueOffset: 1,
    reps: 1,
    interval: 1,
  },
  {
    id: "clin-biometry",
    subjectId: "clinical",
    type: "recall",
    prompt: "Name the four standard mid-trimester fetal biometry measurements.",
    answer:
      "Biparietal diameter (BPD), head circumference (HC), abdominal circumference (AC), and femur length (FL).",
    because:
      "Head size, abdominal size, and a long bone together estimate growth better than any one of them. HC is preferred over BPD alone when the head shape is unusual.",
    dueOffset: 2,
    reps: 1,
    interval: 2,
  },
  {
    id: "clin-bpd",
    subjectId: "clinical",
    type: "explain",
    prompt: "How is BPD taken, and why is HC measured in that same plane?",
    answer:
      "BPD: outer-to-inner calipers at the transthalamic plane (thalami and cavum septi pellucidi visible), perpendicular to the midline. HC: an ellipse around the outer skull in that same plane. HC is the more stable head measure when the shape is not oval.",
    because:
      "A wrong plane (too low, orbits in view, or too high) changes the number more than caliper wobble does. Plane first, then calipers.",
    fresh: true,
  },
  {
    id: "clin-ddss",
    subjectId: "clinical",
    type: "recall",
    prompt: "What is the double decidual sac sign, and what does it not prove?",
    answer:
      "Two concentric echogenic rings around an intrauterine fluid collection. It supports an intrauterine pregnancy. It does not date the pregnancy, prove viability, or outrank a yolk sac.",
    because:
      "The rings are decidua. They are a location clue from before a yolk sac is clear, and they are easier to over-call than a yolk sac.",
    imageCue: "Two bright rings, one inside the other, sitting in thickened uterine lining.",
    fresh: true,
  },
  {
    id: "clin-ddss-dual",
    subjectId: "clinical",
    type: "recall",
    prompt: "Name the sign, then say what decision it does not authorize.",
    answer:
      "Double decidual sac sign. It does not authorize a failure call, a date, or a viability call. It only supports that a sac is intrauterine.",
    because:
      "The picture and the name should come up together. The limit of the sign should come up with the name, or the picture is decoration.",
    imageCue: "Two concentric bright rings in the endometrium, no embryo drawn.",
    dueOffset: 1,
    reps: 1,
    interval: 1,
  },
  {
    id: "clin-nt",
    subjectId: "clinical",
    type: "recall",
    prompt: "When is nuchal translucency measured, and what is it?",
    answer:
      "About 11+0 to 13+6 weeks, CRL roughly 45–84 mm, mid-sagittal, fetus neutral. It is a screening measurement of the translucent space behind the neck, not a diagnosis.",
    because:
      "Outside that window the measurement is not interpretable on the usual charts. A number without the criteria is not an NT.",
    fresh: true,
  },
  {
    id: "es-duele",
    subjectId: "spanish",
    type: "verbal",
    prompt: "Ask a patient you do not know: where does it hurt?",
    answer: "¿Dónde le duele?",
    because: "Le is the formal object. Tú would be ¿Dónde te duele? — too familiar for a first clinical encounter.",
    dueOffset: 0,
    reps: 1,
    interval: 1,
  },
  {
    id: "es-espalda",
    subjectId: "spanish",
    type: "verbal",
    prompt: "Ask them to lie on their back.",
    answer: "Acuéstese boca arriba.",
    because: "The -se ending is usted. Boca arriba is face up. Boca abajo would be face down.",
    dueOffset: 0,
    reps: 1,
    interval: 1,
  },
  {
    id: "es-aire",
    subjectId: "spanish",
    type: "verbal",
    prompt: "Ask them to breathe in deeply and hold.",
    answer: "Inspire hondo y aguante.",
    because: "Aguante is the formal command of aguantar, to hold. The production — saying it — is the point of this card.",
    dueOffset: 2,
    reps: 1,
    interval: 2,
  },
  {
    id: "es-vestir",
    subjectId: "spanish",
    type: "verbal",
    prompt: "Tell them they may get dressed.",
    answer: "Ya puede vestirse.",
    because: "Ya marks that the exam moment is over. Vestirse is to get dressed; vestirse uses the reflexive se.",
    dueOffset: 3,
    reps: 1,
    interval: 3,
  },
  {
    id: "es-semanas",
    subjectId: "spanish",
    type: "cloze",
    prompt: "“Estoy de veinte semanas” means I am ____.",
    answer: "I am twenty weeks pregnant.",
    because:
      "Estar de X semanas is the usual way to state gestational age. Embarazada can be added, but the de-semanas form already carries it.",
    example: "Estoy de doce semanas. — I am twelve weeks pregnant.",
    fresh: true,
  },
  {
    id: "es-usted",
    subjectId: "spanish",
    type: "why",
    prompt: "Why use le and se, not te, with a new patient?",
    answer:
      "Usted is the respectful form. ¿Dónde le duele? and acuéstese keep professional distance. Tú is for someone you already know well.",
    because:
      "The pronoun is part of the clinical manner, not decoration on the verb. Producing the formal form is the retrieval.",
    fresh: true,
  },
];
