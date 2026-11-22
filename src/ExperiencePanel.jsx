
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  X,
  ArrowUpRight,
  Asterisk,
  Globe,
  Code2,
  Layers3,
  Fingerprint,
} from "lucide-react";

const packages = [
  {
    name: "Essential",
    price: "$500",
    subtitle: "Your first impression.",
    features: [
      "Custom website design",
      "Responsive mobile experience",
      "Contact form integration",
      "Basic technical SEO",
      "Website deployment",
    ],
  },
  {
    name: "Elevate",
    price: "$1,250",
    subtitle: "Designed to grow.",
    features: [
      "Expanded multi-page website",
      "Custom motion and interactions",
      "Conversion-focused structure",
      "Advanced visual direction",
      "Everything in Essential",
    ],
  },
  {
    name: "Signature",
    price: "Custom",
    subtitle: "Entirely unforgettable.",
    features: [
      "Immersive 3D experiences",
      "Bespoke development",
      "Advanced integrations",
      "Everything in Elevate",
    ],
  },
];

const titles = {
  studio: ["01", "The Studio"],
  work: ["02", "Selected Work"],
  services: ["03", "Capabilities"],
  pricing: ["04", "Investment"],
  contact: ["05", "Connect"],
};

function Action({ children }) {
  return (
    <a className="panel-action" href="/contact">
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}

function Studio() {
  return (
    <div className="panel-editorial">
      <div>
        <div className="panel-kicker">
          INDEPENDENT CREATIVE STUDIO
        </div>

        <h1>
          Beyond
          <br />
          <em>ordinary.</em>
        </h1>

        <p className="panel-lead">
          We design and engineer digital
          experiences for businesses built
          to stand apart.
        </p>
      </div>

      <div className="panel-editorial-side">
        <Asterisk
          className="panel-asterisk"
          strokeWidth={1}
        />

        <p>
          MNGM Studios brings design,
          engineering and digital
          interaction together.
        </p>

        <p>
          The internet doesn't need more
          ordinary. It needs experiences
          worth remembering.
        </p>

        <Action>Start a project</Action>
      </div>
    </div>
  );
}

function Work() {
  const projects = [
    {
      name: "Moovio",
      type: "SOFTWARE / AUTOMOTIVE",
      desc: "Connecting repair shops and their customers.",
      color: "#c85d38",
    },
    {
      name: "SABL",
      type: "FINANCE / INTERFACE",
      desc: "An exploration of personal finance.",
      color: "#8278b8",
    },
    {
      name: "MNGM.",
      type: "IDENTITY / WEB",
      desc: "A digital home for a collection of ideas.",
      color: "#a5967e",
    },
  ];

  return (
    <div>
      <div className="panel-kicker">
        PROJECTS & EXPLORATIONS
      </div>

      <h1>Ideas in <em>motion.</em></h1>

      <div className="panel-project-grid">
        {projects.map((project, index) => (
          <article
            className="panel-project"
            key={project.name}
          >
            <div
              className="panel-project-art"
              style={{
                "--project-color": project.color,
              }}
            >
              <span>0{index + 1}</span>
              <strong>{project.name}</strong>
            </div>

            <small>{project.type}</small>
            <h2>{project.name}</h2>
            <p>{project.desc}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Services() {
  const items = [
    [
      Globe,
      "Web design",
      "Distinctive digital experiences built around your business.",
    ],
    [
      Code2,
      "Development",
      "Responsive, custom-built websites engineered for usability and performance.",
    ],
    [
      Layers3,
      "Digital experiences",
      "Immersive motion, interaction and three-dimensional environments.",
    ],
    [
      Fingerprint,
      "Digital identity",
      "A recognizable visual language for your business.",
    ],
  ];

  return (
    <div>
      <div className="panel-kicker">
        DESIGN MEETS ENGINEERING
      </div>

      <h1>Built without <em>limits.</em></h1>

      <div className="panel-service-grid">
        {items.map(([Icon, title, desc]) => (
          <article key={title}>
            <Icon size={35} strokeWidth={1.2} />
            <h2>{title}</h2>
            <p>{desc}</p>
          </article>
        ))}
      </div>

      <Action>Let's build something</Action>
    </div>
  );
}

function Pricing() {
  const [active, setActive] = useState(0);

  const selected = packages[active];

  const refs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio -
              a.intersectionRatio
          );

        if (visible.length) {
          setActive(
            Number(visible[0].target.dataset.index)
          );
        }
      },
      {
        root: document.querySelector(
          ".experience-panel-scroll"
        ),
        threshold: 0.55,
      }
    );

    refs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <div className="panel-kicker">
        AN INVESTMENT IN WHAT'S NEXT
      </div>

      <h1>
        Your ticket
        <br />
        to <em>what's next.</em>
      </h1>

      <div className="panel-pricing-layout">
        <div>
          {packages.map((item, index) => (
            <article
              className="panel-package"
              key={item.name}
              data-index={index}
              ref={(element) => {
                refs.current[index] = element;
              }}
            >
              <small>EXPERIENCE / 0{index + 1}</small>

              <h2>{item.name}</h2>

              <strong>{item.price}</strong>

              <p>{item.subtitle}</p>

              <ul>
                {item.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <Action>Discuss this experience</Action>
            </article>
          ))}
        </div>

        <aside className="panel-ticket-column">
          <div className="panel-ticket">
            <div className="panel-ticket-top">
              <strong>MNGM.</strong>
              <Asterisk size={35} />
            </div>

            <small>YOUR ACCESS PASS</small>

            <div className="panel-ticket-content">
              <small>
                EXPERIENCE / 0{active + 1}
              </small>

              <h2>{selected.name}</h2>

              <p>{selected.subtitle}</p>

              <strong>{selected.price}</strong>
            </div>

            <div className="panel-ticket-stub">
              <div>
                <small>ADMIT ONE BUSINESS</small>
                <b>YOUR NEXT CHAPTER.</b>
              </div>

              <div className="panel-barcode" />
            </div>
          </div>
        </aside>
      </div>

      <p className="panel-pricing-note">
        Illustrative starting prices.
        Final scope and pricing are agreed
        before development begins.
      </p>
    </div>
  );
}

function Contact() {
  return (
    <div className="panel-editorial">
      <div>
        <div className="panel-kicker">
          YOUR NEXT CHAPTER
        </div>

        <h1>
          Let's make
          <br />
          <em>something matter.</em>
        </h1>

        <p className="panel-lead">
          Your ambition. Our engineering.
          Something unlike anything else.
        </p>

        <Action>Start your experience</Action>
      </div>

      <div className="panel-editorial-side">
        <Asterisk
          className="panel-asterisk"
          strokeWidth={1}
        />

        <h2>Make it yours.</h2>

        <p>
          Tell us about your business,
          explore your design preferences,
          and configure a website demo
          through our contact experience.
        </p>
      </div>
    </div>
  );
}

const sections = {
  studio: Studio,
  work: Work,
  services: Services,
  pricing: Pricing,
  contact: Contact,
};

export default function ExperiencePanel({
  selected,
  onClose,
}) {
  const closeButton = useRef(null);
  const dialog = useRef(null);

  const reduced = useReducedMotion();

  const Content = sections[selected];
  const title = titles[selected];

  useEffect(() => {
    const previous = document.activeElement;

    closeButton.current?.focus();

    function keydown(event) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "Tab") {
        const focusable = dialog.current
          ?.querySelectorAll(
            "button, a[href], input, textarea, select, [tabindex='0']"
          );

        if (!focusable?.length) return;

        const first = focusable[0];
        const last =
          focusable[focusable.length - 1];

        if (
          event.shiftKey &&
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();

        } else if (
          !event.shiftKey &&
          document.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener(
      "keydown", keydown
    );

    return () => {
      window.removeEventListener(
        "keydown", keydown
      );

      previous?.focus?.();
    };
  }, [onClose]);

  if (!Content) return null;

  return (
    <motion.div
      className="experience-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: reduced ? 0 : 0.4,
      }}
      onClick={onClose}
    >
      <motion.section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title[1]}
        className="experience-panel"
        initial={{
          y: reduced ? 0 : "100%",
          opacity: 0,
          scale: reduced ? 1 : 0.97,
        }}
        animate={{
          y: 0,
          opacity: 1,
          scale: 1,
        }}
        exit={{
          y: reduced ? 0 : "100%",
          opacity: 0,
          scale: reduced ? 1 : 0.97,
        }}
        transition={{
          duration: reduced ? 0 : 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <header className="experience-panel-header">
          <div>
            <span>{title[0]} / EXPERIENCE</span>
            <strong>{title[1]}</strong>
          </div>

          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="experience-close"
            aria-label="Close experience"
          >
            <span>Close</span>
            <X size={20} />
          </button>
        </header>

        <div className="experience-panel-scroll">
          <Content />
        </div>
      </motion.section>
    </motion.div>
  );
}
