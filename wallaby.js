module.exports = {
  files: [
    "src/**/*.ts",
    "src/schemas/**/*.json",
    "test/helper.ts",
    { pattern: "test/fixtures/**/*", instrument: false },
    { pattern: "test/fixtures/**/.integrity.json", instrument: false },
    { pattern: "test/cosmiconfig/**/*", instrument: false },
    { pattern: "test/cosmiconfig/**/.*", instrument: false },
    "package.json"
  ],
  tests: [
    "test/**/*.test.ts"
  ],
  filesWithNoCoverageCalculated: [
    "src/cli.ts"
  ],
  preprocessors: {
    "package.json": (file, done) => done(file.rename(`../${file.path}`).content),
    "**/test/fixtures/**/*": (file, done) => done(file.rename(`../${file.path}`).content),
    "**/test/fixtures/**/.integrity.json": (file, done) => done(file.rename(`../${file.path}`).content),
    "**/test/cosmiconfig/**/*": (file, done) => done(file.rename(`../${file.path}`).content),
    "**/test/cosmiconfig/**/.*": (file, done) => done(file.rename(`../${file.path}`).content),
  },
  hints: {
    ignoreCoverage: /wallaby ignore next/
  },
  testFramework: "mocha",
  env: {
    type: "node",
    runner: process.platform === "win32"
      ? `${process.env.APPDATA}\\nvm\\v8.16.0\node`
      : `${require('os').homedir()}/.nvm/versions/node/v8.16.0/bin/node`
  },
  delays: {
    run: 500
  },
  debug: true,
  reportConsoleErrorAsError: true,
  setup: (wallaby) => wallaby.testFramework.ui("bdd")
};
