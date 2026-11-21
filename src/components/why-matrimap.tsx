import Image from "next/image";
import { Calendar, CheckCircle2, DollarSign } from "lucide-react";

const reasons = [
  {
    icon: CheckCircle2,
    title: "Admin-reviewed listings",
    description: "Explore services that have been reviewed before appearing in the marketplace.",
  },
  {
    icon: DollarSign,
    title: "Compare with clarity",
    description: "See service details, locations, and starting prices together as you plan.",
  },
  {
    icon: Calendar,
    title: "Requests in one place",
    description: "Send a booking request and follow its status from your customer dashboard.",
  },
];

export function WhyMatriMap() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20" aria-labelledby="why-matrimap">
      <div className="overflow-hidden rounded-3xl border border-border bg-card/70">
        <div className="grid md:grid-cols-2">
          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-sm font-medium uppercase tracking-wider text-primary">Plan with confidence</p>
            <h2 id="why-matrimap" className="mt-2 text-3xl font-semibold tracking-tight">
              Why choose MatriMap?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Bring the details together, discover local wedding professionals, and keep your next steps organized.
            </p>
            <ul className="mt-8 space-y-5">
              {reasons.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative min-h-72 overflow-hidden md:min-h-full">
            <Image
              src="/why-matrimap.jpg"
              alt="A newlywed couple leaving their wedding ceremony surrounded by family and friends"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
