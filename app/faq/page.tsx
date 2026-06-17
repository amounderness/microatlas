import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "What is MicroAtlas?",
    answer:
      "MicroAtlas is a public map and directory for micronations, self-declared states, and experimental civic projects. It helps visitors discover projects, explore self-declared claims, and follow each listing back to its own websites, communities, archives, or social pages.",
  },
  {
    question: "Who can submit a nation?",
    answer:
      "During closed beta, submissions are intended for serious micronational projects, self-declared states, experimental civic projects, and community participants who can provide a clear public profile, relevant links, and a claim that can be reviewed.",
  },
  {
    question: "Does MicroAtlas recognise sovereignty?",
    answer:
      "No. MicroAtlas records self-declared information for discovery and archival context. It does not grant recognition, verify legal sovereignty, settle legitimacy, or make any legal claim about a listed nation.",
  },
  {
    question: "Can claims overlap?",
    answer:
      "Yes. Claims are self-declared and may overlap with other submissions, existing countries, historical claims, symbolic territories, or community-defined areas. Showing a claim on MicroAtlas is not endorsement of ownership or jurisdiction.",
  },
  {
    question: "Why are submissions reviewed?",
    answer:
      "Review keeps the atlas useful, safe, and readable. Moderation helps prevent spam, impersonation, harassment, malicious links, personal information leaks, and entries that are too unclear or disruptive to publish.",
  },
  {
    question: "What should I prepare before submitting?",
    answer:
      "You should prepare a nation name, short public description, flag image, external links if available, and a clear description or map claim. Strong submissions usually include an official website, wiki page, archive, constitution, public community, or other evidence that the project has a sustained public presence.",
  },
  {
    question: "What does approval mean?",
    answer:
      "Approval means the entry has passed MicroAtlas moderation standards for publication. It does not mean MicroAtlas recognises sovereignty, endorses territorial ownership, verifies every claim, or certifies the nation as legally valid.",
  },
  {
    question: "What happens if my submission needs changes?",
    answer:
      "A moderator may return the entry with notes if information is unclear, incomplete, unsafe, too broad, or unsuitable for publication. You can revise the draft and submit it again.",
  },
  {
    question: "Can I edit my nation after approval?",
    answer:
      "During beta, approved entries may require further review after major edits. This helps prevent approved pages from later being changed into spam, abuse, unsafe links, or misleading claims.",
  },
  {
    question: "Can fictional or worldbuilding projects be listed?",
    answer:
      "MicroAtlas is primarily for micronations, self-declared states, and serious experimental civic projects. Fictional or worldbuilding-adjacent projects may be considered only if they are clearly presented, publicly documented, and not submitted as misleading legal or territorial claims.",
  },
  {
    question: "Can I remove my listing?",
    answer:
      "Yes. Nation owners should be able to request removal or hiding of their own listing. Moderators may also hide listings if they create safety, privacy, impersonation, or moderation concerns.",
  },
  {
    question: "Are emails public?",
    answer:
      "No. Account email addresses are not shown on public listings. Users may choose to add public contact routes such as websites, forums, Discord links, or social pages, but private account details stay private by default.",
  },
  {
    question: "What content is rejected?",
    answer:
      "MicroAtlas may reject spam, abuse or harassment, hateful or extremist content, impersonation, private personal information, pornographic or shock content, malware or suspicious links, low-effort entries, and claims submitted in a disruptive way.",
  },
  {
    question: "Can users add alliances, chat, or diplomacy?",
    answer:
      "Not inside MicroAtlas during the closed beta. Listings can link to external communities and official channels, but MicroAtlas is not currently a chat platform, diplomacy simulator, alliance system, war game, or recognition game.",
  },
  {
    question: "What is included in the closed beta?",
    answer:
      "The closed beta focuses on core atlas workflows: creating an account, submitting a public nation profile, adding a flag and external links, drawing or describing a claim, submitting for review, browsing approved entries, and reporting entries that need moderator attention.",
  },
  {
    question: "How do users report an entry?",
    answer:
      "Open the public nation profile and use the report form near the bottom of the page. Reports go to moderators for review and can be used for spam, abuse, privacy concerns, impersonation, unsafe links, disruptive claims, or other listing problems.",
  },
];

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about MicroAtlas, closed beta submissions, moderation, privacy, claims, and public listings.",
};

export default function FAQPage() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Frequently asked questions
          </p>

          <div className="mt-4 grid gap-8 md:grid-cols-[1fr_0.65fr] md:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Clear answers before beta testing begins.
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                MicroAtlas is being prepared carefully so early users understand
                what the atlas is for, what it is not for, and how public
                submissions will be handled.
              </p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-6">
              <h2 className="text-base font-medium">Closed beta focus</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                The beta is centred on public listings, mapped claims, review,
                reporting, and feedback on the submission process.
              </p>
              <div className="mt-5">
                <Button asChild>
                  <Link href="/auth/sign-up">Request beta access</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-lg border p-6">
              <h2 className="text-xl font-medium">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Still exploring?
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Browse the atlas or join the beta queue.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button asChild>
              <Link href="/atlas">Browse the atlas</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/auth/sign-up">Request beta access</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
