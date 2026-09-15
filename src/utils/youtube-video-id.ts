export function youtubeVideoId(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  const trimmed = url.trim();
  if (trimmed === "") {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return isYoutubeId(id) ? id : undefined;
    }

    if (host !== "youtube.com") {
      return undefined;
    }

    const fromQuery = parsed.searchParams.get("v");
    if (isYoutubeId(fromQuery)) {
      return fromQuery;
    }

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" || parts[0] === "shorts") {
      const id = parts[1];
      return isYoutubeId(id) ? id : undefined;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

function isYoutubeId(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }
  return /^[\w-]{11}$/.test(value);
}
