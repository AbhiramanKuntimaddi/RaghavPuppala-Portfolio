import { Contact } from "@/components/sections/Contact";
import { FlightPlan } from "@/components/sections/FlightPlan";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SkipLink } from "@/components/layout/SkipLink";
import { Hero } from "@/components/sections/Hero";
import { Practice } from "@/components/sections/Practice";
import { SipCalculator } from "@/components/sections/SipCalculator";
import { Testimonial } from "@/components/sections/Testimonial";
import { Ventures } from "@/components/sections/Ventures";

export default function Home() {
  return (
    <>
      <SkipLink />
      <Header />
      {/* Above the footer, which sits underneath; sticky so it can hold once the footer is uncovered. */}
      <main className="sticky z-10">
        <Hero />
        <Practice />
        <FlightPlan />
        <SipCalculator />
        <Testimonial />
        <Ventures />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
