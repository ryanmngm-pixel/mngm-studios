import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";

import ParticleWorld from "./ParticleWorld";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { EASE, LITE } from "./site";
import { Tilt } from "./Depth";
import { projects, getFeaturedProjects } from "./projects";
import { getBrandAssets, getBrandInitials } from "./brandAssets";

import "./Work.css";

const logoCache = new Map();

function validURL(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

/* Shared chrome, kept under the old names so existing pages keep working. */
export const PortfolioHeader = SiteHeader;
export const PortfolioFooter = SiteFooter;

/* PROJECT COVER (fallback art when a site can't be shown live) */

export function ProjectCover({ project, eager = false }) {
  const [failedCover, setFailedCover] = useState(null);

  return (
    <div
      className="pw-cover"
      style={{
        "--project-accent": project.accent || "#a5b2ff",
        background: project.background || "#10131d",
      }}
    >
      {project.cover && failedCover !== project.cover ? (
        <img
          src={project.cover}
          alt={`${project.title} website`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailedCover(project.cover)}
        />
      ) : (
        <div className="pw-cover-placeholder">
          <div className="pw-cover-wordmark">{project.title}</div>
          <small>{project.tagline}</small>
        </div>
      )}
    </div>
  );
}

/* AUTOMATIC BRAND LOGOS */

function BrandLogo({ project }) {
  const candidates = useMemo(() => getBrandAssets(project), [project]);
  const cacheKey = JSON.stringify(candidates);

  return (
    <BrandLogoImage
      key={cacheKey}
      project={project}
      candidates={candidates}
      cacheKey={cacheKey}
    />
  );
}

function BrandLogoImage({ project, candidates, cacheKey }) {
  const [cachedSource] = useState(() => logoCache.get(cacheKey) || "");
  const [source, setSource] = useState(cachedSource);
  const [loading, setLoading] = useState(!cachedSource && candidates.length > 0);

  useEffect(() => {
    if (cachedSource || candidates.length === 0) return;

    let cancelled = false;
    let currentImage = null;
    let timeout = null;

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
  }, [candidates, cacheKey, cachedSource]);

  return (
    <div
      className="pw-logo"
      style={{
        "--orb-background":
          project.background || "#161616",

        "--orb-accent":
          project.accent || "#ffffff",
      }}
      aria-busy={loading}
    >
      
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
            className="pw-logo-initials"
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

/* LIVE SITE FRAME
   Renders the real website at desktop width (1440px) and scales it down
   to fit, so every card shows the work exactly as visitors see it. */

export function SiteFrame({ project, eager = false }) {
  const url = validURL(project.preview || project.website);
  const viewport = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () =>
      setSize({ width: element.clientWidth, height: element.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = size.width / 1440 || 0.5;

  return (
    <div className="pw-frame" style={{ "--project-accent": project.accent || "#a5b2ff" }}>
      <div className="pw-frame-bar" aria-hidden="true">
        <span className="pw-frame-dots"><i /><i /><i /></span>
        <span className="pw-frame-address">{url ? url.hostname.replace(/^www\./, "") : project.title}</span>
      </div>

      <div className="pw-frame-viewport" ref={viewport}>
        <ProjectCover project={project} eager={eager} />

        {/* A static `cover` screenshot in projects.js takes priority over the live site */}
        {url && !project.cover && size.width > 0 && (
          <iframe
            title={`${project.title} website`}
            src={url.href}
            className={`pw-frame-iframe ${loaded ? "is-loaded" : ""}`}
            loading={eager ? "eager" : "lazy"}
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            tabIndex={-1}
            aria-hidden="true"
            onLoad={() => setLoaded(true)}
            style={{
              width: 1440,
              height: size.height / scale,
              transform: `scale(${scale})`,
            }}
          />
        )}
      </div>
    </div>
  );
}

/* PROJECT CARD */

/* The frame swings up out of the page as it scrolls into view. */
function DepthFrame({ project, flip }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.6"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [32, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [flip ? 10 : -10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);

  return (
    <motion.div
      ref={ref}
      className="pw-depth"
      style={reduced ? undefined : LITE ? { opacity } : { rotateX, rotateY, scale, opacity, transformPerspective: 1400 }}
    >
      <Tilt className="pw-tilt" track=".pw-card" max={6}>
        <SiteFrame project={project} />
      </Tilt>
    </motion.div>
  );
}

export function ProjectCard({ project, index = 0, layout = "grid" }) {
  const reduced = useReducedMotion();
  const website = validURL(project.website);

  return (
    <motion.article
      className={`pw-card pw-card--${layout}`}
      data-cursor="View project"
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : index * 0.08, ease: EASE }}
    >
      <DepthFrame project={project} flip={layout === "feature-flip" || index % 2 === 1} />

      <div className="pw-card-body">
        <div className="pw-card-heading">
          <BrandLogo project={project} />
          <div>
            <h3>
              <a href={`/work/${project.slug}`} className="pw-card-link">
                {project.title}
              </a>
            </h3>
            <p>{project.tagline}</p>
          </div>
        </div>

        {layout.startsWith("feature") && <p className="pw-card-description">{project.description}</p>}

        <ul className="pw-card-tags" aria-label="Services">
          {project.services.map((service) => (
            <li key={service}>{service}</li>
          ))}
          <li className="pw-card-year">{project.year}</li>
        </ul>

        <div className="pw-card-actions">
          <span className="pw-card-case" aria-hidden="true">
            View case study <ArrowRight size={16} strokeWidth={1.75} />
          </span>
          {website && (
            <a
              className="pw-card-visit"
              data-cursor="Visit site"
              href={website.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit site <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* HOMEPAGE WORK GRID */

export function FeaturedWork() {
  const featured = getFeaturedProjects();

  return (
    <div className="pw-featured-work">
      <div className="pw-grid">
        {featured.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </div>
  );
}

/* CLOSING CTA (work + case study pages) */

export function PortfolioCTA() {
  return (
    <section className="pw-cta">
      <div className="pw-container">
        <div className="pw-cta-inner">
          <h2>Your project could be the next one here.</h2>
          <div className="pw-cta-side">
            <p>Tell us what you're building. We'll come back with ideas, a plan, and a clear price.</p>
            <a href="/contact" className="pw-button">
              Start a project <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* WORK PAGE */

export default function Work() {
  const reduced = useReducedMotion();

  return (
    <div className="pw-site">
      <ParticleWorld />
      <SiteHeader />

      <main className="pw-content" id="top">
        <section className="pw-hero">
          <div className="pw-container">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 1, ease: EASE }}
            >
              <h1>Selected work</h1>
              <p>
                Websites for nonprofits, new brands, and growing businesses. Each one is shown live, exactly as
                visitors see it today.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="pw-collection">
          <div className="pw-container">
            {projects.length ? (
              <div className="pw-list">
                {projects.map((project, index) => (
                  <ProjectCard key={project.slug} project={project} index={0} layout={index % 2 ? "feature-flip" : "feature"} />
                ))}
              </div>
            ) : (
              <p className="pw-empty">New work is on the way.</p>
            )}
          </div>
        </section>

        <PortfolioCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
