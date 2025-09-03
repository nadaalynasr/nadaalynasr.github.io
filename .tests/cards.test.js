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

describe("Project Cards", () => {
  let $;

  beforeAll(async () => {
    html = await inlineCSS(html, {
      url: "file://" + path.dirname(__dirname) + "/",
      extraCss: css,
    });
    $ = cheerio.load(html);
  });

  test("Class 'three-col' should use display grid to create a 3-column layout (-1 point)", () => {
    const threeColDiv = $("div.three-col");
    expect(threeColDiv.length).toBeGreaterThan(0);
    expect(threeColDiv.css("display")).toBe("grid");
    const gridTemplateColumns = threeColDiv.css("grid-template-columns");
    expect(gridTemplateColumns).toBeTruthy();
    const isValidThreeColumns =
      gridTemplateColumns === "repeat(3, 1fr)" ||
      gridTemplateColumns === "1fr 1fr 1fr" ||
      gridTemplateColumns.split(" ").length === 3;
    expect(isValidThreeColumns).toBeTruthy();
    const gap = threeColDiv.css("gap");
    expect(gap).toBeTruthy();
    expect(gap).not.toBe("0px");
    const threeColInCSS = /\.three-col\s*{[^}]*display:\s*grid[^}]*}/.test(css);
    expect(threeColInCSS).toBe(true);
  });

  test("Images within cards should be positioned and styled appropriately (-1 point)", () => {
    const cardImages = $("div.card img");
    expect(cardImages.length).toBeGreaterThan(0);
    cardImages.each((i, img) => {
      const styles = $(img).attr("style");
      if (styles) {
        const styleArray = styles
          .split(";")
          .filter((style) => style.trim().length > 0);
        expect(styleArray.length).toBeGreaterThanOrEqual(1);
      }
    });
    const cardImgInCSS = /\.card\s+img\s*{[^}]*}/.test(css);
    expect(cardImgInCSS).toBe(true);
  });

  test("Card layout should create a 'card style' with visual separation (-1 point)", () => {
    const cards = $("div.card");
    expect(cards.length).toBeGreaterThanOrEqual(3);
    cards.each((i, card) => {
      const styles = $(card).attr("style");
      if (styles) {
        const styleArray = styles
          .split(";")
          .filter((style) => style.trim().length > 0);
        expect(styleArray.length).toBeGreaterThanOrEqual(1);
      }
    });
    const cardInCSS = /\.card\s*{[^}]*}/.test(css);
    expect(cardInCSS).toBe(true);
  });
});
