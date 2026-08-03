"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useHashScroll } from "@/components/motion/useHashScroll";

/**
 * Een Link die naar een sectie van de huidige pagina soepel toe scrolt en
 * verder gewoon navigeert.
 *
 * Bestaat zodat de footer een servercomponent kan blijven: alleen deze rij
 * links heeft een handler nodig, niet het hele blok eromheen. Het onderscheid
 * tussen "scroll" en "ga ergens heen" zit in `useHashScroll`, want dezelfde
 * `/#diensten` is op de homepage het eerste en op een casepagina het tweede.
 */
export function HashLink(props: ComponentProps<typeof Link>) {
  const hashScroll = useHashScroll();
  return <Link {...props} onClick={hashScroll} />;
}
