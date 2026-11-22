
export const projects = [
  {
    title: "Guatemala Children's Project",
    shortName: "GCP",
    slug: "guatemala-childrens-project",
    client: "Guatemala Children's Project",
    category: "Website",
    type: "client",
    year: "2026",
    featured: true,

    accent: "#d4b99b",
    background: "#e8e1d5",

    logo: "https://guatemalachildrensproject.org/wp-content/uploads/2023/01/GCP-Logo-White-Circle150.png",
    website: "https://guatemalachildrensproject.org",

    tagline: "Designed around a greater purpose.",

    description:
      "A modern digital experience for a nonprofit dedicated to helping children and families in Guatemala.",

    challenge:
      "Create a digital home that communicates the organization's mission and makes its humanitarian efforts easier to explore.",

    approach:
      "Combine intentional typography, meaningful photography, and accessible navigation.",

    outcome: "",

    services: [
      "Web design",
      "Web development",
      "Content management",
    ],

    images: [],
  },

  {
    title: "MyLynkr",
    shortName: "MyLynkr",
    slug: "mylynkr",
    client: "MyLynkr",
    category: "Website",
    type: "internal",
    year: "2026",
    featured: true,

    accent: "#c3c8d0",
    background: "#101114",

    logo: "https://www.mylynkr.com/images/mylynkr-logo.png",
    website: "https://mylynkr.com",

    tagline: "A more connected world.",

    description:
      "A digital introduction to a new generation of connected home technology.",

    challenge:
      "Establish a distinctive digital presence for an emerging smart home brand.",

    approach:
      "A restrained visual language combining motion, typography, and immersive digital interactions.",

    outcome: "",

    services: [
      "Creative direction",
      "Web design",
      "Web development",
    ],

    images: [],
  },

  
];

export const categories = [
  "All work",
  "Website",
  "Digital product",
  "Digital identity",
];

export function getProject(slug) {
  return projects.find(
    (project) => project.slug === slug
  );
}

export function getFeaturedProjects() {
  return projects.filter(
    (project) => project.featured
  );
}
