import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { EASE, NAV } from "./site";
import "./SiteChrome.css";


function currentPath() {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export function Wordmark({ className = "" }) {
  return (
    <a href="/" className={`sc-wordmark ${className}`} aria-label="MNGM Studios home">
      <span className="sc-wordmark-type">MNGM</span>
      <span className="sc-wordmark-dot" aria-hidden="true" />
      <span className="sc-wordmark-sub">Studios</span>
    </a>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const reduced = useReducedMotion();
  const path = currentPath();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const keydown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth >= 860) setOpen(false);
    };

    window.addEventListener("keydown", keydown);
    window.addEventListener("resize", resize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", resize);
    };
  }, [open]);

  return (
    <>
      <header className={`sc-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
        <div className="sc-header-inner">
          <Wordmark />

          <nav className="sc-nav" aria-label="Main navigation">
            {NAV.map(([title, href]) => (
              <a
                key={href}
                href={href}
                aria-current={path !== "/" && href.startsWith(path) ? "page" : undefined}
              >
                {title}
              </a>
            ))}
          </nav>

          <a className={`sc-cta ${path === "/contact" ? "is-hidden" : ""}`} href="/contact" tabIndex={path === "/contact" ? -1 : undefined} aria-hidden={path === "/contact" || undefined}>
            Start a project
            <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </a>

          <button
            type="button"
            ref={toggle}
            className="sc-menu-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="sc-mobile-menu"
          >
            {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="sc-mobile-menu"
            className="sc-mobile-menu"
            aria-label="Mobile navigation"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
          >
            {[...NAV, ["Contact", "/contact"]].map(([title, href], index) => (
              <motion.a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                initial={reduced ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.05 + index * 0.05, ease: EASE }}
              >
                {title}
                <ArrowUpRight size={26} strokeWidth={1.25} aria-hidden="true" />
              </motion.a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="sc-footer">
      <div className="sc-footer-inner">
        <div className="sc-footer-top">
          <div className="sc-footer-pitch">
            <p>An independent studio designing and building websites for businesses that refuse to blend in.</p>
            <a className="sc-footer-link" href="/contact">
              Start a project
              <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>
          </div>

          <nav className="sc-footer-nav" aria-label="Footer navigation">
            {[...NAV, ["Contact", "/contact"]].map(([title, href]) => (
              <a key={href} href={href}>{title}</a>
            ))}
          </nav>
        </div>

        <div className="sc-footer-mark" aria-hidden="true">
          MNGM<span />
        </div>

        <div className="sc-footer-bottom">
          <span>© {new Date().getFullYear()} MNGM Studios</span>
          <span>Independent web studio, made in Utah</span>
          <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
