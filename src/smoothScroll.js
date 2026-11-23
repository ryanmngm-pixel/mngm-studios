import Lenis from "lenis";
import "lenis/dist/lenis.css";

let lenis = null;

/* Weighted, inertial scrolling for mouse and trackpad. Touch keeps native scrolling. */
export function startSmoothScroll() {
  if (lenis || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  lenis = new Lenis({
    lerp: 0.09,
    wheelMultiplier: 0.95,
    anchors: { offset: -100 },
  });

  const raf = (time) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

export function pauseScroll(paused) {
  if (!lenis) return;
  if (paused) lenis.stop();
  else lenis.start();
}
