const baseConfig = require("@dwp/nyc-config-base");

module.exports = {
  ...baseConfig,
  _reportDir: ".coverage/nyc",
  all: true,
  exclude: [...baseConfig.exclude, "src/thirdparty"],
  include: "src/",
};
