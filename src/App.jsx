import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ArrowDown, ArrowRight, Check, Globe, Code2, Layers3, Fingerprint } from "lucide-react";

import ParticleWorld from "./ParticleWorld";
import ContactPage from "./Contact";
import WorkPage, { FeaturedWork } from "./Work";
import Project from "./Project";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { EASE } from "./site";

import "./ParticleWorld.css";
import "./App.css";

const SERVICES = [
  {
    title: "Web design",
    description:
      "Distinctive sites designed around your business, your audience, and the impression you want to leave.",
    details: ["Custom layouts", "Typography and color", "Mobile-first"],
    icon: Globe,
  },
  {
    title: "Development",
    description: "Hand-built, responsive websites engineered for speed, usability, and reliability.",
    details: ["Fast load times", "Contact forms", "Search-ready"],
    icon: Code2,
  },
  {
    title: "Motion and interaction",
    description: "Animation and immersive moments that make your brand feel alive, without slowing anyone down.",
    details: ["Scroll effects", "3D and WebGL", "Micro-interactions"],
    icon: Layers3,
  },
  {
    title: "Brand identity",
    description: "A visual language that makes your business recognizable, consistent, and memorable everywhere.",
    details: ["Logo refinement", "Visual systems", "Brand guidelines"],
    icon: Fingerprint,
  },
];

const PROCESS = [
  ["Discover", "We learn your business, your customers, and what the site needs to accomplish."],
  ["Design", "You see the look and feel early, and we refine it together until it feels right."],
  ["Build", "We develop a fast, responsive site and test it on phones, tablets, and desktops."],
  ["Launch", "We put it live, connect your contact form, and walk you through everything."],
];

const PACKAGES = [
  {
    name: "Essential",
    price: "$500",
    prefix: "From",
    description: "A considered online presence for businesses ready to establish themselves.",
    features: ["Custom website design", "Responsive development", "Contact form integration", "Deployment"],
  },
  {
    name: "Elevate",
    price: "$1,250",
    prefix: "From",
    description: "A more expressive site for businesses ready to stand apart from their competitors.",
    features: ["Expanded website experience", "Custom motion and interaction", "Conversion-focused design", "Expanded functionality"],
    highlight: true,
  },
  {
    name: "Signature",
    price: "Custom",
    prefix: "Quoted per project",
    description: "A fully bespoke experience for ambitious brands with unconventional ideas.",
    features: ["Bespoke creative direction", "Advanced development", "Immersive digital experiences", "Custom integrations"],
  },
];

function Reveal({ children, className = "", delay = 0, as = "div" }) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={reduced ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: EASE }}
    >
      {children}
    </Component>
  );
}

function SectionHeading({ title, children, aside }) {
  return (
    <Reveal className="m-heading">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {aside}
    </Reveal>
  );
}

function Hero() {
  const reduced = useReducedMotion();
  const lines = ["Beyond", "ordinary."];

  const fade = (delay) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.9, delay: reduced ? 0 : delay, ease: EASE },
  });

  return (
    <section id="top" className="m-hero">
      <div className="m-container m-hero-inner">
        <motion.p className="m-hero-kicker" {...fade(0.1)}>
          <span className="m-pulse" aria-hidden="true" />
          Independent web studio in Utah
        </motion.p>

        <h1 className="m-hero-title">
          {lines.map((line, index) => (
            <span className="m-mask" key={line}>
              <motion.span
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: reduced ? 0 : 1.15, delay: reduced ? 0 : 0.15 + index * 0.12, ease: EASE }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="m-hero-foot">
          <motion.p className="m-hero-lede" {...fade(0.55)}>
            We design and build custom websites for businesses that refuse to blend in.
          </motion.p>

          <motion.div className="m-hero-actions" {...fade(0.68)}>
            <a href="/contact" className="m-button">
              Start a project <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </a>
            <a href="#work" className="m-button m-button--ghost">
              See our work
            </a>
          </motion.div>
        </div>
      </div>

      <motion.a
        href="#studio"
        className="m-scroll-cue"
        aria-label="Scroll to learn about the studio"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 1.1 }}
      >
        <ArrowDown size={18} strokeWidth={1.5} />
      </motion.a>
    </section>
  );
}

