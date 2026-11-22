function parseWebsite(value) {
  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export function getBrandAssets(project) {
  const website = parseWebsite(
    project.website || project.preview
  );

  const candidates = [];

  if (project.logo) {
    candidates.push(project.logo);
  }

  if (website) {
    candidates.push(
      `${website.origin}/apple-touch-icon.png`
    );

    candidates.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        website.hostname
      )}&sz=256`
    );

    candidates.push(
      `${website.origin}/favicon.ico`
    );
  }

  return [...new Set(candidates)];
}

export function getBrandInitials(project) {
  if (project.shortName) {
    return project.shortName;
  }

  const words = project.title.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 12);
  }

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}