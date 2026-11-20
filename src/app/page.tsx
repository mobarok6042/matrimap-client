import { Hero } from "@/components/hero";
import { HomeServices } from "@/components/home-services";
import { WhyMatriMap } from "@/components/why-matrimap";

export const metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HomeServices />
      <WhyMatriMap />
    </main>
  );
}
