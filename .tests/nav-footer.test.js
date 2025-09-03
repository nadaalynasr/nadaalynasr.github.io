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

describe("Nav and Footer", () => {
  let $;

  beforeAll(async () => {
    html = await inlineCSS(html, {
      url: "file://" + path.dirname(__dirname) + "/",
      extraCss: css,
    });
    $ = cheerio.load(html);
  });

  test("Should style nav to differentiate it from the rest of the page - at least 2 properties (-1 point)", () => {
    const nav = $("nav");
    const styles = nav.attr("style");

    if (styles) {
      const styleArray = styles
        .split(";")
        .filter((style) => style.trim().length > 0)
        .filter((style) => !style.includes("display"))
        .filter((style) => !style.includes("justify-content"));

      expect(styleArray.length).toBeGreaterThanOrEqual(2);
    } else {
      throw new Error("Nav element does not have any CSS styles applied");
    }
  });

  test("Should make nav a flex parent and use flex property to separate name on left and contact link on right (-.5 point)", () => {
    const nav = $("nav");
    expect(nav.css("display")).toBe("flex");
    expect(nav.css("justify-content")).toBe("space-between");
  });

  test("Should style footer to differentiate it from the rest of the page - at least 2 properties (-1 point)", () => {
    const footer = $("footer");
    const styles = footer.attr("style");

    if (styles) {
      const styleArray = styles
        .split(";")
        .filter((style) => style.trim().length > 0)
        .filter((style) => !style.includes("display"))
        .filter((style) => !style.includes("justify-content"));

      expect(styleArray.length).toBeGreaterThanOrEqual(2);
    } else {
      throw new Error("Footer element does not have any CSS styles applied");
    }
  });

  test("Should make footer a flex parent and justify the children center (-.5 point)", () => {
    const footer = $("footer");
    expect(footer.css("display")).toBe("flex");
    expect(footer.css("justify-content")).toBe("center");
  });
});
