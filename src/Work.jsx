
import {
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

import { createPortal } from "react-dom";

import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Globe,
  Monitor,
  Image as ImageIcon,
  Asterisk,
} from "lucide-react";

import ParticleWorld from "./ParticleWorld";

import {
  projects,
  getFeaturedProjects,
} from "./projects";

import {
  getBrandAssets,
  getBrandInitials,
} from "./brandAssets";

import "./Work.css";

const EASE = [0.22, 1, 0.36, 1];

const LINKS = [
  ["Studio", "/#studio"],
  ["Work", "/work"],
  ["Services", "/#services"],
  ["Investment", "/#investment"],
];

const logoCache = new Map();

function validURL(value) {
  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

/* HEADER */

export function PortfolioHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

    const close = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const resize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", close);
    window.addEventListener("resize", resize);

    return () => {
      document.body.style.overflow = previous;

      window.removeEventListener("keydown", close);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  return (
    <>
      <header
        className={`pw-header ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        <a className="pw-brand" href="/">
          <strong>
            MNGM<span>.</span>
          </strong>

          <small>STUDIOS</small>
        </a>

        <nav
          className="pw-nav"
          aria-label="Main navigation"
        >
          {LINKS.map(([name, link]) => (
            <a
              key={name}
              href={link}
              className={
                name === "Work" ? "is-active" : ""
              }
            >
              {name}
            </a>
          ))}
        </nav>

        <a
          className="pw-header-contact"
          href="/contact"
        >
          Let's talk
          <ArrowUpRight size={16} />
        </a>

        <button
          type="button"
          className="pw-menu-toggle"
          aria-label={
            open ? "Close menu" : "Open menu"
          }
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="pw-mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            {[
              ...LINKS,
              ["Contact", "/contact"],
            ].map(([name, link], index) => (
              <a
                key={name}
                href={link}
                onClick={() => setOpen(false)}
              >
                <small>0{index + 1}</small>

                {name}

                <ArrowUpRight />
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

/* FOOTER */

export function PortfolioFooter() {
  return (
    <footer className="pw-footer">
      <div className="pw-container">
        <div className="pw-footer-main">
          <a href="/" className="pw-brand">
            <strong>
              MNGM<span>.</span>
            </strong>

            <small>STUDIOS</small>
          </a>

          <nav aria-label="Footer navigation">
            {LINKS.map(([name, link]) => (
              <a key={name} href={link}>
                {name}
              </a>
            ))}
          </nav>

          <a
            href="/contact"
            className="pw-text-link"
          >
            Start a project
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="pw-footer-bottom">
          <span>
            © {new Date().getFullYear()} MNGM Studios.
          </span>

          <span>Designed with intention.</span>
        </div>
      </div>
    </footer>
  );
}

/* PROJECT SCREENSHOT */

export function ProjectCover({
  project,
  eager = false,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [project.cover]);

  return (
    <div
      className="pw-cover"
      style={{
        "--project-accent":
          project.accent || "#ff784f",

        background:
          project.background || "#141414",
      }}
    >
      {project.cover && !failed ? (
        <img
          src={project.cover}
          alt={`${project.title} website`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="pw-cover-placeholder">
          <div className="pw-cover-wordmark">
            {project.title}
          </div>

          <small>{project.tagline}</small>
        </div>
      )}
    </div>
  );
}

/* AUTOMATIC BRAND LOGOS */

function BrandLogo({ project }) {
  const candidates = useMemo(
    () => getBrandAssets(project),
    [
      project.logo,
      project.website,
      project.preview,
    ]
  );

  const cacheKey = candidates.join("|");

  const [source, setSource] = useState(
    () => logoCache.get(cacheKey) || ""
  );

  const [loading, setLoading] = useState(
    candidates.length > 0
  );

  useEffect(() => {
    let cancelled = false;
    let currentImage = null;
    let timeout = null;

    const cached = logoCache.get(cacheKey);

    if (cached) {
      setSource(cached);
      setLoading(false);
      return;
    }

    setSource("");
    setLoading(candidates.length > 0);

    function tryCandidate(index) {
      if (cancelled) return;

      if (index >= candidates.length) {
        setLoading(false);
        return;
      }

      const candidate = candidates[index];
      const image = new window.Image();

      currentImage = image;

      let settled = false;

      const next = () => {
        if (settled || cancelled) return;

        settled = true;

        clearTimeout(timeout);

        image.onload = null;
        image.onerror = null;

        tryCandidate(index + 1);
      };

      image.onload = () => {
        if (settled || cancelled) return;

        if (
          image.naturalWidth < 32 ||
          image.naturalHeight < 32
        ) {
          next();
          return;
        }

        settled = true;

        clearTimeout(timeout);

        logoCache.set(cacheKey, candidate);

        setSource(candidate);
        setLoading(false);
      };

      image.onerror = next;

      timeout = setTimeout(next, 3500);

      image.referrerPolicy = "no-referrer";
      image.src = candidate;
    }

    tryCandidate(0);

    return () => {
      cancelled = true;

      clearTimeout(timeout);

      if (currentImage) {
        currentImage.onload = null;
        currentImage.onerror = null;
      }
    };
  }, [candidates, cacheKey]);

  return (
    <div
      className="pw-brand-orb"
      style={{
        "--orb-background":
          project.background || "#161616",

        "--orb-accent":
          project.accent || "#ffffff",
      }}
      aria-busy={loading}
    >
      <div className="pw-orb-shine" />

      <AnimatePresence mode="wait">
        {source ? (
          <motion.img
            key={source}
            src={source}
            alt=""
            draggable="false"
            initial={{
              opacity: 0,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.4,
              ease: EASE,
            }}
            referrerPolicy="no-referrer"
            onError={() => {
              logoCache.delete(cacheKey);
              setSource("");
              setLoading(false);
            }}
          />
        ) : (
          <motion.span
            key="fallback"
            className="pw-orb-wordmark"
            initial={{ opacity: 0 }}
            animate={{
              opacity: loading ? 0.45 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {getBrandInitials(project)}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/* LIVE WEBSITE PREVIEW */

function LivePreview({
  project,
  position,
  onEnter,
  onLeave,
  onClose,
}) {
  const reduced = useReducedMotion();

  const url = validURL(
    project.preview || project.website
  );

  const website = validURL(project.website);

  const [mode, setMode] = useState(
    url ? "live" : "image"
  );

  const [size, setSize] = useState({
    width: 1200,
    height: 750,
  });

  const viewport = useRef(null);

  const scale = size.width / 1440;

  const frameHeight = size.height / scale;

  useEffect(() => {
    const element = viewport.current;

    if (!element) return;

    const measure = () => {
      setSize({
        width: Math.max(1, element.clientWidth),
        height: Math.max(1, element.clientHeight),
      });
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <motion.aside
      className="pw-live-preview"
      role="region"
      aria-label={`${project.title} website preview`}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        transformOrigin: position.origin,
      }}
      initial={{
        opacity: 0,
        scale: reduced ? 1 : 0.94,
        y: reduced ? 0 : 15,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: reduced ? 1 : 0.97,
        y: reduced ? 0 : 10,
      }}
      transition={{
        duration: reduced ? 0 : 0.38,
        ease: EASE,
      }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocusCapture={onEnter}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget
          )
        ) {
          onLeave();
        }
      }}
    >
      <div className="pw-browser-toolbar">
        <div className="pw-browser-dots">
          <span />
          <span />
          <span />
        </div>

        <div className="pw-browser-address">
          <Globe size={12} />

          <span>
            {url
              ? new URL(url).hostname
              : project.title}
          </span>
        </div>

        <button
          type="button"
          className="pw-preview-close"
          aria-label="Close preview"
          onClick={onClose}
        >
          <X size={17} />
        </button>
      </div>

      <div
        className="pw-browser-viewport"
        ref={viewport}
      >
        {mode === "live" && url ? (
          <iframe
            title={`${project.title} live preview`}
            src={url}
            className="pw-browser-iframe"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            tabIndex={-1}
            style={{
              width: 1440,
              height: frameHeight,
              transform: `scale(${scale})`,
            }}
          />
        ) : (
          <ProjectCover
            project={project}
            eager
          />
        )}
      </div>

      <div className="pw-preview-footer">
        <div className="pw-preview-name">
          <strong>{project.title}</strong>

          <small>
            {project.type === "internal"
              ? "Studio project"
              : "Client project"}
          </small>
        </div>

        <div className="pw-preview-actions">
          {url && (
            <button
              type="button"
              className="pw-preview-switch"
              aria-label={
                mode === "live"
                  ? "Show screenshot"
                  : "Show live website"
              }
              title={
                mode === "live"
                  ? "Show screenshot"
                  : "Show live website"
              }
              onClick={() =>
                setMode(
                  mode === "live" ? "image" : "live"
                )
              }
            >
              {mode === "live" ? (
                <ImageIcon size={15} />
              ) : (
                <Monitor size={15} />
              )}
            </button>
          )}

          <a
            href={`/work/${project.slug}`}
            className="pw-preview-case"
          >
            Case study

            <ArrowRight size={15} />
          </a>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="pw-preview-visit"
              aria-label={`Visit ${project.title}`}
              title="Visit website"
            >
              <ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

/* PREVIEW POSITIONING */

function getPreviewPosition(element) {
  const rect = element.getBoundingClientRect();

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw < 768) {
    const height = Math.min(540, vh * 0.75);

    return {
      left: 14,
      top: Math.max(12, (vh - height) / 2),
      width: vw - 28,
      height,
      origin: "50% 100%",
    };
  }

  const width = Math.min(
    vw - 48,
    Math.max(460, vw * 0.5)
  );

  const height = Math.min(
    width * 0.68,
    vh - 120
  );

  const center = rect.left + rect.width / 2;

  const left = Math.max(
    24,
    Math.min(
      center - width / 2,
      vw - width - 24
    )
  );

  const above = rect.top - height - 18;
  const below = rect.bottom + 18;

  const fitsAbove = above >= 100;
  const fitsBelow = below + height <= vh - 18;

  let top;

  if (fitsAbove) {
    top = above;
  } else if (fitsBelow) {
    top = below;
  } else {
    top = Math.max(
      100,
      Math.min(
        (vh - height) / 2,
        vh - height - 18
      )
    );
  }

  return {
    left,
    top,
    width,
    height,
    origin: fitsAbove
      ? "50% 100%"
      : "50% 0%",
  };
}

/* INTERACTIVE BRAND COLLECTION */

export function BrandCollection({ items }) {
  const [active, setActive] = useState(null);
  const [position, setPosition] = useState(null);

  const openTimer = useRef(null);
  const closeTimer = useRef(null);

  const trigger = useRef(null);
  const pinned = useRef(false);

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const close = () => {
    clearTimers();

    pinned.current = false;

    setActive(null);
    setPosition(null);
  };

  const activate = (
    project,
    element,
    immediate = false
  ) => {
    clearTimers();

    const show = () => {
      trigger.current = element;

      setPosition(
        getPreviewPosition(element)
      );

      setActive(project);
    };

    if (immediate) {
      show();
    } else {
      openTimer.current = setTimeout(
        show,
        180
      );
    }
  };

  const scheduleClose = () => {
    clearTimers();

    if (pinned.current) return;

    closeTimer.current = setTimeout(
      close,
      320
    );
  };

  useEffect(() => {
    return () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;

    const update = () => {
      if (trigger.current) {
        setPosition(
          getPreviewPosition(trigger.current)
        );
      }
    };

    const outside = (event) => {
      if (
        event.target instanceof Element &&
        !event.target.closest(
          ".pw-live-preview, .pw-brand-button"
        )
      ) {
        close();
      }
    };

    const keyboard = (event) => {
      if (event.key === "Escape") {
        close();
      }
    };

    const scroll = () => {
      if (pinned.current) {
        update();
      } else {
        close();
      }
    };

    window.addEventListener("resize", update);

    window.addEventListener("scroll", scroll, {
      passive: true,
    });

    document.addEventListener(
      "pointerdown",
      outside
    );

    document.addEventListener(
      "keydown",
      keyboard
    );

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", scroll);

      document.removeEventListener(
        "pointerdown",
        outside
      );

      document.removeEventListener(
        "keydown",
        keyboard
      );
    };
  }, [active]);

  return (
    <>
      <div
        className={`pw-brand-collection ${
          active ? "has-active" : ""
        }`}
      >
        {items.map((project) => {
          const selected =
            active?.slug === project.slug;

          return (
            <button
              key={project.slug}
              type="button"
              className={`pw-brand-button ${
                selected ? "is-active" : ""
              }`}
              aria-label={`Preview ${project.title}`}
              aria-expanded={selected}
              onPointerEnter={(event) => {
                if (
                  event.pointerType === "mouse" &&
                  !pinned.current
                ) {
                  activate(
                    project,
                    event.currentTarget
                  );
                }
              }}
              onPointerLeave={scheduleClose}
              onClick={(event) => {
                const mouse =
                  window.matchMedia(
                    "(hover: hover) and (pointer: fine)"
                  ).matches;

                if (mouse && event.detail > 0) {
                  window.location.href =
                    `/work/${project.slug}`;

                  return;
                }

                if (selected && pinned.current) {
                  close();
                } else {
                  pinned.current = true;

                  activate(
                    project,
                    event.currentTarget,
                    true
                  );
                }
              }}
            >
              <BrandLogo project={project} />

              <span className="pw-brand-name">
                {project.title}
              </span>

              <span className="pw-brand-category">
                {project.category}
              </span>

              <span className="pw-brand-indicator" />
            </button>
          );
        })}
      </div>

      {createPortal(
        <AnimatePresence mode="wait">
          {active && position && (
            <LivePreview
              key={active.slug}
              project={active}
              position={position}
              onEnter={clearTimers}
              onLeave={scheduleClose}
              onClose={close}
            />
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

/* REUSABLE PROJECT COMPONENT */

export function ProjectCard({ project }) {
  return (
    <BrandCollection items={[project]} />
  );
}

/* HOMEPAGE WORK SECTION */

export function FeaturedWork() {
  return (
    <div className="pw-featured-work">
      <BrandCollection
        items={getFeaturedProjects()}
      />

      <div className="pw-featured-bottom">
        <a
          href="/work"
          className="pw-text-link"
        >
          Explore all work

          <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}

/* CONTACT SECTION */

export function PortfolioCTA() {
  return (
    <section className="pw-cta">
      <div className="pw-container">
        <div className="pw-label">
          <span />
          THE NEXT PROJECT
        </div>

        <div className="pw-cta-layout">
          <h2>
            Yours could
            <br />

            <span>be next.</span>
          </h2>

          <a
            href="/contact"
            className="pw-cta-circle"
          >
            <ArrowUpRight strokeWidth={1} />

            <small>LET'S TALK</small>
          </a>
        </div>
      </div>
    </section>
  );
}

/* MAIN PORTFOLIO PAGE */

export default function Work() {
  const reduced = useReducedMotion();

  useEffect(() => {
    document.title =
      "Our Work — MNGM Studios";
  }, []);

  return (
    <div className="pw-site">
      <ParticleWorld />

      <PortfolioHeader />

      <main className="pw-content">
        <section className="pw-hero">
          <div className="pw-container">
            <motion.div
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                      y: 25,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reduced ? 0 : 1,
                ease: EASE,
              }}
            >
              <div className="pw-label">
                <span />
                THE COLLECTION
              </div>

              <h1>
                Ideas brought
                <br />

                <span>to life.</span>
              </h1>

              <p>
                Different brands. Different visions.
                <br />

                One studio.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pw-collection">
          <div className="pw-container">
            <motion.div
              initial={
                reduced
                  ? false
                  : {
                      opacity: 0,
                      y: 20,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reduced ? 0 : 0.9,
                delay: reduced ? 0 : 0.35,
                ease: EASE,
              }}
            >
              {projects.length ? (
                <BrandCollection items={projects} />
              ) : (
                <div className="pw-empty">
                  <Asterisk size={40} />
                  <p>More work is coming.</p>
                </div>
              )}

              <div className="pw-collection-hint">
                <span />

                <p className="pw-desktop-hint">
                  Hover over a brand to experience
                  its website.
                </p>

                <p className="pw-mobile-hint">
                  Tap a brand to explore.
                </p>

                <span />
              </div>
            </motion.div>
          </div>
        </section>

        <PortfolioCTA />
      </main>

      <PortfolioFooter />
    </div>
  );
}
