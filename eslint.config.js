// eslint.config.cjs
const globals = require("globals");

module.exports = [
  {
    files: ["**/*.js", "**/*.mjs"],
    ignores: ["node_modules"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", // if your code uses require/module.exports
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "no-unused-vars": "warn",
      semi: ["error", "always"],
    },
  },
];
