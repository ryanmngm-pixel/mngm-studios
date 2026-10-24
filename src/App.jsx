
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowUpRight,
  ArrowDown,
  Menu,
  X,
  Plus,
  MousePointer2,
  Shuffle,
  Code2,
  Layers3,
  Globe2,
  Check,
} from "lucide-react";
import "./App.css";

const ACCENT = "#FF784F";
const PHONE = "4352782290";
const EASE = [0.22, 1, 0.36, 1];

const projects = [
  {
    number: "01",
    name: "MOOVIO",
    category: "AUTOMOTIVE / SOFTWARE",
    description:
      "A new way for automotive shops to keep customers connected.",
    color: "#FF784F",
    type: "moovio",
    tag: "DIGITAL PRODUCT",
  },
  {
    number: "02",
    name: "SABL",
    category: "FINANCE / INTERFACE",
    description:
      "A bold exploration of the future of personal finance.",
    color: "#a3a0ff",
    type: "sabl",
    tag: "PRODUCT CONCEPT",
  },
  {
    number: "03",
    name: "MNGM GROUP",
    category: "IDENTITY / WEB",
    description:
      "A digital home for an expanding collection of ideas.",
    color: "#ff9e80",
    type: "group",
    tag: "BRAND EXPERIENCE",
  },
];

const services = [
  {
    number: "01",
    name: "WEB DESIGN",
    description: "Websites that look nothing like your competitors.",
    icon: Layers3,
  },
  {
    number: "02",
    name: "DEVELOPMENT",
    description: "Fast, responsive, custom-built digital experiences.",
    icon: Code2,
  },
  {
    number: "03",
    name: "INTERACTION",
    description:
      "Motion, micro-interactions, and moments people remember.",
    icon: MousePointer2,
  },
  {
    number: "04",
    name: "DIGITAL IDENTITY",
    description:
      "A cohesive visual language that makes your brand unmistakable.",
    icon: Globe2,
  },
];

const words = [
  "IMPOSSIBLE",
  "DIFFERENT",
  "UNREAL",
  "NEXT LEVEL",
  "MNGM",
];

const colors = [
  "#FF784F",
  "#FFB36B",
  "#b8a3ff",
  "#65dcff",
  "#ffffff",
];

/* ======================================
   VECTOR SYMBOL — NO IPHONE EMOJI
   ====================================== */

function Asterisk({
  size = 24,
  className = "",
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2V22M2 12H22M4.93 4.93L19.07 19.07M19.07 4.93L4.93 19.07" />
    </svg>
  );
}

/* ======================================
   PHONE COPY SYSTEM
   ====================================== */

async function copyPhone() {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(PHONE);
      return true;
    } catch {
      // Try fallback.
    }
  }

  const textarea = document.createElement("textarea");

  textarea.value = PHONE;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, PHONE.length);

  let success = false;

  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  textarea.remove();
  return success;
}

function usePhoneCopy() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    const success = await copyPhone();

    clearTimeout(timer.current);

    setCopied(success);
    setFailed(!success);

    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2500);
  };

  return { copy, copied, failed };
}

function ContactButton({
  children = "START A PROJECT",
  className = "",
  showIcon = true,
  onCopied,
}) {
  const { copy, copied, failed } = usePhoneCopy();

  const handleClick = async () => {
    await copy();
    if (onCopied) onCopied();
  };

  return (
    <button
      type="button"
      className={`contact-button ${className} ${
        copied ? "contact-copied" : ""
      }`}
      onClick={handleClick}
      aria-label="Copy MNGM Studios phone number"
    >
      <span aria-live="polite">
        {copied
          ? "NUMBER COPIED ✓"
          : failed
          ? "COPY FAILED — TRY AGAIN"
          : children}
      </span>

      {showIcon &&
        (copied ? (
          <Check size={18} />
        ) : (
          <ArrowUpRight size={18} />
        ))}
    </button>
  );
}

/* ======================================
   ANIMATION HELPERS
   ====================================== */

