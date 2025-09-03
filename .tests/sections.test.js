const fs = require("fs");
const cheerio = require("cheerio");
const inlineCSS = require("inline-css");
const path = require("path");

const htmlPath = path.join(__dirname, "../index.html");
const cssPath = path.join(__dirname, "../css/style.css");

// Check if files exist
if (!fs.existsSync(cssPath)) {
  throw new Error("CSS file not found at " + cssPath);
}
if (!fs.existsSync(htmlPath)) {
  throw new Error("HTML file not found at " + htmlPath);
}

let html = fs.readFileSync(htmlPath, "utf-8");
const css = fs.readFileSync(cssPath, "utf-8");

describe("Sections, etc.", () => {
  let $;

  beforeAll(async () => {
    html = await inlineCSS(html, {
      url: "file://" + path.dirname(__dirname) + "/",
      extraCss: css,
    });
    $ = cheerio.load(html);
  });

  test("Section headings h3 should use Google font and color number (-1 point)", () => {
    let headingElements = $("section h3");
    let headingType = "h3";

    expect(headingElements.length).toBeGreaterThan(0);
    const fontFamily = headingElements.first().css("font-family");
    expect(fontFamily).toBeTruthy();
    expect(fontFamily).not.toBe("serif");
    expect(fontFamily).not.toBe("sans-serif");

    const color = headingElements.first().css("color");
    expect(color).toBeTruthy();
    expect(color).not.toBe("black");
    expect(color).not.toBe("rgb(0, 0, 0)");
    const h3StyleInCSS = /(?:section\s+)?h3\s*{[^}]*}/.test(css);
    const h2StyleInCSS = /(?:section\s+)?h2\s*{[^}]*}/.test(css);
    expect(h3StyleInCSS || h2StyleInCSS).toBe(true);
  });

  test("Description lists should use grid layout (-1 point)", () => {
    const dlElements = $("section dl");
    expect(dlElements.length).toBeGreaterThan(0);
    dlElements.each((i, dl) => {
      const display = $(dl).css("display");
      expect(display).toBe("grid");
    });
    const dlGridInCSS = /(?:section\s+)?dl\s*{[^}]*display:\s*grid[^}]*}/.test(
      css
    );
    expect(dlGridInCSS).toBe(true);
  });

  test("Unordered lists should have custom styling (-.5 point)", () => {
    const ulElements = $("section ul");
    expect(ulElements.length).toBeGreaterThan(0);
    ulElements.each((i, ul) => {
      const styles = $(ul).attr("style");
      if (styles) {
        const styleArray = styles
          .split(";")
          .filter((style) => style.trim().length > 0);
        expect(styleArray.length).toBeGreaterThanOrEqual(1);
      }
    });
    const ulStyleInCSS = /(?:section\s+)?ul\s*{[^}]*}/.test(css);
    expect(ulStyleInCSS).toBe(true);
  });

  test("Links should have custom anchor text color (-.5 point)", () => {
    const linkElements = $("section a");
    expect(linkElements.length).toBeGreaterThan(0);
    const color = linkElements.first().css("color");
    expect(color).toBeTruthy();
    expect(color).not.toBe("blue");
    expect(color).not.toBe("rgb(0, 0, 238)");
    const anchorStyleInCSS = /(?:section\s+)?a\s*{[^}]*color[^}]*}/.test(css);
    expect(anchorStyleInCSS).toBe(true);
  });

  test("Links should have no underline (-.5 point)", () => {
    const linkElements = $("section a");
    expect(linkElements.length).toBeGreaterThan(0);
    linkElements.each((i, link) => {
      const textDecoration = $(link).css("text-decoration");
      expect(textDecoration).toBe("none");
    });
    const noUnderlineInCSS =
      /(?:section\s+)?a\s*{[^}]*text-decoration:\s*none[^}]*}/.test(css);
    expect(noUnderlineInCSS).toBe(true);
  });

  test("Links should have custom hover state styling (-.5 point)", () => {
    const hoverRegex = /(?:section\s+)?a:hover\s*{[^}]*}/;
    const hasHoverStyles = hoverRegex.test(css);
    expect(hasHoverStyles).toBe(true);
    const hoverProperties = css.match(/(?:section\s+)?a:hover\s*{([^}]*)}/);
    if (hoverProperties && hoverProperties[1]) {
      const properties = hoverProperties[1].trim();
      expect(properties.length).toBeGreaterThan(0);
    } else {
      throw new Error("Hover state exists but has no properties");
    }
  });
});
