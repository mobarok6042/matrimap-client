import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse services" },
  { href: "/profiles", label: "Matrimony profiles" },
  { href: "/auth?mode=sign-up", label: "Create account" },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" aria-label="MatriMap home" className="inline-flex items-center">
            <Image src="/logo.png" alt="MatriMap" width={54} height={44} className="h-11 w-auto object-contain" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            Meaningful matrimonial connections and trusted wedding services, all in one place.
          </p>
        </div>

        <div>
          <h2 className="font-semibold">Explore</h2>
          <nav className="mt-4 flex flex-col gap-3" aria-label="Footer navigation">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="font-semibold">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <a href="mailto:support@matrimap.com" className="flex items-center gap-2 transition-colors hover:text-primary">
              <Mail className="size-4 shrink-0" />
              support@matrimap.com
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" />
              Dhaka, Bangladesh
            </p>
          </div>
        </div>

        <div>
          <h2 className="font-semibold">Follow us</h2>
          <div className="mt-4 flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <span className="text-xs font-bold">f</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <span className="text-xs font-bold">ig</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <span className="text-xs font-bold">in</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-muted-foreground sm:text-left">
          © {new Date().getFullYear()} MatriMap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
