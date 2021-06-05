const { parsed: localEnv } = require("dotenv").config();

const apiKey = process.env.SHOPIFY_API_KEY;

module.exports = {
  publicRuntimeConfig: {
    API_KEY: apiKey,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
};
