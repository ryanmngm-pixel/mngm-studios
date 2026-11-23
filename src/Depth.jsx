import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/* Shared 3D interaction pieces: tilt-toward-cursor surfaces, magnetic buttons, and the cursor halo. */

function useFinePointer() {
  const [fine, setFine] = useState(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const change = () => setFine(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  return fine;
}

const SPRING = { stiffness: 170, damping: 18, mass: 0.6 };

/* A surface that leans toward the cursor in 3D, with a soft light that follows it. */
export function Tilt({ children, className = "", max = 9, glare = true, as = "div", track, ...rest }) {
  const reduced = useReducedMotion();
  const self = useRef(null);
  const fine = useFinePointer();
  const active = fine && !reduced;

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const rotateY = useTransform(sx, [0, 1], [-max, max]);
  const rotateX = useTransform(sy, [0, 1], [max * 0.8, -max * 0.8]);
  const lightX = useTransform(sx, (v) => `${v * 100}%`);
  const lightY = useTransform(sy, (v) => `${v * 100}%`);

  const Component = motion[as];

  // `track` lets a larger parent (e.g. a whole card) drive the tilt
  useEffect(() => {
    if (!active || !track || !self.current) return;
    const area = self.current.closest(track);
    if (!area) return;

    const move = (event) => {
      const rect = self.current.getBoundingClientRect();
      x.set(Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1));
      y.set(Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1));
    };
    const leave = () => {
      x.set(0.5);
      y.set(0.5);
    };

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
  }, [active, track, x, y]);

  const move = (event) => {
    if (!active || track) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width);
    y.set((event.clientY - rect.top) / rect.height);
  };

  const leave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <Component
      ref={self}
      className={`d-tilt ${className}`}
      onPointerMove={move}
      onPointerLeave={leave}
      style={active ? { rotateX, rotateY, transformPerspective: 1100, "--lx": lightX, "--ly": lightY } : undefined}
      {...rest}
    >
      {children}
      {glare && active && <span className="d-tilt-glare" aria-hidden="true" />}
    </Component>
  );
}

/* Pulls its child a little toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.28 }) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.5 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.5 });

  if (reduced || !fine) return children;

  return (
    <motion.span
      className="d-magnetic"
      style={{ x, y }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * strength);
        y.set((event.clientY - rect.top - rect.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.span>
  );
}

/* A soft ring that trails the cursor, grows over links, and names what a click will do. */
export function CursorHalo() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 34, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 400, damping: 34, mass: 0.5 });
  const [state, setState] = useState({ visible: false, hover: false, label: "", down: false });
  const last = useRef(state);

  useEffect(() => {
    if (!fine || reduced) return;

    const update = (next) => {
      const merged = { ...last.current, ...next };
      if (
        merged.visible !== last.current.visible ||
        merged.hover !== last.current.hover ||
        merged.label !== last.current.label ||
        merged.down !== last.current.down
      ) {
        last.current = merged;
        setState(merged);
      }
    };

    const move = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = event.target instanceof Element ? event.target : null;
      const labelled = target?.closest("[data-cursor]");
      const interactive = target?.closest("a, button, input, textarea, select, label, [role='button']");
      update({
        visible: true,
        hover: Boolean(labelled || interactive),
        label: labelled?.getAttribute("data-cursor") || "",
      });
    };

    const leave = () => update({ visible: false });
    const down = () => update({ down: true });
    const up = () => update({ down: false });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fine, reduced, x, y]);

  if (!fine || reduced) return null;

  const classes = [
    "d-cursor",
    state.visible && "is-visible",
    state.hover && "is-hover",
    state.label && "has-label",
    state.down && "is-down",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div className={classes} style={{ x: sx, y: sy }} aria-hidden="true">
      <span className="d-cursor-ring">{state.label && <span className="d-cursor-label">{state.label}</span>}</span>
    </motion.div>
  );
}