function Studio() {
  return (
    <section id="studio" className="m-section m-studio">
      <div className="m-container">
        <Reveal as="p" className="m-statement">
          Your website is often the first conversation a customer has with your business.{" "}
          <span>We make sure it's one they remember.</span>
        </Reveal>

        <div className="m-studio-grid">
          <Reveal className="m-studio-col" delay={0.05}>
            <h3>Designed for you</h3>
            <p>No templates. Every site starts from a blank page and is shaped around your brand, your audience, and your goals.</p>
          </Reveal>
          <Reveal className="m-studio-col" delay={0.12}>
            <h3>Built properly</h3>
            <p>Fast, accessible, and responsive on every screen, with clean code that's easy to grow as your business does.</p>
          </Reveal>
          <Reveal className="m-studio-col" delay={0.19}>
            <h3>Made to move</h3>
            <p>Thoughtful motion and interaction that bring your brand to life without getting in anyone's way.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SelectedWork() {
  return (
    <section id="work" className="m-section m-work">
      <div className="m-container">
        <SectionHeading
          title="Selected work"
          aside={
            <a href="/work" className="m-link">
              View all work <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
          }
        >
          Live sites we've designed and built, shown exactly as visitors see them today.
        </SectionHeading>
        <FeaturedWork />
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="m-section m-services">
      <div className="m-container m-services-layout">
        <div className="m-services-intro">
          <SectionHeading title="What we do">
            Design and engineering under one roof, so nothing gets lost between the idea and the launch.
          </SectionHeading>
        </div>

        <ul className="m-service-list">
          {SERVICES.map(({ title, description, details, icon: Icon }, index) => (
            <Reveal as="li" key={title} className="m-service" delay={index * 0.06}>
              <div className="m-service-icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.4} />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul className="m-chips" aria-label={`${title} includes`}>
                  {details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section id="process" className="m-section m-process">
      <div className="m-container">
        <SectionHeading title="How it works">
          A simple, transparent process. You'll always know what's happening and what comes next.
        </SectionHeading>

        <ol className="m-steps">
          {PROCESS.map(([title, text], index) => (
            <Reveal as="li" key={title} className="m-step" delay={index * 0.08}>
              <span className="m-step-num" aria-hidden="true">{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="investment" className="m-section m-pricing">
      <div className="m-container">
        <SectionHeading title="Pricing">
          Clear starting points for every stage of business. Final pricing depends on your project's scope.
        </SectionHeading>

        <div className="m-plans">
          {PACKAGES.map((plan, index) => (
            <Reveal key={plan.name} className={`m-plan ${plan.highlight ? "is-highlight" : ""}`} delay={index * 0.08}>
              <div className="m-plan-top">
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className="m-plan-price">
                <small>{plan.prefix}</small>
                <strong>{plan.price}</strong>
              </div>

              <ul className="m-plan-features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} strokeWidth={2} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a href="/contact" className={`m-button ${plan.highlight ? "" : "m-button--ghost"} m-plan-cta`}>
                {plan.price === "Custom" ? "Request a quote" : `Start with ${plan.name}`}
                <ArrowUpRight size={17} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section id="contact" className="m-section m-closing">
      <div className="m-container">
        <Reveal as="h2" className="m-closing-title">
          Let's make something that matters.
        </Reveal>

        <Reveal className="m-closing-foot" delay={0.12}>
          <p>Tell us about your idea. We'll come back with thoughts, a plan, and a clear price.</p>
          <a href="/contact" className="m-button m-button--large">
            Start a project <ArrowUpRight size={20} strokeWidth={1.75} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Homepage() {
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const hash = window.location.hash.slice(1);
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="m-site">
      <ParticleWorld />
      <SiteHeader />

      <main className="m-content">
        <Hero />
        <Studio />
        <SelectedWork />
        <Services />
        <Process />
        <Pricing />
        <Closing />
      </main>

      <SiteFooter />
    </div>
  );
}

function NotFound() {
  return (
    <div className="m-site">
      <ParticleWorld />
      <SiteHeader />

      <main className="m-content">
        <section className="m-hero m-hero--compact" id="top">
          <div className="m-container m-hero-inner">
            <p className="m-hero-kicker">Error 404</p>
            <h1 className="m-hero-title">Lost in space.</h1>
            <div className="m-hero-foot">
              <p className="m-hero-lede">The page you're looking for doesn't exist or has moved.</p>
              <div className="m-hero-actions">
                <a href="/" className="m-button">
                  Back to home <ArrowUpRight size={18} strokeWidth={1.75} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/contact") return <ContactPage />;
  if (path === "/work") return <WorkPage />;

  const projectMatch = path.match(/^\/work\/([^/]+)$/);
  if (projectMatch) return <Project slug={projectMatch[1]} />;

  if (path === "/") return <Homepage />;

  return <NotFound />;
}
