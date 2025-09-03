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

describe("Responsiveness", () => {
  let $;

  beforeAll(async () => {
    html = await inlineCSS(html, {
      url: "file://" + path.dirname(__dirname) + "/",
      extraCss: css,
    });
    $ = cheerio.load(html);
  });

  test("Nav should change to vertical orientation in mobile media query (-1 point)", () => {
    const mediaQueryRegex = /@media[^{]*\([^)]*max-width[^)]*\)[^{]*{[^}]*}/;
    const hasMediaQuery = mediaQueryRegex.test(css);
    expect(hasMediaQuery).toBe(true);
    const navInMediaQuery =
      /@media[^{]*{[^}]*nav[^}]*flex-direction:\s*column[^}]*}/.test(css) ||
      /@media[^{]*{[^}]*nav[^}]*{[^}]*flex-direction:\s*column[^}]*}/.test(css);

    if (!navInMediaQuery) {
      const mediaQueryContent = css.match(
        /@media[^{]*{([^}]+(?:}[^}]*{[^}]*)*?)}/
      );
      if (mediaQueryContent) {
        const hasNavFlexColumn =
          /nav[^}]*flex-direction:\s*column/.test(mediaQueryContent[1]) ||
          /flex-direction:\s*column[^}]*nav/.test(mediaQueryContent[1]);
        expect(hasNavFlexColumn).toBe(true);
      } else {
        throw new Error(
          "Media query should contain nav with flex-direction: column for mobile"
        );
      }
    } else {
      expect(navInMediaQuery).toBe(true);
    }
    expect(css).toMatch(/@media/);
    expect(css).toMatch(/flex-direction:\s*column/);
  });

  test("Projects grid should change to one column layout in mobile media query (-1 point)", () => {
    const mediaQueryRegex = /@media[^{]*\([^)]*max-width[^)]*\)[^{]*{[^}]*}/;
    const hasMediaQuery = mediaQueryRegex.test(css);
    expect(hasMediaQuery).toBe(true);
    const mediaQueryBlock = css.match(/@media[^{]*{([^]*?)}\s*(?:\/\*|$|@|\w)/);
    if (mediaQueryBlock) {
      const mediaContent = mediaQueryBlock[1];
      const hasThreeCol = /\.three-col/.test(mediaContent);
      const hasSingleColumn = /grid-template-columns:\s*1fr/.test(mediaContent);
      expect(hasThreeCol && hasSingleColumn).toBe(true);
    } else {
      const afterMediaQuery = css.substring(css.indexOf("@media"));
      const hasThreeColInMedia =
        /\.three-col[^}]*grid-template-columns:\s*1fr/.test(afterMediaQuery);
      expect(hasThreeColInMedia).toBe(true);
    }
    expect(css).toMatch(/@media/);
    expect(css).toMatch(/grid-template-columns:\s*1fr/);
  });
});
