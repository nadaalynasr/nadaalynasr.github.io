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

describe("Header - Splash", () => {
  let $;

  beforeAll(async () => {
    html = await inlineCSS(html, {
      url: "file://" + path.dirname(__dirname) + "/",
      extraCss: css,
    });
    $ = cheerio.load(html);
  });

  test("Should style the top area of the page to make a 'splash' first impression (-1 point)", () => {
    const header = $("header");
    const styles = header.attr("style");

    if (styles) {
      const styleArray = styles
        .split(";")
        .filter((style) => style.trim().length > 0);
      expect(styleArray.length).toBeGreaterThanOrEqual(1);
    } else {
      throw new Error(
        "Header element does not have any CSS styles applied to create a splash effect"
      );
    }
  });

  test("H1 should change default style using Google font and color (-1 point)", () => {
    const h1 = $("header h1");
    const fontFamily = h1.css("font-family");
    expect(fontFamily).toBeTruthy();
    expect(fontFamily).not.toBe("serif");
    expect(fontFamily).not.toBe("sans-serif");

    const color = h1.css("color");
    expect(color).toBeTruthy();
    expect(color).not.toBe("black");
    expect(color).not.toBe("rgb(0, 0, 0)");
  });

  test("Headshot image should have border and/or border-radius styling (-1 point)", () => {
    const img = $("header img");
    const border = img.css("border");
    const borderRadius = img.css("border-radius");

    const hasBorder = border && border.trim() !== "" && border !== "none";
    const hasBorderRadius =
      borderRadius && borderRadius.trim() !== "" && borderRadius !== "0px";

    expect(hasBorder || hasBorderRadius).toBeTruthy();
  });

  test("Address paragraph should use '.address' selector and have custom styling (-.5 point)", () => {
    const originalHtml = fs.readFileSync(htmlPath, "utf-8");
    const addressClassRegex = /class=["'].*address.*["']/i;
    expect(addressClassRegex.test(originalHtml)).toBe(true);
    expect(css).toMatch(/\.address\s*{[^}]*}/);
    const addressElement = $(".address");
    if (addressElement.length > 0) {
      const styles = addressElement.attr("style");
      if (styles) {
        const styleArray = styles
          .split(";")
          .filter((style) => style.trim().length > 0);
        expect(styleArray.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  test("Tagline paragraph should use '.tagline' selector and have custom styling (-.5 point)", () => {
    const originalHtml = fs.readFileSync(htmlPath, "utf-8");
    const taglineClassRegex = /class=["'].*tagline.*["']/i;
    expect(taglineClassRegex.test(originalHtml)).toBe(true);
    expect(css).toMatch(/\.tagline\s*{[^}]*}/);
    const taglineElement = $(".tagline");
    if (taglineElement.length > 0) {
      const styles = taglineElement.attr("style");
      if (styles) {
        const styleArray = styles
          .split(";")
          .filter((style) => style.trim().length > 0);
        expect(styleArray.length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
