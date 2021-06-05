module.exports = {
  extends: [
    "plugin:shopify/react",
    "plugin:shopify/polaris",
    "plugin:shopify/jest",
    "plugin:shopify/webpack",
  ],
  parserOptions: {
    ecmaVersion: 8,
  },
  rules: {
    "import/no-unresolved": "off",
  },
  overrides: [
    {
      files: ["*.test.*"],
      rules: {
        "shopify/jsx-no-hardcoded-content": "off",
      },
    },
  ],
};
