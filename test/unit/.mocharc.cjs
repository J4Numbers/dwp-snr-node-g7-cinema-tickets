module.exports = {
  require: ["test/unit/helpers/setup.js"],
  globals: ["__coverage__", "Generator"],
  spec: "test/unit/pairtest/**/*.js",
  timeout: 10000,
  exit: true,
};
