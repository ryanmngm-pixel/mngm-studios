function Portfolio() {
  const projects = [
    {
      name: "MNGM Group",
      description: "Company navigation platform.",
      link: "https://mngmgroup.com",
    },

    {
      name: "Logic",
      description: "AI accountability partner.",
      link: "",
    },

    {
      name: "SnapTyle",
      description: "Modular tile innovation.",
      link: "",
    },
  ];

  return (
    <section className="section">
      <h2>Recent Work</h2>

      <div className="card-grid">
        {projects.map((project) => (
          <a
            key={project.name}
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="portfolio-card-link"
          >
            <div className="portfolio-card">
              <h3>{project.name}</h3>

              <p>{project.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default Portfolio;