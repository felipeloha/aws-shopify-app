module.exports = {
  verbose: true,
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
    "^.+\\.(js|jsx|mjs|xml)$": "./jest-transformer.js",
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "output/junit",
        includeShortConsoleOutput: true,
        suiteName: "shopify app tests",
      },
    ],
  ],
  globals: {
    NODE_ENV: "test",
    MOCK_BACKEND_URL: "https://mock_backend_url.domain.com",
    MOCK_GRAPHQL_URL: "https://test-shop/admin/api/2019-10/graphql.json",
  },
  coverageReporters: ["text", "cobertura"],
  setupFiles: ["<rootDir>/__tests__/setup.js", "core-js"],
  testEnvironment: "jsdom",
  coverageDirectory: "output/coverage/jest",
  testPathIgnorePatterns: [
    "<rootDir>/__tests__/setup.js",
    "<rootDir>/__tests__/helpers",
    "<rootDir>/ci-cd/",
  ],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "^.+\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(xml)$": "<rootDir>/__mocks__/styleMock.js",
  },
};
