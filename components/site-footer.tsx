import Link from "next/link";

const footerLinks = [
  { href: "/atlas", label: "Atlas" },
  { href: "/faq", label: "FAQ" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/auth/login", label: "Sign in" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-8 py-10 md:grid-cols-[1fr_0.8fr]">
        <div>
          <Link href="/" className="font-semibold">
            MicroAtlas
          </Link>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            MicroAtlas records self-declared information for discovery,
            archival, and research context. Inclusion does not imply legal
            recognition or endorsement.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-5 gap-y-3 text-sm md:justify-end"
        >
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
