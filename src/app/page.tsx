import { Contact } from "@/components/Contact";
import { FlightPlan } from "@/components/FlightPlan";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Practice } from "@/components/Practice";
import { SipCalculator } from "@/components/SipCalculator";
import { Testimonial } from "@/components/Testimonial";
import { Ventures } from "@/components/Ventures";

export default function Home() {
  return (
    <>
      <a
        href="#wealth"
        className="sr-only z-[60] rounded-full bg-ink px-5 py-3 text-paper focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Header />
      <main>
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
