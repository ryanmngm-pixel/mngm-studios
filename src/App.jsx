
import { useEffect, useRef, useState } from "react";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowDown,
  ArrowUpRight,
  Asterisk,
  Globe,
  Code2,
  Layers3,
  Fingerprint,
  Menu,
  X,
  Check,
} from "lucide-react";

import ParticleWorld from "./ParticleWorld";
import ContactPage from "./Contact";

import WorkPage, { FeaturedWork } from "./Work";
import Project from "./Project";

import "./ParticleWorld.css";
import "./App.css";

const EASE = [0.22, 1, 0.36, 1];

const NAV = [
  ["Studio", "/#studio"],
  ["Work", "/work"],
  ["Services", "/#services"],
  ["Investment", "/#investment"],
];

const SERVICES = [
  {
    title: "Web design",
    description:
      "Distinctive digital experiences designed around your business, your audience, and the impression you want to leave.",
    icon: Globe,
  },
  {
    title: "Development",
    description:
      "Custom-built, responsive websites engineered for speed, usability, and reliability.",
    icon: Code2,
  },
  {
    title: "Digital experiences",
    description:
      "Motion, interaction, and immersive digital experiences that bring your brand to life.",
    icon: Layers3,
  },
  {
    title: "Digital identity",
    description:
      "A distinct visual language that makes your business recognizable, consistent, and memorable.",
    icon: Fingerprint,
  },
];

const PACKAGES = [
  {
    name: "Essential",
    price: "$500",
    color: "#d9d7d0",
    subtitle: "Make the right first impression.",
    description:
      "A considered digital presence for businesses ready to establish themselves online.",
    features: [
      "Custom website design",
      "Responsive development",
      "Contact form integration",
      "Deployment",
    ],
  },
  {
    name: "Elevate",
    price: "$1,250",
    color: "#e4ad96",
    subtitle: "Built for your next chapter.",
    description:
      "A more expressive digital experience for businesses ready to stand apart.",
    features: [
      "Expanded website experience",
      "Custom motion and interaction",
      "Conversion-focused design",
      "Expanded functionality",
    ],
  },
  {
    name: "Signature",
    price: "Custom",
    color: "#bac2cb",
    subtitle: "Beyond expectations.",
    description:
      "A fully bespoke experience for ambitious businesses with unconventional ideas.",
    features: [
      "Bespoke creative direction",
      "Advanced development",
      "Immersive digital experiences",
      "Custom integrations",
    ],
  },
];