function Reveal({
  children,
  className = "",
  delay = 0,
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              y: 40,
              filter: "blur(6px)",
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.08,
      }}
      transition={{
        duration: reduced ? 0 : 0.8,
        delay: reduced ? 0 : delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

function Magnetic({
  children,
  className = "",
  href,
  onClick,
  ariaLabel,
}) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const sx = useSpring(x, {
    stiffness: 180,
    damping: 16,
  });

  const sy = useSpring(y, {
    stiffness: 180,
    damping: 16,
  });

  const move = (event) => {
    if (!ref.current) return;

    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();

    x.set(
      (event.clientX - rect.left - rect.width / 2) *
        0.23
    );

    y.set(
      (event.clientY - rect.top - rect.height / 2) *
        0.23
    );
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const props = {
    ref,
    className,
    onMouseMove: move,
    onMouseLeave: reset,
    style: { x: sx, y: sy },
    "aria-label": ariaLabel,
  };

  if (href) {
    return (
      <motion.a href={href} {...props}>
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function Cursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const sx = useSpring(x, {
    stiffness: 500,
    damping: 35,
  });

  const sy = useSpring(y, {
    stiffness: 500,
    damping: 35,
  });

  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const move = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);

      setVisible(true);
      setHovering(
        Boolean(
          event.target.closest(
            "a, button, [data-cursor]"
          )
        )
      );
    };

    const hide = () => setVisible(false);

    window.addEventListener("pointermove", move);
    document.addEventListener("mouseleave", hide);

    return () => {
      window.removeEventListener(
        "pointermove",
        move
      );
      document.removeEventListener(
        "mouseleave",
        hide
      );
    };
  }, [x, y]);

  return (
    <motion.div
      className="custom-cursor"
      style={{ x: sx, y: sy }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: hovering ? 2.7 : 1,
      }}
      transition={{
        scale: { duration: 0.25 },
      }}
    />
  );
}

/* ======================================
   BACKGROUND PARTICLES
   ====================================== */

function BackgroundCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let particles = [];

    const mouse = {
      x: -1000,
      y: -1000,
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const dpr = Math.min(
        window.devicePixelRatio || 1,
        2
      );

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
      );

      const mobile = width < 768;

      particles = Array.from(
        {
          length: Math.min(
            mobile ? 32 : 100,
            Math.floor(
              (width * height) /
                (mobile ? 18000 : 12000)
            )
          ),
        },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.3 + 0.3,
        })
      );
    };

    const move = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) {
            p.vx *= -1;
          }

          if (p.y < 0 || p.y > height) {
            p.vy *= -1;
          }
        }

        const dist = Math.hypot(
          p.x - mouse.x,
          p.y - mouse.y
        );

        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          p.r,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          dist < 160
            ? "#FF784Fcc"
            : "#ffffff44";

        ctx.fill();

        if (dist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);

          ctx.strokeStyle = `rgba(255,120,79,${
            (1 - dist / 160) * 0.17
          })`;

          ctx.stroke();
        }

        for (
          let j = i + 1;
          j < particles.length;
          j++
        ) {
          const q = particles[j];

          const distance = Math.hypot(
            p.x - q.x,
            p.y - q.y
          );

          if (distance < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);

            ctx.strokeStyle = `rgba(255,255,255,${
              (1 - distance / 90) * 0.055
            })`;

            ctx.stroke();
          }
        }
      });

      if (!reduced) {
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "resize",
        resize
      );

      window.removeEventListener(
        "pointermove",
        move
      );
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="background-canvas"
      aria-hidden="true"
    />
  );
}

/* ======================================
   NAVIGATION
   ====================================== */

function Navigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", close);

    return () => {
      window.removeEventListener("keydown", close);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="nav">
        <a
          href="#home"
          className="logo"
          onClick={() => setOpen(false)}
          aria-label="MNGM Studios home"
        >
          MNGM<span>.</span>
          <small>STUDIOS®</small>
        </a>

        <div className="nav-center">
          <span className="status-dot" />
          INDEPENDENT CREATIVE STUDIO
        </div>

        <div className="nav-actions">
          <ContactButton className="nav-contact">
            LET'S TALK
          </ContactButton>

          <button
            type="button"
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label={
              open ? "Close menu" : "Open menu"
            }
            aria-expanded={open}
            aria-controls="main-menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="main-menu"
            className="menu-overlay"
            initial={{
              clipPath: "inset(0 0 100% 0)",
            }}
            animate={{
              clipPath: "inset(0 0 0% 0)",
            }}
            exit={{
              clipPath: "inset(0 0 100% 0)",
            }}
            transition={{
              duration: 0.65,
              ease: EASE,
            }}
          >
            <nav
              className="menu-inner"
              aria-label="Main navigation"
            >
              {[
                ["01", "HOME", "#home"],
                ["02", "WORK", "#work"],
                [
                  "03",
                  "PLAYGROUND",
                  "#playground",
                ],
                ["04", "SERVICES", "#services"],
              ].map(([n, name, link]) => (
                <a
                  href={link}
                  key={name}
                  onClick={() => setOpen(false)}
                >
                  <span>{n}</span>
                  {name}
                  <ArrowUpRight />
                </a>
              ))}

              <ContactButton
                className="menu-contact-button"
                onCopied={() => setOpen(false)}
              >
                05 — CONTACT
              </ContactButton>

              <div className="menu-footer">
                MNGM STUDIOS — MAKE SOMETHING
                MATTER.
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ======================================
   INTERACTIVE ORB
   ====================================== */

function Orb() {
  const [rotation, setRotation] = useState({
    x: -18,
    y: 25,
  });

  const [dragging, setDragging] =
    useState(false);

  const start = useRef({});

  const stopDragging = (event) => {
    setDragging(false);

    if (
      event.currentTarget.hasPointerCapture?.(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }
  };

  return (
    <div className="orb-scene">
      <div className="orb-halo" />

      <div
        className="orb-drag"
        data-cursor
        role="img"
        aria-label="Interactive rotating MNGM orb"
        onPointerDown={(event) => {
          start.current = {
            x: event.clientX,
            y: event.clientY,
            rx: rotation.x,
            ry: rotation.y,
          };

          setDragging(true);

          event.currentTarget.setPointerCapture(
            event.pointerId
          );
        }}
        onPointerMove={(event) => {
          if (!dragging) return;

          setRotation({
            x:
              start.current.rx -
              (event.clientY -
                start.current.y) *
                0.4,
            y:
              start.current.ry +
              (event.clientX -
                start.current.x) *
                0.4,
          });
        }}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <div className="orb-body">
          <div className="orb-core" />
          <div className="orb-ring ring-a" />
          <div className="orb-ring ring-b" />
          <div className="orb-ring ring-c" />

          <div className="orb-label">
            MNGM / EXPERIMENT 001
          </div>
        </div>
      </div>

      <div className="orb-instruction">
        <MousePointer2 size={13} />
        DRAG TO DISTORT REALITY
      </div>
    </div>
  );
}

/* ======================================
   HERO
   ====================================== */

function Hero() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 220]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.85],
    [1, 0]
  );

  return (
    <section
      id="home"
      className="hero"
      ref={ref}
    >
      <div className="hero-top">
        <span>
          CREATIVE DEVELOPMENT
          <br />
          WITHOUT COMPROMISE.
        </span>

        <span className="hero-coordinate">
          DIGITAL / EXPERIMENTAL / HUMAN
        </span>
      </div>

      <motion.div
        className="hero-content"
        style={
          reduced
            ? undefined
            : { y, opacity }
        }
      >
        <div className="hero-overline">
          <Asterisk
            size={22}
            className="asterisk"
          />
          NOT YOUR AVERAGE WEB STUDIO
        </div>

        <div className="hero-headline">
          {[
            ["WE MAKE", "hero-line"],
            [
              "DIGITAL",
              "hero-line hero-outline",
            ],
            [
              "FEEL ALIVE.",
              "hero-line hero-accent",
            ],
          ].map(([text, cls], i) => (
            <motion.div
              key={text}
              className={cls}
              initial={
                reduced
                  ? false
                  : {
                      y: 110,
                      opacity: 0,
                    }
              }
              animate={{
                y: 0,
                opacity: 1,
              }}
              transition={{
                duration: reduced ? 0 : 1.15,
                delay: reduced
                  ? 0
                  : 0.12 + i * 0.12,
                ease: EASE,
              }}
            >
              {text}
            </motion.div>
          ))}
        </div>

        <div className="hero-bottom">
          <p>
            We turn ambitious ideas into
            unforgettable digital experiences.
            No templates. No ordinary. No
            limits.
          </p>

          <Magnetic
            href="#work"
            className="round-arrow"
            ariaLabel="Explore our work"
          >
            <ArrowDown size={30} />
          </Magnetic>
        </div>
      </motion.div>

      <Orb />

      <div className="hero-side-label">
        SCROLL TO ENTER THE EXPERIENCE — 2026
      </div>

      <div className="hero-index">
        MNGM® — 001 / ∞
      </div>
    </section>
  );
}

