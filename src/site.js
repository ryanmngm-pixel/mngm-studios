export const EASE = [0.22, 1, 0.36, 1];

export const NAV = [
  ["Work", "/work"],
  ["Services", "/#services"],
  ["Process", "/#process"],
  ["Pricing", "/#investment"],
];

/* Phones and tablets get a lighter version of the 3D effects. Decided once at load. */
export const LITE =
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
