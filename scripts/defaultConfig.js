// https://github.com/tailwindlabs/tailwindcss.com/blob/master/src/utils/defaultConfig.js
const defaultTheme = require("tailwindcss/defaultTheme");
const resolveConfig = require("tailwindcss/resolveConfig");

module.exports.defaultConfig = resolveConfig({ theme: defaultTheme });