/* ======================================
   MARQUEE
   ====================================== */

function Marquee() {
  return (
    <div
      className="marquee"
      aria-label="Design, develop, disrupt, repeat"
    >
      <div
        className="marquee-track"
        aria-hidden="true"
      >
        {Array.from(
          { length: 6 },
          (_, i) => (
            <span key={i}>
              DESIGN
              <Asterisk size={15} />
              DEVELOP
              <Asterisk size={15} />
              DISRUPT
              <Asterisk size={15} />
              REPEAT
              <Asterisk size={15} />
            </span>
          )
        )}
      </div>
    </div>
  );
}

/* ======================================
   INTRO
   ====================================== */

function Intro() {
  return (
    <section className="intro section-pad">
      <Reveal className="section-kicker">
        <span className="kicker-dot" />
        THE MANIFESTO / 001
      </Reveal>

      <div className="intro-grid">
        <Reveal>
          <h2 className="intro-heading">
            THE INTERNET
            <br />
            IS <em>BORING.</em>
            <br />
            <span>LET'S FIX IT.</span>
          </h2>
        </Reveal>

        <Reveal
          delay={0.2}
          className="intro-right"
        >
          <div className="intro-symbol">
            <Asterisk size={105} />
          </div>

          <p>
            Most websites are forgotten the
            second you close the tab.
          </p>

          <p>We don't build those.</p>

          <p className="muted">
            MNGM Studios combines design,
            technology, and a healthy disregard
            for the ordinary to create things
            people actually remember.
          </p>

          <a
            href="#services"
            className="text-link"
          >
            WHAT WE DO
            <ArrowUpRight size={19} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ======================================
   PROJECT VISUALS
   ====================================== */

function ProjectVisual({ project }) {
  if (project.type === "moovio") {
    return (
      <div className="project-visual moovio-visual">
        <div className="mock-browser">
          <div className="mock-browser-bar">
            <i />
            <i />
            <i />
            <span>moovio / dashboard</span>
          </div>

          <div className="mock-sidebar">
            <strong>
              moovio<span>.</span>
            </strong>

            <div className="mock-nav-line" />
            <div className="mock-nav-line short" />
            <div className="mock-nav-line" />
          </div>

          <div className="mock-dashboard">
            <span>SHOP OVERVIEW</span>

            <strong>
              Everything in motion.
            </strong>

            <div className="mock-stats">
              <div>
                <b>12</b>
                <small>DEMO JOBS</small>
              </div>

              <div>
                <b>08</b>
                <small>IN PROGRESS</small>
              </div>
            </div>

            <div className="mock-job">
              <span>HONDA ACCORD</span>
              <span>IN PROGRESS ●</span>
            </div>

            <div className="mock-job">
              <span>BMW 330i</span>
              <span>PREP STAGE ●</span>
            </div>
          </div>
        </div>

        <div className="project-floating-label">
          SOFTWARE / EXPERIENCE
        </div>
      </div>
    );
  }

  if (project.type === "sabl") {
    return (
      <div className="project-visual sabl-visual">
        <div className="sabl-glow" />

        <div className="sabl-phone">
          <div className="sabl-phone-top">
            <span>SABL.</span>
            <span>● ● ●</span>
          </div>

          <span className="sabl-small">
            ILLUSTRATIVE BALANCE
          </span>

          <div className="sabl-balance">
            $24,680<span>.50</span>
          </div>

          <svg
            viewBox="0 0 260 110"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="sablGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  stopColor="#b4a9ff"
                  stopOpacity=".45"
                />
                <stop
                  offset="1"
                  stopColor="#b4a9ff"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            <path
              d="M0 85 C30 80 45 105 70 70 S110 95 140 47 S185 72 205 27 S245 40 260 5 L260 110 L0 110Z"
              fill="url(#sablGradient)"
            />

            <path
              d="M0 85 C30 80 45 105 70 70 S110 95 140 47 S185 72 205 27 S245 40 260 5"
              fill="none"
              stroke="#c5baff"
              strokeWidth="3"
            />
          </svg>

          <div className="sabl-cards">
            <span>
              INCOME
              <br />
              <b>+$4,820</b>
            </span>

            <span>
              SPENDING
              <br />
              <b>-$1,240</b>
            </span>
          </div>
        </div>

        <div className="sabl-word">
          SABL
        </div>
      </div>
    );
  }

  return (
    <div className="project-visual group-visual">
      <div className="group-orbit group-orbit-1" />
      <div className="group-orbit group-orbit-2" />
      <div className="group-orbit group-orbit-3" />

      <div className="group-monogram">
        M<span>N</span>GM
        <span className="group-dot">.</span>
      </div>

      <div className="group-sub">
        AN ECOSYSTEM OF IDEAS.
      </div>
    </div>
  );
}

/* ======================================
   PORTFOLIO
   ====================================== */

function Work() {
  return (
    <section
      id="work"
      className="work section-pad"
    >
      <Reveal className="section-kicker">
        <span className="kicker-dot" />
        THE PORTFOLIO / 002
      </Reveal>

      <div className="section-heading-row">
        <Reveal>
          <h2 className="massive-heading">
            SELECTED
            <br />
            <span>REALITIES.</span>
          </h2>
        </Reveal>

        <Reveal>
          <p className="heading-aside">
            A selection of our own products,
            identities, and experiments.
            Built to push boundaries.
          </p>
        </Reveal>
      </div>

      <div className="project-list">
        {projects.map((project, i) => (
          <Reveal
            key={project.name}
            className="project-row"
            delay={i * 0.08}
          >
            <div className="project-topline">
              <span>/{project.number}</span>
              <span>{project.category}</span>
              <span>{project.tag}</span>
            </div>

            <motion.div
              className="project-card"
              whileHover={{
                scale: 0.985,
              }}
              transition={{
                duration: 0.4,
              }}
              style={{
                "--project-color":
                  project.color,
              }}
            >
              <ProjectVisual
                project={project}
              />

              <div className="project-info">
                <div>
                  <h3>{project.name}</h3>
                  <p>
                    {project.description}
                  </p>
                </div>

                <div
                  className="project-arrow"
                  aria-hidden="true"
                >
                  <ArrowUpRight size={29} />
                </div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal className="work-footer">
        <span>
          IN-HOUSE PROJECTS & CONCEPTS
        </span>

        <span>
          BUILT TO EXPLORE WHAT'S POSSIBLE
        </span>
      </Reveal>
    </section>
  );
}

/* ======================================
   INTERACTIVE PLAYGROUND
   ====================================== */

function Playground() {
  const [word, setWord] = useState(0);
  const [color, setColor] = useState(ACCENT);
  const [style, setStyle] = useState("bold");
  const [rotation, setRotation] = useState(-7);
  const [size, setSize] = useState(100);

  const [shapes, setShapes] = useState([
    { x: 15, y: 25, s: 100, r: 20 },
    { x: 75, y: 65, s: 65, r: 50 },
    { x: 50, y: 15, s: 35, r: 0 },
  ]);

  const playRef = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(
      my,
      [-0.5, 0.5],
      [12, -12]
    )
  );

  const rotateY = useSpring(
    useTransform(
      mx,
      [-0.5, 0.5],
      [-15, 15]
    )
  );

  const randomize = () => {
    setWord(
      Math.floor(
        Math.random() * words.length
      )
    );

    setColor(
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ]
    );

    setRotation(
      Math.floor(Math.random() * 36) -
        18
    );

    setSize(
      Math.floor(Math.random() * 45) +
        65
    );

    setStyle(
      Math.random() > 0.5
        ? "outline"
        : "bold"
    );

    setShapes(
      Array.from(
        {
          length:
            3 +
            Math.floor(
              Math.random() * 4
            ),
        },
        () => ({
          x: Math.random() * 75 + 10,
          y: Math.random() * 65 + 15,
          s: Math.random() * 75 + 30,
          r: Math.random() * 360,
        })
      )
    );
  };

  const move = (event) => {
    if (
      window.matchMedia("(pointer: coarse)")
        .matches
    ) {
      return;
    }

    const rect =
      playRef.current?.getBoundingClientRect();

    if (!rect) return;

    mx.set(
      (event.clientX - rect.left) /
        rect.width -
        0.5
    );

    my.set(
      (event.clientY - rect.top) /
        rect.height -
        0.5
    );
  };

  return (
    <section
      id="playground"
      className="playground section-pad"
    >
      <Reveal className="section-kicker">
        <span className="kicker-dot" />
        THE EXPERIMENT / 003
      </Reveal>

      <div className="playground-heading">
        <Reveal>
          <h2 className="massive-heading">
            DON'T JUST
            <br />
            <span>LOOK. PLAY.</span>
          </h2>
        </Reveal>

        <Reveal>
          <p>
            This isn't a screenshot.
            It's a live interactive canvas.
            Change everything. Break the rules.
          </p>
        </Reveal>
      </div>

      <Reveal className="playground-interface">
        <div className="playground-toolbar">
          <div className="toolbar-title">
            <span className="live-dot" />
            MNGM LAB / INTERACTIVE ENGINE
          </div>

          <div className="toolbar-right">
            <span>EXPERIMENT_001</span>
            <span>● LIVE</span>
          </div>
        </div>

        <div
          className="playground-canvas"
          ref={playRef}
          onPointerMove={move}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
        >
          <div className="playground-grid" />

          {shapes.map((shape, i) => (
            <motion.div
              key={i}
              className={`play-shape play-shape-${
                i % 3
              }`}
              drag
              dragMomentum={false}
              dragConstraints={playRef}
              whileDrag={{
                scale: 1.15,
                zIndex: 10,
              }}
              data-cursor
              aria-label="Draggable playground shape"
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: shape.s,
                height: shape.s,
                rotate: shape.r,
                borderColor: color,
                background:
                  i % 3 === 0
                    ? color
                    : "transparent",
              }}
            />
          ))}

          <motion.div
            className={`playground-word ${
              style === "outline"
                ? "play-outline"
                : ""
            }`}
            style={{
              rotateX,
              rotateY,
              rotateZ: rotation,
              color,
              WebkitTextStrokeColor:
                color,
              fontSize: `clamp(28px, ${
                size / 10
              }vw, 160px)`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={word}
                initial={{
                  opacity: 0,
                  scale: 1.4,
                  filter: "blur(20px)",
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  scale: 0.5,
                  filter: "blur(20px)",
                }}
                transition={{
                  duration: 0.4,
                }}
              >
                {words[word]}.
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <div className="canvas-corner top-left">
            X: 00 / Y: 00
          </div>

          <div className="canvas-corner bottom-left">
            DRAG OBJECTS TO REARRANGE ↗
          </div>

          <div className="canvas-corner bottom-right">
            MNGM / REALTIME
          </div>
        </div>

        <div className="playground-controls">
          <div className="control-group">
            <label>
              01 / COLOR SYSTEM
            </label>

            <div className="swatches">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={
                    color === c
                      ? "swatch active"
                      : "swatch"
                  }
                  style={{
                    background: c,
                  }}
                  onClick={() =>
                    setColor(c)
                  }
                  aria-label={`Select ${c}`}
                  aria-pressed={
                    color === c
                  }
                />
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>
              02 / TYPOGRAPHY
            </label>

            <div className="control-buttons">
              <button
                type="button"
                className={
                  style === "bold"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setStyle("bold")
                }
              >
                SOLID
              </button>

              <button
                type="button"
                className={
                  style === "outline"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setStyle("outline")
                }
              >
                OUTLINE
              </button>
            </div>
          </div>

          <div className="control-group slider-group">
            <label htmlFor="rotation">
              03 / ROTATION
              <span>
                {rotation}°
              </span>
            </label>

            <input
              id="rotation"
              type="range"
              min="-45"
              max="45"
              value={rotation}
              onChange={(event) =>
                setRotation(
                  Number(
                    event.target.value
                  )
                )
              }
            />
          </div>

          <div className="control-group slider-group">
            <label htmlFor="scale">
              04 / SCALE
              <span>
                {size}%
              </span>
            </label>

            <input
              id="scale"
              type="range"
              min="50"
              max="130"
              value={size}
              onChange={(event) =>
                setSize(
                  Number(
                    event.target.value
                  )
                )
              }
            />
          </div>

          <button
            type="button"
            className="random-button"
            onClick={randomize}
          >
            <Shuffle size={18} />
            RANDOMIZE
          </button>
        </div>
      </Reveal>
    </section>
  );
}

/* ======================================
   SERVICES
   ====================================== */

function Services() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="services"
      className="services section-pad"
    >
      <Reveal className="section-kicker">
        <span className="kicker-dot" />
        WHAT WE DO / 004
      </Reveal>

      <div className="section-heading-row">
        <Reveal>
          <h2 className="massive-heading">
            WE BUILD
            <br />
            <span>
              THE FEELING.
            </span>
          </h2>
        </Reveal>

        <Reveal>
          <p className="heading-aside">
            Every detail matters.
            Every interaction has a purpose.
            Every pixel should earn its place.
          </p>
        </Reveal>
      </div>

      <div className="service-list">
        {services.map((service, i) => {
          const Icon = service.icon;

          return (
            <div
              className={`service-item ${
                open === i
                  ? "service-open"
                  : ""
              }`}
              key={service.name}
            >
              <button
                type="button"
                className="service-trigger"
                onClick={() =>
                  setOpen(
                    open === i ? -1 : i
                  )
                }
                aria-expanded={
                  open === i
                }
              >
                <span className="service-number">
                  {service.number}
                </span>

                <span className="service-name">
                  {service.name}
                </span>

                <span className="service-icon">
                  {open === i ? (
                    <X />
                  ) : (
                    <Plus />
                  )}
                </span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    className="service-detail"
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: EASE,
                    }}
                  >
                    <div className="service-detail-inner">
                      <Icon
                        size={45}
                        strokeWidth={1}
                      />

                      <p>
                        {service.description}
                      </p>

                      <ContactButton className="service-contact-button">
                        LET'S BUILD IT
                      </ContactButton>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ======================================
   STATEMENT
   ====================================== */

function Statement() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const x1 = useTransform(
    scrollYProgress,
    [0, 1],
    ["-15%", "15%"]
  );

  const x2 = useTransform(
    scrollYProgress,
    [0, 1],
    ["15%", "-15%"]
  );

  return (
    <section
      className="statement"
      ref={ref}
    >
      <div className="statement-label">
        A DIFFERENT KIND OF DIGITAL STUDIO
      </div>

      <motion.div
        className="statement-line"
        style={{ x: x1 }}
      >
        MAKE IT <span>LOUD.</span>
      </motion.div>

      <motion.div
        className="statement-line statement-outline"
        style={{ x: x2 }}
      >
        MAKE IT <span>MATTER.</span>
      </motion.div>

      <motion.div
        className="statement-line"
        style={{ x: x1 }}
      >
        MAKE IT <span>REAL.</span>
      </motion.div>
    </section>
  );
}

/* ======================================
   CONTACT
   ====================================== */

function Contact() {
  const { copy, copied, failed } =
    usePhoneCopy();

  return (
    <section
      id="contact"
      className="contact"
    >
      <div className="contact-inner">
        <div className="contact-top">
          <span>
            HAVE AN IDEA? GOOD.
          </span>

          <span>
            LET'S MAKE IT IMPOSSIBLE TO IGNORE.
          </span>
        </div>

        <Reveal>
          <h2>
            LET'S MAKE
            <br />
            <span>SOME NOISE.</span>
          </h2>
        </Reveal>

        <div className="contact-actions">
          <ContactButton className="contact-main-button">
            START A PROJECT
          </ContactButton>

          <button
            type="button"
            className="copy-email"
            onClick={copy}
          >
            <span aria-live="polite">
              {copied
                ? "NUMBER COPIED ✓"
                : failed
                ? "COPY FAILED — TRY AGAIN"
                : "(435) 278-2290 ↗"}
            </span>
          </button>
        </div>

        <footer className="contact-footer">
          <a
            href="#home"
            className="footer-logo"
            aria-label="Back to top"
          >
            MNGM<span>.</span>
            <small>STUDIOS®</small>
          </a>

          <div className="footer-links">
            <a href="#work">
              WORK
            </a>

            <a href="#services">
              SERVICES
            </a>

            <a href="#playground">
              PLAYGROUND
            </a>
          </div>

          <span>
            © {new Date().getFullYear()} MNGM
            STUDIOS
          </span>
        </footer>
      </div>
    </section>
  );
}

/* ======================================
   ORIGINAL LOADING SCREEN
   ====================================== */

function LoadingScreen({ onDone }) {
  const [progress, setProgress] =
    useState(0);

  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }

    const duration = 1850;
    const start = performance.now();

    let frame;

    const update = (now) => {
      const elapsed = now - start;

      const t = Math.min(
        elapsed / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - t, 3);

      setProgress(
        Math.round(eased * 100)
      );

      if (t < 1) {
        frame = requestAnimationFrame(
          update
        );
      } else {
        frame = requestAnimationFrame(
          () => {
            setTimeout(onDone, 350);
          }
        );
      }
    };

    frame = requestAnimationFrame(
      update
    );

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [onDone, reduced]);

  return (
    <motion.div
      className="loading-screen"
      exit={{
        y: "-100%",
      }}
      transition={{
        duration: 1,
        ease: EASE,
      }}
    >
      <div className="loading-top">
        <span>
          MNGM STUDIOS®
        </span>

        <span>
          INDEPENDENT CREATIVE STUDIO
        </span>
      </div>

      <div className="loading-center">
        <div className="loading-logo">
          MNGM<span>.</span>
        </div>

        <div className="loading-subtitle">
          MAKING DIGITAL FEEL ALIVE
        </div>
      </div>

      <div className="loading-bottom">
        <span>
          INITIALIZING EXPERIENCE
        </span>

        <div className="loading-progress">
          {progress}
          <small>%</small>
        </div>
      </div>

      <div className="loading-bar">
        <div
          className="loading-bar-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </motion.div>
  );
}

/* ======================================
   SCROLL PROGRESS
   ====================================== */

function ProgressBar() {
  const { scrollYProgress } =
    useScroll();

  return (
    <motion.div
      className="scroll-progress"
      style={{
        scaleX: scrollYProgress,
      }}
    />
  );
}

/* ======================================
   MAIN APP
   ====================================== */

export default function App() {
  const [loading, setLoading] =
    useState(true);

  const finishLoading = React.useCallback(
    () => {
      setLoading(false);
    },
    []
  );

  return (
    <div className="app">
      <ProgressBar />
      <Cursor />
      <BackgroundCanvas />

      <AnimatePresence>
        {loading && (
          <LoadingScreen
            onDone={finishLoading}
          />
        )}
      </AnimatePresence>

      <Navigation />

      <main>
        <Hero />
        <Marquee />
        <Intro />
        <Work />
        <Playground />
        <Services />
        <Statement />
        <Contact />
      </main>
    </div>
  );
}