function Reveal({ children, className = "" }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduced
          ? false
          : { opacity: 0, y: 25 }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.1,
      }}
      transition={{
        duration: reduced ? 0 : 0.65,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

function Label({ number, children }) {
  return (
    <div className="m-label">
      <span className="m-dot" />
      {number} / {children}
    </div>
  );
}

function Brand() {
  return (
    <a
      href="/"
      className="m-brand"
      aria-label="MNGM Studios home"
    >
      <strong>
        MNGM<span>.</span>
      </strong>

      <small>STUDIOS</small>
    </a>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef(null);

  const reduced = useReducedMotion();

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 45);
    };

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const keydown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };

    const resize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", keydown);
    window.addEventListener("resize", resize);

    return () => {
      document.body.style.overflow = previous;

      window.removeEventListener(
        "keydown",
        keydown
      );

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, [open]);

  return (
    <>
      <header
        className={`m-header ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        <Brand />

        <nav
          className="m-nav"
          aria-label="Main navigation"
        >
          {NAV.map(([title, link]) => (
            <a key={link} href={link}>
              {title}
            </a>
          ))}
        </nav>

        <a
          className="m-header-contact"
          href="/contact"
        >
          Let's talk

          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
          />
        </a>

        <button
          type="button"
          className="m-menu-toggle"
          ref={menuButton}
          onClick={() => setOpen((value) => !value)}
          aria-label={
            open ? "Close menu" : "Open menu"
          }
          aria-expanded={open}
          aria-controls="m-mobile-menu"
        >
          {open ? (
            <X size={23} />
          ) : (
            <Menu size={23} />
          )}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="m-mobile-menu"
            className="m-mobile-menu"
            aria-label="Mobile navigation"
            initial={reduced ? false : { opacity: 0, y: -10 }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: reduced ? 0 : -7,
            }}
            transition={{
              duration: reduced ? 0 : 0.26,
              ease: EASE,
            }}
          >
            {[
              ...NAV,
              ["Contact", "/contact"],
            ].map(([title, link], i) => (
              <a
                key={link}
                href={link}
                onClick={() => setOpen(false)}
              >
                <small>0{i + 1}</small>

                {title}

                <ArrowUpRight />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function ProgressBar() {
  const bar = useRef(null);

  useEffect(() => {
    const update = () => {
      const max =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        max > 0
          ? Math.min(
              1,
              Math.max(0, window.scrollY / max)
            )
          : 0;

      if (bar.current) {
        bar.current.style.transform =
          `scaleX(${progress})`;
      }
    };

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="m-progress"
      aria-hidden="true"
    >
      <div ref={bar} />
    </div>
  );
}

function Hero() {
  const reduced = useReducedMotion();

  return (
    <section
      id="top"
      className="m-hero"
    >
      <div className="m-container m-hero-inner">
        <motion.div
          className="m-hero-content"
          initial={
            reduced
              ? false
              : { opacity: 0 }
          }
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
        >
          <div className="m-hero-eyebrow">
            <span className="m-dot" />
            INDEPENDENT DIGITAL STUDIO
          </div>

          <h1>
            {["Beyond", "ordinary."].map(
              (word, i) => (
                <span
                  className="m-title-mask"
                  key={word}
                >
                  <motion.span
                    className={
                      i === 1 ? "m-accent" : ""
                    }
                    initial={
                      reduced
                        ? false
                        : { y: "120%" }
                    }
                    animate={{ y: 0 }}
                    transition={{
                      duration: reduced ? 0 : 0.95,
                      delay:
                        reduced
                          ? 0
                          : 0.08 + i * 0.12,
                      ease: EASE,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              )
            )}
          </h1>

          <motion.div
            initial={
              reduced
                ? false
                : { opacity: 0, y: 15 }
            }
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: reduced ? 0 : 0.7,
              delay: reduced ? 0 : 0.38,
              ease: EASE,
            }}
          >
            <p>
              Digital experiences for businesses
              that refuse to blend in.
            </p>

            <a
              href="/contact"
              className="m-primary"
            >
              Start a project

              <ArrowUpRight size={18} />
            </a>
          </motion.div>
        </motion.div>

        <div className="m-hero-bottom">
          <span>UTAH, UNITED STATES</span>

          <a
            href="#studio"
            aria-label="Explore the studio"
          >
            <ArrowDown
              size={20}
              strokeWidth={1.4}
            />
          </a>

          <span>DESIGN IN MOTION</span>
        </div>
      </div>
    </section>
  );
}

function Studio() {
  return (
    <section
      id="studio"
      className="m-section m-studio"
    >
      <div className="m-container">
        <Reveal>
          <Label number="01">
            THE STUDIO
          </Label>

          <div className="m-studio-layout">
            <h2 className="m-display">
              The internet is
              <br />

              ordinary.
              <br />

              <span>
                Let's change that.
              </span>
            </h2>

            <div className="m-studio-copy">
              <Asterisk
                size={65}
                strokeWidth={0.9}
                className="m-accent"
              />

              <p>
                Your digital presence should be
                as ambitious as your business.
              </p>

              <p>
                We bring design, technology,
                and creative thinking together
                to build experiences that feel
                unmistakably yours.
              </p>

              <a
                className="m-text-link"
                href="#services"
              >
                What we do

                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SelectedWork() {
  return (
    <section
      id="work"
      className="m-section m-work"
    >
      <div className="m-container">
        <Reveal>
          <Label number="02">
            SELECTED WORK
          </Label>

          <div className="m-section-heading">
            <h2 className="m-display">
              Ideas in
              <br />

              <span>motion.</span>
            </h2>

            <p>
              A selection of ideas brought
              into the digital world.
            </p>
          </div>
        </Reveal>

        <FeaturedWork />
      </div>
    </section>
  );
}

function Services() {
  const [active, setActive] = useState(0);

  const reduced = useReducedMotion();

  const Icon = SERVICES[active].icon;

  return (
    <section
      id="services"
      className="m-section m-services"
    >
      <div className="m-container">
        <Reveal>
          <Label number="03">
            CAPABILITIES
          </Label>

          <div className="m-section-heading">
            <h2 className="m-display">
              Built without
              <br />

              <span>limits.</span>
            </h2>

            <p>
              Design meets engineering.
              <br />
              Intent meets execution.
            </p>
          </div>
        </Reveal>

        <div className="m-services-layout">
          <div className="m-service-list">
            {SERVICES.map((service, i) => {
              const selected = active === i;

              return (
                <article
                  key={service.title}
                  className={`m-service ${
                    selected ? "is-active" : ""
                  }`}
                  onPointerEnter={(event) => {
                    if (
                      event.pointerType === "mouse"
                    ) {
                      setActive(i);
                    }
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={selected}
                    aria-controls={
                      selected
                        ? `m-service-${i}`
                        : undefined
                    }
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                  >
                    <small>0{i + 1}</small>

                    <span>
                      {service.title}
                    </span>

                    <ArrowUpRight
                      size={25}
                      strokeWidth={1.5}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {selected && (
                      <motion.div
                        id={`m-service-${i}`}
                        className="m-service-description"
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
                          duration:
                            reduced ? 0 : 0.3,
                          ease: EASE,
                        }}
                      >
                        <p>
                          {service.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>

          <div
            className="m-capability-art"
            aria-hidden="true"
          >
            <div className="m-capability-orbit m-orbit-outer" />

            <div className="m-capability-orbit m-orbit-one" />

            <div className="m-capability-orbit m-orbit-two" />

            <AnimatePresence initial={false}>
              <motion.div
                className="m-capability-icon"
                key={active}
                initial={{
                  opacity: 0,
                  scale: reduced ? 1 : 0.88,
                  rotate: reduced ? 0 : -7,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: reduced ? 1 : 1.06,
                }}
                transition={{
                  duration: reduced ? 0 : 0.3,
                  opacity: { duration: reduced ? 0 : 0.18 },
                  ease: EASE,
                }}
              >
                <Icon
                  size={110}
                  strokeWidth={0.85}
                />

                <span>
                  CAPABILITY / 0{active + 1}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticket({ index }) {
  const item = PACKAGES[index];

  const reduced = useReducedMotion();

  return (
    <motion.div
      className="m-ticket"
      initial={false}
      animate={{
        backgroundColor: item.color,
      }}
      transition={{
        duration: reduced ? 0 : 0.32,
        ease: EASE,
      }}
    >
      <div className="m-ticket-texture" />

      <div className="m-ticket-top">
        <div>
          <strong>MNGM.</strong>
          <small>STUDIOS</small>
        </div>

        <Asterisk
          size={42}
          strokeWidth={1.1}
        />
      </div>

      <div className="m-ticket-edition">
        THE DIGITAL EXPERIENCE PASS
      </div>

      <div className="m-ticket-content">
        <AnimatePresence initial={false}>
          <motion.div
            className="m-ticket-info"
            key={index}
            initial={{
              opacity: 0,
              y: reduced ? 0 : 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: reduced ? 0 : -5,
            }}
            transition={{
              duration: reduced ? 0 : 0.28,
              opacity: { duration: reduced ? 0 : 0.16 },
              ease: EASE,
            }}
          >
            <small>
              ACCESS / 0{index + 1}
            </small>

            <h3>{item.name}</h3>

            <p>{item.subtitle}</p>

            <div className="m-ticket-price">
              <small>
                {item.price === "Custom"
                  ? "TAILORED INVESTMENT"
                  : "INVESTMENT FROM"}
              </small>

              <strong>
                {item.price}
              </strong>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="m-ticket-perforation">
        <span />
      </div>

      <div className="m-ticket-stub">
        <div>
          <small>
            ADMIT ONE BUSINESS
          </small>

          <strong>
            Your next chapter.
          </strong>
        </div>

        <div
          className="m-ticket-barcode"
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
}

function Investment() {
  const [active, setActive] = useState(0);

  const items = useRef([]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const center =
        window.innerHeight * 0.48;

      let closest = 0;
      let distance = Infinity;

      items.current.forEach((element, i) => {
        if (!element) return;

        const rect =
          element.getBoundingClientRect();

        const next = Math.abs(
          rect.top +
            rect.height / 2 -
            center
        );

        if (next < distance) {
          distance = next;
          closest = i;
        }
      });

      setActive(closest);
    };

    const scroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", scroll, {
      passive: true,
    });

    window.addEventListener("resize", scroll);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener(
        "scroll",
        scroll
      );

      window.removeEventListener(
        "resize",
        scroll
      );
    };
  }, []);

  return (
    <section
      className="m-section m-investment"
      id="investment"
    >
      <div className="m-container">
        <Reveal>
          <Label number="04">
            INVESTMENT
          </Label>

          <div className="m-section-heading">
            <h2 className="m-display">
              Your ticket to
              <br />

              <span>
                what's next.
              </span>
            </h2>

            <p>
              More than a website.
              <br />
              An investment in possibility.
            </p>
          </div>
        </Reveal>

        <div className="m-investment-layout">
          <div className="m-packages">
            {PACKAGES.map((item, i) => (
              <article
                key={item.name}
                ref={(element) => {
                  items.current[i] = element;
                }}
                className={`m-package ${
                  active === i ? "is-active" : ""
                }`}
              >
                <small className="m-package-index">
                  0{i + 1} / EXPERIENCE
                </small>

                <h3>{item.name}</h3>

                <div className="m-package-price">
                  {item.price}

                  {item.price !== "Custom" && (
                    <small>
                      {" "}
                      / starting at
                    </small>
                  )}
                </div>

                <p>
                  {item.description}
                </p>

                <ul>
                  {item.features.map((feature) => (
                    <li key={feature}>
                      <Check
                        size={15}
                        strokeWidth={1.4}
                      />

                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  className="m-text-link"
                  href="/contact"
                >
                  Explore this opportunity

                  <ArrowUpRight size={17} />
                </a>

                <div className="m-mobile-ticket">
                  <Ticket index={i} />
                </div>
              </article>
            ))}
          </div>

          <aside className="m-ticket-column">
            <div className="m-sticky-ticket">
              <Ticket index={active} />

              <div className="m-ticket-indicators">
                {PACKAGES.map((item, i) => (
                  <button
                    key={item.name}
                    type="button"
                    className={
                      active === i
                        ? "is-active"
                        : ""
                    }
                    aria-label={`View ${item.name}`}
                    aria-current={active === i}
                    onClick={() => {
                      const reduced =
                        window.matchMedia(
                          "(prefers-reduced-motion: reduce)"
                        ).matches;

                      items.current[i]?.scrollIntoView({
                        behavior:
                          reduced
                            ? "instant"
                            : "smooth",
                        block: "center",
                      });
                    }}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>

        <p className="m-pricing-note">
          Final pricing depends on your
          project's scope.
        </p>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section
      id="contact"
      className="m-section m-contact"
    >
      <div className="m-container">
        <Reveal>
          <Label number="05">
            THE NEXT STEP
          </Label>

          <div className="m-contact-layout">
            <h2 className="m-contact-title">
              Let's make
              <br />

              something
              <br />

              <span>matter.</span>
            </h2>

            <a
              className="m-contact-circle"
              href="/contact"
              aria-label="Start a project"
            >
              <ArrowUpRight strokeWidth={1} />

              <span>
                START A PROJECT
              </span>
            </a>
          </div>

          <p className="m-contact-copy">
            Your idea. Our expertise.
            <br />

            Let's see what we can build together.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="m-footer">
      <div className="m-container">
        <div className="m-footer-top">
          <Brand />

          <nav aria-label="Footer navigation">
            {NAV.map(([title, link]) => (
              <a
                key={link}
                href={link}
              >
                {title}
              </a>
            ))}

            <a href="/contact">
              Contact
            </a>
          </nav>

          <a
            className="m-back-top"
            href="#top"
          >
            Back to top

            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="m-footer-bottom">
          <span>
            © {new Date().getFullYear()} MNGM Studios.
          </span>

          <span>
            Designed with intention.
          </span>
        </div>
      </div>
    </footer>
  );
}

function Homepage() {
  useEffect(() => {
    document.title =
      "MNGM Studios — Beyond Ordinary";

    let frame;

    const scrollToSection = () => {
      const hash = window.location.hash.slice(1);

      if (!hash) return;

      const element =
        document.getElementById(hash);

      if (element) {
        element.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
      }
    };

    frame = requestAnimationFrame(
      scrollToSection
    );

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="m-site">
      <ParticleWorld />

      <ProgressBar />

      <Header />

      <main className="m-content">
        <Hero />
        <Studio />
        <SelectedWork />
        <Services />
        <Investment />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

function NotFound() {
  useEffect(() => {
    document.title =
      "Page not found — MNGM Studios";
  }, []);

  return (
    <div className="m-site">
      <Header />

      <main className="m-content">
        <section className="m-hero">
          <div className="m-container m-hero-inner">
            <div className="m-hero-content">
              <div className="m-hero-eyebrow">
                <span className="m-dot" />

                404 / PAGE NOT FOUND
              </div>

              <h2 className="m-display">
                Nothing
                <br />

                <span>here.</span>
              </h2>

              <br />

              <p>
                The page you're looking for
                doesn't exist or has moved.
              </p>

              <a href="/" className="m-primary">
                Back to home

                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  const path =
    window.location.pathname.replace(
      /\/+$/,
      ""
    ) || "/";

  if (path === "/contact") {
    return <ContactPage />;
  }

  if (path === "/work") {
    return <WorkPage />;
  }

  const projectMatch =
    path.match(/^\/work\/([^/]+)$/);

  if (projectMatch) {
    return (
      <Project slug={projectMatch[1]} />
    );
  }

  if (path === "/") {
    return <Homepage />;
  }

  return <NotFound />;
}
