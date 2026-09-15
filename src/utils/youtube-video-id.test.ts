import { describe, expect, it } from "vitest";
import { youtubeVideoId } from "./youtube-video-id";

describe("youtubeVideoId", () => {
  it("extracts the id from a watch URL", () => {
    expect(youtubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("extracts the id from a youtu.be short link", () => {
    expect(youtubeVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("extracts the id from an embed URL", () => {
    expect(youtubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("extracts the id from a shorts URL", () => {
    expect(youtubeVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ",
    );
  });

  it("returns undefined for an invalid URL", () => {
    expect(youtubeVideoId("not-a-youtube-url")).toBeUndefined();
    expect(youtubeVideoId("https://example.com/watch?v=abc")).toBeUndefined();
    expect(youtubeVideoId(undefined)).toBeUndefined();
    expect(
      youtubeVideoId("https://m.youtube.com/watch?v=dQw4w9WgXcQ"),
    ).toBeUndefined();
    expect(
      youtubeVideoId("https://www.youtube.com/live/dQw4w9WgXcQ"),
    ).toBeUndefined();
    expect(
      youtubeVideoId("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
    ).toBeUndefined();
  });
});
