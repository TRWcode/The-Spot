import { Hero } from "@/components/sections/Hero";
import { Trust } from "@/components/sections/Trust";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { Why } from "@/components/sections/Why";
import { Testimonial } from "@/components/sections/Testimonial";
import { Contact } from "@/components/sections/Contact";

/** Section order is fixed by the brief: the boldness lives in Hero and Work. */
export default function Home() {
  return (
    <>
      <Hero />
      <Trust />
      <Services />
      <Work />
      <Why />
      <Testimonial />
      <Contact />
    </>
  );
}
