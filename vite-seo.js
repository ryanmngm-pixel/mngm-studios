import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { projects } from "./src/projects.js";

const origin = "https://mngmstudios.com";
const name = "MNGM Studios";
const socialImage = origin + "/mngm-social.png";

const pages = [
  {
    path: "/",
    title: "MNGM Studios | Utah Web Design & Development",
    description: "MNGM Studios is an independent Utah web design studio building custom websites, brand identities, and interactive digital experiences for businesses.",
  },
  {
    path: "/work",
    title: "Web Design Portfolio | MNGM Studios",
    description: "Explore custom website and digital design projects by MNGM Studios, including work for Guatemala Children's Project and MyLynkr.",
  },
  {
    path: "/contact",
    title: "Start a Website Project | MNGM Studios",
    description: "Tell MNGM Studios what you're building. Request a custom website and share your design preferences with our interactive demo builder.",
  },
  ...projects.map((project) => ({
    path: "/work/" + project.slug,
    title: project.title + " Website Project | MNGM Studios",
    description: project.description,
  })),
];

const notFound = {
  path: "/404",
  title: "Page Not Found | MNGM Studios",
  description: "The page you requested could not be found.",
  noindex: true,
};

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function pageHtml(template, page) {
  const url = origin + page.path;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const head = [
    '<meta name="description" content="' + description + '" />',
    ...(page.noindex ? ['<meta name="robots" content="noindex" />'] : [
      '<link rel="canonical" href="' + url + '" />',
      '<meta property="og:type" content="website" />',
      '<meta property="og:site_name" content="' + name + '" />',
      '<meta property="og:title" content="' + title + '" />',
      '<meta property="og:description" content="' + description + '" />',
      '<meta property="og:url" content="' + url + '" />',
      '<meta property="og:image" content="' + socialImage + '" />',
      '<meta property="og:image:alt" content="MNGM Studios white wordmark with an orange accent" />',
      '<meta name="twitter:card" content="summary_large_image" />',
    ]),
  ];

  if (page.path === "/") {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", name, url, publisher: { "@id": origin + "/#studio" } },
        { "@type": "Organization", "@id": origin + "/#studio", name, url, logo: origin + "/mngm-logo.png" },
      ],
    };
    head.push('<script type="application/ld+json">' + JSON.stringify(schema) + '</script>');
  }

  return template.replace(/<title>[^<]*<\/title>/, "<title>" + title + "</title>")
    .replace("</head>", "  " + head.join("\n    ") + "\n  </head>");
}

export default function searchMetadata() {
  return {
    name: "mngm-search-metadata",
    apply: "build",
    writeBundle: {
      order: "post",
      async handler({ dir }, bundle) {
        const index = bundle["index.html"];
        if (index?.type !== "asset" || typeof index.source !== "string") {
          throw new Error("SEO output requires Vite's generated index.html.");
        }

        const files = [...pages, notFound].map((page) => ({
          path: page.path === "/" ? "index.html" : page.path.slice(1) + ".html",
          source: pageHtml(index.source, page),
        }));
        files.push({
          path: "sitemap.xml",
          source: '<?xml version="1.0" encoding="UTF-8"?>\n'
            + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + pages.map(({ path }) => "  <url><loc>" + origin + path + "</loc></url>").join("\n")
            + "\n</urlset>\n",
        });

        await Promise.all(files.map(async ({ path, source }) => {
          const destination = join(dir, path);
          await mkdir(dirname(destination), { recursive: true });
          await writeFile(destination, source);
        }));
      },
    },
  };
}
