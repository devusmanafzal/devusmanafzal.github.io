const fs = require("node:fs");
const path = require("node:path");

const sourcePath = path.join(__dirname, "../data/saabagency.json");
const outputPath = path.join(__dirname, "../data/saabagency.js");
const presentation = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const output = "// Generated from saabagency.json by scripts/build-saab-local-data.cjs. Do not edit directly.\n"
  + `window.PRESENTATION_LOCAL_DATA = ${JSON.stringify(presentation, null, 2)};\n`;

if (process.argv.includes("--check")) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== output) {
    console.error("Local Saab presentation data is out of date. Run: node scripts/build-saab-local-data.cjs");
    process.exitCode = 1;
  } else {
    console.log("Local Saab presentation data matches saabagency.json.");
  }
} else {
  fs.writeFileSync(outputPath, output);
  console.log("Generated data/saabagency.js.");
}
