
import React, { useState } from "react";
import "./Contact.css";

const STYLES = [
  { id: "minimal", name: "Minimal", description: "Clean and intentional" },
  { id: "tech", name: "Modern Tech", description: "Futuristic and immersive" },
  { id: "bold", name: "Bold", description: "Confident and expressive" },
  { id: "elegant", name: "Elegant", description: "Refined and timeless" },
];

const COLORS = [
  "#FF784F",
  "#4285F4",
  "#22B88B",
  "#9B6DFF",
  "#E8B34B",
  "#EF4770",
  "#111111",
];

const STYLE_CONTENT = {
  minimal: {
    eyebrow: "A BETTER WAY FORWARD",
    heading: "Make something meaningful.",
    description: "Thoughtful design for brands with a clear vision.",
    button: "Explore our work",
  },
  tech: {
    eyebrow: "THE NEXT GENERATION",
    heading: "Build beyond limits.",
    description: "Digital experiences engineered for what's next.",
    button: "Get started",
  },
  bold: {
    eyebrow: "BREAK THE ORDINARY",
    heading: "MAKE AN IMPACT.",
    description: "Big ideas deserve an unforgettable presence.",
    button: "LET'S GO",
  },
  elegant: {
    eyebrow: "WELCOME TO SOMETHING SPECIAL",
    heading: "Designed to inspire.",
    description: "Where beautiful details meet extraordinary ideas.",
    button: "Discover more",
  },
};

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [includeDemo, setIncludeDemo] = useState(false);
  const [style, setStyle] = useState("minimal");
  const [color, setColor] = useState("#FF784F");
  const [customColor, setCustomColor] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const content = STYLE_CONTENT[style];

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError("");

    const payload = {
      ...form,
      demo: includeDemo
        ? {
            style,
            accentColor: color,
          }
        : null,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Message could not be sent.");
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(
        "We couldn't send your message. Please try again shortly."
      );
    }
  };

  return (
    <main className="mngm-contact">
      <div className="contact-glow" aria-hidden="true" />

      <div className="contact-container">
        <a href="/" className="contact-back">
          <span>←</span> Back to MNGM Studios
        </a>

        <header className="contact-header">
          <div className="contact-eyebrow">
            <span className="contact-status-dot" />
            MNGM STUDIOS / CONTACT
          </div>

          <h1>
            Let's make
            <br />
            <span>something happen.</span>
          </h1>

          <p>
            Have an idea, a project, or something ambitious in mind?
            Tell us about it. We'll take it from there.
          </p>
        </header>

        <form className="contact-form" onSubmit={submitForm}>
          <div className="contact-form-heading">
            <div>
              <h2>Tell us about your project.</h2>
              <p>Start with the basics. We'll handle the rest.</p>
            </div>
            <span className="contact-form-step">01 / INQUIRY</span>
          </div>

          <div className="contact-field-row">
            <label className="contact-field">
              <span>Your name</span>
              <input
                type="text"
                name="name"
                placeholder="John Smith"
                value={form.name}
                onChange={updateForm}
                maxLength={100}
                required
              />
            </label>

            <label className="contact-field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={updateForm}
                maxLength={254}
                required
              />
            </label>
          </div>

          <label className="contact-field">
            <span>Tell us about your project</span>
            <textarea
              name="message"
              placeholder="I have an idea for a website..."
              value={form.message}
              onChange={updateForm}
              maxLength={5000}
              rows={5}
              required
            />
          </label>

          <div className="contact-demo-toggle">
            <div className="contact-demo-toggle-copy">
              <span className="contact-demo-icon">✳</span>
              <div>
                <h3>Want to show us your vision?</h3>
                <p>
                  Create a quick demo website to help us understand
                  the look you're going for.
                </p>
              </div>
            </div>

            <label className="contact-switch">
              <input
                type="checkbox"
                checked={includeDemo}
                onChange={(event) =>
                  setIncludeDemo(event.target.checked)
                }
                aria-label="Create a demo website"
              />
              <span className="contact-switch-track" />
            </label>
          </div>

          {includeDemo && (
            <section className="contact-builder">
              <div className="contact-builder-header">
                <div>
                  <span className="contact-section-label">
                    02 / DESIGN STUDIO
                  </span>
                  <h2>Bring your vision to life.</h2>
                  <p>
                    Experiment with styles and colors. Your choices
                    will be included with your message.
                  </p>
                </div>
                <span className="contact-live-badge">
                  <span /> LIVE PREVIEW
                </span>
              </div>

              <div className="contact-builder-section">
                <div className="contact-builder-label">
                  <span>01</span>
                  <h3>Choose a style</h3>
                </div>

                <div className="contact-style-grid">
                  {STYLES.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`contact-style-option ${
                        style === item.id ? "selected" : ""
                      }`}
                      onClick={() => setStyle(item.id)}
                      aria-pressed={style === item.id}
                    >
                      <div
                        className={`contact-style-thumbnail ${item.id}`}
                      >
                        <div className="thumb-nav">
                          <span />
                          <span />
                        </div>
                        <div className="thumb-heading" />
                        <div className="thumb-subheading" />
                        <div className="thumb-button" />
                      </div>
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="contact-builder-section">
                <div className="contact-builder-label">
                  <span>02</span>
                  <h3>Pick your accent color</h3>
                </div>

                <div className="contact-color-options">
                  {COLORS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={`contact-color-swatch ${
                        color.toLowerCase() === item.toLowerCase()
                          ? "selected"
                          : ""
                      }`}
                      style={{ "--swatch": item }}
                      onClick={() => {
                        setColor(item);
                        setCustomColor(false);
                      }}
                      aria-label={`Choose color ${item}`}
                      aria-pressed={
                        color.toLowerCase() === item.toLowerCase()
                      }
                    />
                  ))}

                  <button
                    type="button"
                    className={`contact-custom-color-btn ${
                      customColor ? "active" : ""
                    }`}
                    onClick={() => setCustomColor(!customColor)}
                  >
                    + Custom
                  </button>
                </div>

                {customColor && (
                  <div className="contact-custom-color-panel">
                    <label htmlFor="contact-color-picker">
                      Choose your own color
                    </label>
                    <div className="contact-custom-color-controls">
                      <input
                        id="contact-color-picker"
                        type="color"
                        value={color}
                        onChange={(event) =>
                          setColor(event.target.value)
                        }
                      />
                      <input
                        type="text"
                        value={color.toUpperCase()}
                        onChange={(event) => {
                          const value = event.target.value;
                          if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                            setColor(value);
                          }
                        }}
                        aria-label="Hex color"
                      />
                    </div>
                    <p>
                      Use the color picker to select any shade you want.
                    </p>
                  </div>
                )}
              </div>

              <div className="contact-builder-section">
                <div className="contact-preview-heading">
                  <div className="contact-builder-label">
                    <span>03</span>
                    <h3>Your website preview</h3>
                  </div>

                  <div className="contact-preview-modes">
                    <button
                      type="button"
                      className={
                        previewMode === "desktop" ? "active" : ""
                      }
                      onClick={() => setPreviewMode("desktop")}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      className={
                        previewMode === "mobile" ? "active" : ""
                      }
                      onClick={() => setPreviewMode("mobile")}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                <div className="contact-preview-outer">
                  <div className="contact-browser-bar">
                    <div className="contact-browser-dots">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="contact-browser-address">
                      yourbrand.com
                    </div>
                    <div className="contact-browser-spacer" />
                  </div>

                  <div className="contact-preview-stage">
                    <div
                      className={`contact-demo-site ${style} ${previewMode}`}
                      style={{ "--demo-accent": color }}
                    >
                      <div className="demo-site-nav">
                        <strong>YOUR BRAND<span>.</span></strong>
                        <div className="demo-site-links">
                          <span>Home</span>
                          <span>About</span>
                          <span>Services</span>
                        </div>
                        <span className="demo-site-nav-cta">
                          Contact
                        </span>
                      </div>

                      <div className="demo-site-hero">
                        <span className="demo-site-eyebrow">
                          {content.eyebrow}
                        </span>
                        <h2>{content.heading}</h2>
                        <p>{content.description}</p>
                        <span className="demo-site-button">
                          {content.button} <span>↗</span>
                        </span>
                      </div>

                      <div className="demo-site-bottom">
                        <div>
                          <span>01</span>
                          <strong>Creative thinking.</strong>
                          <p>Made for your next chapter.</p>
                        </div>
                        <div>
                          <span>02</span>
                          <strong>Better experiences.</strong>
                          <p>Designed with purpose.</p>
                        </div>
                        <div>
                          <span>03</span>
                          <strong>Real impact.</strong>
                          <p>Built to stand apart.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="contact-preview-disclaimer">
                  This is a visual concept, not a finished website.
                  Your selected style and color help us understand
                  your preferences.
                </p>
              </div>
            </section>
          )}

          <div className="contact-submit-area">
            <div>
              <strong>Ready when you are.</strong>
              <p>
                {includeDemo
                  ? "Your message and demo preferences will be sent together."
                  : "Tell us what you're imagining."}
              </p>
            </div>

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={status === "sending"}
            >
              {status === "sending"
                ? "Sending..."
                : "Send message"}
              <span>↗</span>
            </button>
          </div>

          {status === "success" && (
            <div className="contact-feedback success" role="status">
              Message sent successfully. We'll be in touch.
            </div>
          )}

          {status === "error" && (
            <div className="contact-feedback error" role="alert">
              {error}
            </div>
          )}
        </form>

        <footer className="contact-footer">
          <span>© {new Date().getFullYear()} MNGM STUDIOS</span>
          <span>CREATIVE THINKING. REAL EXECUTION.</span>
        </footer>
      </div>
    </main>
  );
}
