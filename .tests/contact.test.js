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

describe("Contact Page", () => {
  let contactHtml;
  let c$;
  const contactPath = path.join(__dirname, "../contact.html");

  beforeAll(async () => {
    if (!fs.existsSync(contactPath)) {
      throw new Error("Contact HTML file not found at " + contactPath);
    }

    contactHtml = fs.readFileSync(contactPath, "utf-8");
    contactHtml = await inlineCSS(contactHtml, {
      url: "file://" + path.dirname(__dirname) + "/",
      extraCss: css,
    });
    c$ = cheerio.load(contactHtml);
  });

  test("Should add class 'one-col' to tags for form styling (-1 point)", () => {
    const originalContactHtml = fs.readFileSync(contactPath, "utf-8");
    const oneColClassRegex = /class=["'][^"']*one-col[^"']*["']/i;
    const incorrectOneColRegex = /class=["'][^"']*\.one-col[^"']*["']/i;

    if (incorrectOneColRegex.test(originalContactHtml)) {
      throw new Error(
        "Found 'class=\".one-col\"' - remove the dot! Should be 'class=\"one-col\"'"
      );
    }

    expect(oneColClassRegex.test(originalContactHtml)).toBe(true);
    expect(css).toMatch(/\.one-col\s*{[^}]*}/);
    const oneColElements = c$(".one-col");
    expect(oneColElements.length).toBeGreaterThan(0);
    oneColElements.each((i, element) => {
      const display = c$(element).css("display");

      if (display === "grid") {
        const gridTemplateColumns = c$(element).css("grid-template-columns");
        expect(gridTemplateColumns).toBe("1fr");
      } else if (display === "flex") {
        const flexDirection = c$(element).css("flex-direction");
        expect(flexDirection).toBe("column");
      }
    });
  });

  test("Should style input elements (input, textarea) appropriately (-1 point)", () => {
    const inputElements = c$("input, textarea");
    expect(inputElements.length).toBeGreaterThan(0);
    let styledElements = 0;
    inputElements.each((i, element) => {
      const styles = c$(element).attr("style");
      if (styles) {
        const styleArray = styles
          .split(";")
          .filter((style) => style.trim().length > 0);
        if (styleArray.length >= 1) {
          styledElements++;
        }
      }
    });
    expect(styledElements).toBeGreaterThan(0);
    const hasInputStyling =
      /input\s*{[^}]*}/.test(css) ||
      /textarea\s*{[^}]*}/.test(css) ||
      /input,\s*textarea\s*{[^}]*}/.test(css);
    expect(hasInputStyling).toBe(true);
  });
});
