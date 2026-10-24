
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
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
    description: "A new way for automotive shops to keep customers connected.",
    color: "#FF784F",
    type: "moovio",
    tag: "DIGITAL PRODUCT",
  },
  {
    number: "02",
    name: "SABL",
    category: "FINANCE / INTERFACE",
    description: "A bold exploration of the future of personal finance.",
    color: "#a3a0ff",
    type: "sabl",
    tag: "PRODUCT CONCEPT",
  },
  {
    number: "03",
    name: "MNGM GROUP",
    category: "IDENTITY / WEB",
    description: "A digital home for an expanding collection of ideas.",
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
    description: "Motion, micro-interactions, and moments people remember.",
    icon: MousePointer2,
  },
  {
    number: "04",
    name: "DIGITAL IDENTITY",
    description: "A cohesive visual language that makes your brand unmistakable.",
    icon: Globe2,
  },
];

const words = ["IMPOSSIBLE", "DIFFERENT", "UNREAL", "NEXT LEVEL", "MNGM"];
const colors = ["#FF784F", "#FFB36B", "#b8a3ff", "#65dcff", "#ffffff"];

async function copyPhone() {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(PHONE);
      return true;
    } catch {
      // Fall through to the legacy clipboard method.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = PHONE;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

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

  useEffect(() => () => clearTimeout(timer.current), []);

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

  return {
    copy,
    copied,
    failed,
    label: copied
      ? "NUMBER COPIED ✓"
      : failed
        ? "COPY FAILED — TRY AGAIN"
        : "COPY PHONE NUMBER",
  };
}

function ContactButton({
  children = "START A PROJECT",
  className = "",
  showIcon = true,
}) {
  const { copy, copied, failed } = usePhoneCopy();

  return (
    <button
      type="button"
      className={`${className} ${copied ? "contact-copied" : ""}`}
      onClick={copy}
      aria-label={copied ? "Phone number copied" : "Copy contact phone number"}
    >
      <span aria-live="polite">
        {copied
          ? "NUMBER COPIED ✓"
          : failed
            ? "COPY FAILED — TRY AGAIN"
            : children}
      </span>
      {showIcon && !copied && <ArrowUpRight size={18} />}
    </button>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 55, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.85, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Magnetic({ children, className = "", href, onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 16 });
  const sy = useSpring(y, { stiffness: 180, damping: 16 });

  const move = (e) => {
    if (!ref.current || window.matchMedia("(pointer: coarse)").matches) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.23);
    y.set((e.clientY - r.top - r.height / 2) * 0.23);
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
  };

  if (href) {
    return <motion.a href={href} {...props}>{children}</motion.a>;
  }

  return (
    <motion.button type="button" onClick={onClick} {...props}>
      {children}
    </motion.button>
  );
}

function Cursor() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 35 });
  const sy = useSpring(y, { stiffness: 500, damping: 35 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      setHovering(!!e.target.closest("a, button, [data-cursor]"));
    };

    const hide = () => setVisible(false);
    window.addEventListener("pointermove", move);
    document.addEventListener("mouseleave", hide);

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", hide);
    };
  }, [x, y]);

  return (
    <motion.div
      className="custom-cursor"
      style={{ x: sx, y: sy }}
      animate={{ opacity: visible ? 1 : 0, scale: hovering ? 2.7 : 1 }}
      transition={{ scale: { duration: 0.25 } }}
    />
  );
}

function BackgroundCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width;
    let height;
    let dpr;
    let frame;
    let particles = [];
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = Array.from(
        { length: Math.min(100, Math.floor((width * height) / 12000)) },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.3 + 0.3,
        })
      );
    };

    const move = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
        }

        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dist < 160 ? "#FF784Fcc" : "#ffffff44";
        ctx.fill();

        if (dist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255,120,79,${(1 - dist / 160) * 0.17})`;
          ctx.stroke();
        }

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);

          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 90) * 0.055})`;
            ctx.stroke();
          }
        }
      });

      if (!reduced) frame = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return <canvas ref={ref} className="background-canvas" aria-hidden="true" />;
}

function Navigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <>
      <header className="nav">
        <a href="#home" className="logo" onClick={() => setOpen(false)}>
          MNGM<span>.</span>
          <small>STUDIOS®</small>
        </a>

        <div className="nav-center">
          <span className="status-dot" />
          INDEPENDENT CREATIVE STUDIO
        </div>

        <div className="nav-actions">
          <ContactButton className="nav-contact">LET'S TALK</ContactButton>

          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu-overlay"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: EASE }}
          >
            <nav className="menu-inner">
              {[
                ["01", "HOME", "#home"],
                ["02", "WORK", "#work"],
                ["03", "PLAYGROUND", "#playground"],
                ["04", "SERVICES", "#services"],
              ].map(([n, name, link]) => (
                <a href={link} key={name} onClick={() => setOpen(false)}>
                  <span>{n}</span>
                  {name}
                  <ArrowUpRight />
                </a>
              ))}

              <div className="menu-contact">
                <ContactButton className="menu-contact-button">
                  05 — CONTACT
                </ContactButton>
              </div>

              <div className="menu-footer">
                MNGM STUDIOS — MAKE SOMETHING MATTER.
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Orb() {
  const [rotation, setRotation] = useState({ x: -18, y: 25 });
  const [dragging, setDragging] = useState(false);
  const start = useRef({});

  return (
    <div className="orb-scene">
      <div className="orb-halo" />

      <div
        className="orb-drag"
        data-cursor
        onPointerDown={(e) => {
          start.current = {
            x: e.clientX,
            y: e.clientY,
            rx: rotation.x,
            ry: rotation.y,
          };
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;

          setRotation({
            x: start.current.rx - (e.clientY - start.current.y) * 0.4,
            y: start.current.ry + (e.clientX - start.current.x) * 0.4,
          });
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <div className="orb-body">
          <div className="orb-core" />
          <div className="orb-ring ring-a" />
          <div className="orb-ring ring-b" />
          <div className="orb-ring ring-c" />
          <div className="orb-label">MNGM / EXPERIMENT 001</div>
        </div>
      </div>

      <div className="orb-instruction">
        <MousePointer2 size={13} />
        DRAG TO DISTORT REALITY
      </div>
    </div>
  );
}

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section id="home" className="hero" ref={ref}>
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

      <motion.div className="hero-content" style={{ y, opacity }}>
        <div className="hero-overline">
          <span className="asterisk">✳</span>
          NOT YOUR AVERAGE WEB STUDIO
        </div>

        <div className="hero-headline">
          {[
            ["WE MAKE", "hero-line"],
            ["DIGITAL", "hero-line hero-outline"],
            ["FEEL ALIVE.", "hero-line hero-accent"],
          ].map(([text, cls], i) => (
            <motion.div
              key={text}
              className={cls}
              initial={{ y: 130, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1.15,
                delay: 0.12 + i * 0.12,
                ease: EASE,
              }}
            >
              {text}
            </motion.div>
          ))}
        </div>

        <div className="hero-bottom">
          <p>
            We turn ambitious ideas into unforgettable digital experiences.
            No templates. No ordinary. No limits.
          </p>

          <Magnetic href="#work" className="round-arrow">
            <ArrowDown size={30} />
          </Magnetic>
        </div>
      </motion.div>

      <Orb />

      <div className="hero-side-label">
        SCROLL TO ENTER THE EXPERIENCE — 2026
      </div>

      <div className="hero-index">MNGM® — 001 / ∞</div>
    </section>
  );
}

function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i}>
            DESIGN ✳ DEVELOP ✳ DISRUPT ✳ REPEAT ✳&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}

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

        <Reveal delay={0.2} className="intro-right">
          <div className="intro-symbol">✳</div>

          <p>Most websites are forgotten the second you close the tab.</p>
          <p>We don't build those.</p>

          <p className="muted">
            MNGM Studios combines design, technology, and a healthy disregard
            for the ordinary to create things people actually remember.
          </p>

          <a href="#services" className="text-link">
            WHAT WE DO <ArrowUpRight size={19} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

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
            <strong>Everything in motion.</strong>

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

          <span className="sabl-small">ILLUSTRATIVE BALANCE</span>

          <div className="sabl-balance">
            $24,680<span>.50</span>
          </div>

          <svg viewBox="0 0 260 110" preserveAspectRatio="none">
            <defs>
              <linearGradient id="sablGradient" x1="0" y1="0" x2="0" y2="1">
                <stop stopColor="#b4a9ff" stopOpacity=".45" />
                <stop offset="1" stopColor="#b4a9ff" stopOpacity="0" />
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

        <div className="sabl-word">SABL</div>
      </div>
    );
  }

  return (
    <div className="project-visual group-visual">
      <div className="group-orbit group-orbit-1" />
      <div className="group-orbit group-orbit-2" />
      <div className="group-orbit group-orbit-3" />

      <div className="group-monogram">
        M<span>N</span>GM<span className="group-dot">.</span>
      </div>

      <div className="group-sub">AN ECOSYSTEM OF IDEAS.</div>
    </div>
  );
}

