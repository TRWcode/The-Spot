import { Hero } from "@/components/sections/Hero";
import { Trust } from "@/components/sections/Trust";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { Why } from "@/components/sections/Why";
import { Testimonial } from "@/components/sections/Testimonial";
import { Contact } from "@/components/sections/Contact";

/**
 * Section order: the boldness lives in Hero and Work.
 *
 * Work comes before Services deliberately — a production company is judged on
 * what it has made, not on a list of what it offers. The services then read as
 * "and this is how", against evidence the visitor has already seen.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Trust />
      <Work />
      <Services />
      <Why />
      <Testimonial />
      <Contact />
    </>
  );
}
