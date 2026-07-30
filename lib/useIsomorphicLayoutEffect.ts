import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect warns during SSR. Client components still render on the
 * server, so animation setup uses this instead.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