function Work() {
  return (
    <section id="work" className="work section-pad">
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
            A selection of our own products, identities, and experiments.
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
              whileHover={{ scale: 0.985 }}
              transition={{ duration: 0.4 }}
              style={{ "--project-color": project.color }}
            >
              <ProjectVisual project={project} />

              <div className="project-info">
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                </div>

                <div className="project-arrow">
                  <ArrowUpRight size={29} />
                </div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal className="work-footer">
        <span>IN-HOUSE PROJECTS & CONCEPTS</span>
        <span>BUILT TO EXPLORE WHAT'S POSSIBLE</span>
      </Reveal>
    </section>
  );
}

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
    useTransform(my, [-0.5, 0.5], [12, -12])
  );

  const rotateY = useSpring(
    useTransform(mx, [-0.5, 0.5], [-15, 15])
  );

  const randomize = () => {
    setWord(Math.floor(Math.random() * words.length));
    setColor(colors[Math.floor(Math.random() * colors.length)]);
    setRotation(Math.floor(Math.random() * 36) - 18);
    setSize(Math.floor(Math.random() * 45) + 65);
    setStyle(Math.random() > 0.5 ? "outline" : "bold");

    setShapes(
      Array.from(
        { length: 3 + Math.floor(Math.random() * 4) },
        () => ({
          x: Math.random() * 80 + 10,
          y: Math.random() * 70 + 15,
          s: Math.random() * 90 + 30,
          r: Math.random() * 360,
        })
      )
    );
  };

  const move = (e) => {
    const r = playRef.current?.getBoundingClientRect();
    if (!r) return;

    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section id="playground" className="playground section-pad">
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
            This isn't a screenshot. It's a live interactive canvas.
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
              className={`play-shape play-shape-${i % 3}`}
              drag
              dragMomentum={false}
              dragConstraints={playRef}
              whileDrag={{ scale: 1.2, zIndex: 10 }}
              data-cursor
              style={{
                left: `${shape.x}%`,
                top: `${shape.y}%`,
                width: shape.s,
                height: shape.s,
                rotate: shape.r,
                borderColor: color,
                background: i % 3 === 0 ? color : "transparent",
              }}
            />
          ))}

          <motion.div
            className={`playground-word ${
              style === "outline" ? "play-outline" : ""
            }`}
            style={{
              rotateX,
              rotateY,
              rotateZ: rotation,
              color,
              WebkitTextStrokeColor: color,
              fontSize: `clamp(32px, ${size / 10}vw, 160px)`,
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
                transition={{ duration: 0.4 }}
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
            <label>01 / COLOR SYSTEM</label>

            <div className="swatches">
              {colors.map((c) => (
                <button
                  key={c}
                  className={color === c ? "swatch active" : "swatch"}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>02 / TYPOGRAPHY</label>

            <div className="control-buttons">
              <button
                className={style === "bold" ? "selected" : ""}
                onClick={() => setStyle("bold")}
              >
                SOLID
              </button>
              <button
                className={style === "outline" ? "selected" : ""}
                onClick={() => setStyle("outline")}
              >
                OUTLINE
              </button>
            </div>
          </div>

          <div className="control-group slider-group">
            <label>
              03 / ROTATION <span>{rotation}°</span>
            </label>
            <input
              type="range"
              min="-45"
              max="45"
              value={rotation}
              onChange={(e) => setRotation(+e.target.value)}
            />
          </div>

          <div className="control-group slider-group">
            <label>
              04 / SCALE <span>{size}%</span>
            </label>
            <input
              type="range"
              min="50"
              max="130"
              value={size}
              onChange={(e) => setSize(+e.target.value)}
            />
          </div>

          <button className="random-button" onClick={randomize}>
            <Shuffle size={18} />
            RANDOMIZE
          </button>
        </div>
      </Reveal>
    </section>
  );
}

function Services() {
  const [open, setOpen] = useState(0);

  return (
    <section id="services" className="services section-pad">
      <Reveal className="section-kicker">
        <span className="kicker-dot" />
        WHAT WE DO / 004
      </Reveal>

      <div className="section-heading-row">
        <Reveal>
          <h2 className="massive-heading">
            WE BUILD
            <br />
            <span>THE FEELING.</span>
          </h2>
        </Reveal>

        <Reveal>
          <p className="heading-aside">
            Every detail matters. Every interaction has a purpose.
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
                open === i ? "service-open" : ""
              }`}
              key={service.name}
            >
              <button
                className="service-trigger"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
              >
                <span className="service-number">
                  {service.number}
                </span>
                <span className="service-name">
                  {service.name}
                </span>
                <span className="service-icon">
                  {open === i ? <X /> : <Plus />}
                </span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    className="service-detail"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <div className="service-detail-inner">
                      <Icon size={45} strokeWidth={1} />
                      <p>{service.description}</p>

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
    <section className="statement" ref={ref}>
      <div className="statement-label">
        A DIFFERENT KIND OF DIGITAL STUDIO
      </div>

      <motion.div className="statement-line" style={{ x: x1 }}>
        MAKE IT <span>LOUD.</span>
      </motion.div>

      <motion.div
        className="statement-line statement-outline"
        style={{ x: x2 }}
      >
        MAKE IT <span>MATTER.</span>
      </motion.div>

      <motion.div className="statement-line" style={{ x: x1 }}>
        MAKE IT <span>REAL.</span>
      </motion.div>
    </section>
  );
}

function Contact() {
  const { copy, copied, failed } = usePhoneCopy();

  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <div className="contact-top">
          <span>HAVE AN IDEA? GOOD.</span>
          <span>LET'S MAKE IT IMPOSSIBLE TO IGNORE.</span>
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
            className="copy-email"
            onClick={copy}
            type="button"
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

        <div className="contact-footer">
          <div className="footer-logo">
            MNGM<span>.</span>
            <small>STUDIOS®</small>
          </div>

          <div className="footer-links">
            <a href="#home">BACK TO TOP ↑</a>
            <a
              href="https://instagram.com/theprinceryan"
              target="_blank"
              rel="noreferrer"
            >
              INSTAGRAM ↗
            </a>
          </div>

          <span>© {new Date().getFullYear()} MNGM STUDIOS</span>
        </div>
      </div>
    </section>
  );
}

/* =========================================
   ORIGINAL MNGM PERCENTAGE LOADING SCREEN
   ========================================= */

function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const finished = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      onDone();
      return;
    }

    const duration = 2350;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 2.4);

      setProgress(Math.min(100, Math.floor(eased * 100)));

      if (elapsed < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setComplete(true);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  useEffect(() => {
    if (!complete) return;

    const timer = setTimeout(() => {
      if (finished.current) return;
      finished.current = true;
      onDone();
    }, 650);

    return () => clearTimeout(timer);
  }, [complete, onDone]);

  return (
    <motion.div
      className="loading-screen"
      initial={{ y: 0 }}
      exit={{
        y: "-100%",
        transition: {
          duration: 1,
          ease: EASE,
        },
      }}
    >
      <div className="loading-top">
        <span>MNGM STUDIOS®</span>
        <span>INDEPENDENT DIGITAL STUDIO</span>
      </div>

      <div className="loading-center">
        <motion.div
          className="loading-logo"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          MNGM<span>.</span>
        </motion.div>

        <div className="loading-subtitle">
          BUILDING SOMETHING DIFFERENT
        </div>
      </div>

      <div className="loading-bottom">
        <span>INITIALIZING EXPERIENCE</span>

        <div className="loading-progress">
          {String(progress).padStart(3, "0")}
          <small>%</small>
        </div>
      </div>

      <div className="loading-bar">
        <motion.div
          className="loading-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.08, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const finishLoading = React.useCallback(() => setLoading(false), []);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <div className="app">
      <AnimatePresence>
        {loading && (
          <LoadingScreen onDone={finishLoading} />
        )}
      </AnimatePresence>

      <motion.div
        className="scroll-progress"
        style={{ scaleX: scrollYProgress }}
      />

      <Cursor />
      <BackgroundCanvas />
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
