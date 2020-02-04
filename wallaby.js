module.exports = {
  files: [
    "src/**/*.ts",
    "src/schemas/**/*.json",
    "test/helper.ts",
    { pattern: "test/fixtures/**/*", instrument: false },
    { pattern: "test/fixtures/**/.*", instrument: false },
    { pattern: "test/cosmiconfig/**/*", instrument: false },
    { pattern: "test/cosmiconfig/**/.*", instrument: false },
    { pattern: "test/ignoreFile/.*", instrument: false },
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
  },
  postprocessor: async (wallaby) => {
    const regexp = /^test[\/|\\](fixtures|cosmiconfig|ignoreFile)[\/|\\]/
    const fixturesFiles = wallaby.allFiles.filter(file => regexp.test(file.path));
    for (const file of fixturesFiles) {
      await wallaby.createFile({
        path: `../${file.path}`,
        load: file.load,
        order: file.order,
        ts: file.ts,
        content: file.getContentSync()
      });
    }
  },
  hints: {
    ignoreCoverage: /wallaby ignore next/
  },
  testFramework: "mocha",
  env: {
    type: "node",
    runner: process.platform === "win32"
      ? `${process.env.APPDATA}\\nvm\\v10.18.1\\node`
      : `${require('os').homedir()}/.nvm/versions/node/v10.18.1/bin/node`
  },
  delays: {
    run: 500
  },
  debug: true,
  reportConsoleErrorAsError: true,
  setup: (wallaby) => wallaby.testFramework.ui("bdd")
};
