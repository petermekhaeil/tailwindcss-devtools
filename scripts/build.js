const fs = require("fs");
const glob = require("glob");
const path = require("path");
const dlv = require("dlv");
const { defaultConfig } = require("./defaultConfig");

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/utils/corePluginsWithExamples.js
const plugins = [
  ...glob
    .sync("node_modules/tailwindcss/lib/plugins/*.js")
    .map((filename) => path.basename(filename, ".js")),
].filter((x, i, a) => a.indexOf(x) === i);

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/components/ClassTable.js
let normalizeProperties = function (input) {
  if (typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(normalizeProperties);
  return Object.keys(input).reduce((newObj, key) => {
    let val = input[key];
    let newVal = typeof val === "object" ? normalizeProperties(val) : val;
    newObj[
      key.replace(/([a-z])([A-Z])/g, (m, p1, p2) => `${p1}-${p2.toLowerCase()}`)
    ] = newVal;
    return newObj;
  }, {});
};

// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/utils/corePluginsWithExamples.js
const corePlugins = plugins.map((plugin) => {
  const utilities = {};
  const mod = require("tailwindcss/lib/plugins/" + plugin);

  (mod.default || mod)()({
    addUtilities: (utils) => {
      utils = Array.isArray(utils) ? utils : [utils];
      for (let i = 0; i < utils.length; i++) {
        for (let prop in utils[i]) {
          utilities[prop] = normalizeProperties(utils[i][prop]);
        }
      }
    },
    addComponents: () => {},
    addBase: () => {},
    config: () => ({ future: "all" }),
    theme: (path, defaultValue) => dlv(defaultConfig.theme, path, defaultValue),
    variants: () => [],
    e: (x) => x.replace(/([:.])/g, "\\$1"),
    target: () => "modern",
    corePlugins: () => true,
  });

  return {
    plugin,
    utilities: utilities,
  };
});

// Output to file for panel to utilise
const data = JSON.stringify(corePlugins, null, 2);
const buildDir = "./public/build";

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

fs.writeFile(`${buildDir}/plugins.json`, data, (err) => {
  if (err) {
    throw err;
  }
});
