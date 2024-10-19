export default {
  parallel: 2,
  format: ["html:.coverage/cucumber-report.html"],
  paths: ["test/cucumber/features/**/*.{feature,feature.md}"],
  tags: "@interface-only",
  imports: ["glue/interface/**/*.@(js|cjs|mjs)"],
};
