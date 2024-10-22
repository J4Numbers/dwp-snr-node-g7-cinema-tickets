import dwpConfigBase from "@dwp/eslint-config-base";
import mochaPlugin from "eslint-plugin-mocha";
import globals from "globals";

export default [
  ...dwpConfigBase,
  {
    ...mochaPlugin.configs.flat.recommended,
    files: ["**/test/unit/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.mocha,
        ...globals.chai,
      },
    },
  },
];
