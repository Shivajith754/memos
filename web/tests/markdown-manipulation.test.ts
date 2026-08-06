import { describe, expect, it } from "vitest";
import { extractHeadings } from "@/utils/markdown-manipulation";

describe("extractHeadings", () => {
  it("turns raw inline HTML into readable heading text", () => {
    const [heading] = extractHeadings("# <ruby>連濁<rt>れんだく</rt></ruby>: \"Why Hito-Bito isn't Hito-Hito\"");

    expect(heading).toEqual({
      text: "連濁れんだく: \"Why Hito-Bito isn't Hito-Hito\"",
      level: 1,
      slug: "why-hito-bito-isnt-hito-hito",
    });
  });

  it("continues to extract standard Markdown headings", () => {
    expect(extractHeadings("# Overview\n\n## Details")).toEqual([
      { text: "Overview", level: 1, slug: "overview" },
      { text: "Details", level: 2, slug: "details" },
    ]);
  });
});
