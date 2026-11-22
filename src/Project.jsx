

import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import ParticleWorld from "./ParticleWorld";

import {
  PortfolioHeader,
  PortfolioFooter,
  PortfolioCTA,
  ProjectCover,
} from "./Work";

import {
  projects,
  getProject,
} from "./projects";

import "./Project.css";

const EASE = [0.22, 1, 0.36, 1];

function CaseSection({ number, title, children }) {
  if (!children) return null;

  return (
    <section className="pc-case-section">
      <div className="pc-case-label">
        {number} / {title.toUpperCase()}
      </div>

      <div>
        <h2>{title}.</h2>
        <p>{children}</p>
      </div>
    </section>
  );
}

function ProjectMedia({ media, title, index }) {
  const src =
    typeof media === "string" ? media : media.src;

  const alt =
    typeof media === "object"
      ? media.alt || `${title} presentation ${index + 1}`
      : `${title} presentation ${index + 1}`;

  const video = /\.(mp4|webm)(\?.*)?$/i.test(src);

  return (
    <figure className="pc-gallery-item">
      {video ? (
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          aria-label={alt}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      )}
    </figure>
  );
}

function safeWebsite(value) {
  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export default function Project({ slug }) {
  const project = getProject(slug);
  const reduced = useReducedMotion();

  if (!project) {
    return (
      <div className="pw-site">
        <PortfolioHeader />

        <main className="pc-not-found">
          <div className="pw-label">
            <span /> 404 / PROJECT NOT FOUND
          </div>

          <h1>Nothing here.</h1>

          <p>
            This project may have moved or no longer exists.
          </p>

          <a href="/work" className="pw-text-link">
            <ArrowLeft size={18} />
            Back to all work
          </a>
        </main>

        <PortfolioFooter />
      </div>
    );
  }

  const index = projects.indexOf(project);

  const next =
    projects.length > 1
      ? projects[(index + 1) % projects.length]
      : null;

  const website = safeWebsite(project.website);

  return (
    <div className="pw-site pc-site">
      <ParticleWorld />
      <PortfolioHeader />

      <main className="pw-content">
        <section className="pc-hero">
          <div className="pw-container">
            <div className="pc-topline">
              <a href="/work" className="pc-back">
                <ArrowLeft size={17} />
                All work
              </a>

              <span>
                PROJECT /
                {" "}
                {String(index + 1).padStart(3, "0")}
              </span>
            </div>

            <motion.div
              initial={reduced ? false : {
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: reduced ? 0 : 0.9,
                ease: EASE,
              }}
            >
              <div className="pw-label">
                <span />
                {project.category.toUpperCase()}
                {" / "}
                {project.year}
              </div>

              <h1>
                {project.title}
                <span>.</span>
              </h1>

              <p className="pc-tagline">
                {project.tagline}
              </p>
            </motion.div>

            <div className="pc-hero-cover">
              <ProjectCover
                project={project}
                eager
              />
            </div>
          </div>
        </section>

        <section className="pc-overview">
          <div className="pw-container">
            <div className="pc-overview-grid">
              <div className="pc-details">
                <div className="pc-detail">
                  <small>
                    {project.type === "client"
                      ? "CLIENT"
                      : "STUDIO PROJECT"}
                  </small>

                  <p>{project.client}</p>
                </div>

                <div className="pc-detail">
                  <small>YEAR</small>
                  <p>{project.year}</p>
                </div>

                <div className="pc-detail">
                  <small>SERVICES</small>

                  {project.services.map((service) => (
                    <p key={service}>{service}</p>
                  ))}
                </div>

                {website && (
                  <a
                    href={website}
                    className="pc-live-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit website
                    <ArrowUpRight size={18} />
                  </a>
                )}
              </div>

              <div className="pc-description">
                <div className="pw-label">
                  <span /> THE PROJECT
                </div>

                <h2>{project.description}</h2>
              </div>
            </div>

            <div className="pc-case-content">
              <CaseSection number="01" title="The challenge">
                {project.challenge}
              </CaseSection>

              <CaseSection number="02" title="The approach">
                {project.approach}
              </CaseSection>

              <CaseSection number="03" title="The outcome">
                {project.outcome}
              </CaseSection>
            </div>
          </div>
        </section>

        {project.images?.length > 0 && (
          <section className="pc-gallery">
            <div className="pw-container">
              <div className="pw-label">
                <span /> THE EXPERIENCE
              </div>

              <div className="pc-gallery-grid">
                {project.images.map((media, i) => (
                  <ProjectMedia
                    key={i}
                    media={media}
                    title={project.title}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {next && (
          <section className="pc-next">
            <div className="pw-container">
              <a href={`/work/${next.slug}`}>
                <div>
                  <div className="pw-label">
                    <span /> NEXT PROJECT
                  </div>

                  <h2>{next.title}<span>.</span></h2>
                </div>

                <div className="pc-next-arrow">
                  <ArrowRight strokeWidth={1} />
                </div>
              </a>
            </div>
          </section>
        )}

        <PortfolioCTA />
      </main>

      <PortfolioFooter />
    </div>
  );
}
