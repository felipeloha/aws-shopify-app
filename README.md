# Local development

Install shopify-app-cli: https://shopify.dev/tools/cli/installation

Start the app: https://shopify.dev/tools/cli/reference/node-app

in cmd:
`shopify serve`

in browser:
`http://localhost:8081/auth?shop=shop.myshopify.com`

### Troubleshooting:

ERR_NGROK_702 >> wait 60 seconds until ngrok have more rate limit

### Config and preconditions:

- Fixed load balancer urls per stack for now
- Shopify secrets must be created with the name STACKNAME-secrets in the region where the app is Deployed containing

```
SHOPIFY_API_KEY: "xxx",
SHOPIFY_API_SECRET: "xxxx",
SHOP: "shop.myshopify.com",
SCOPES: "read_orders,read_all_orders",
HOST: `https://${subdomain}`,
```

## Docker

### Build

```sh
docker build . --progress=plain -t shopify-app
```

### Run

```sh
docker run -p 8081:8081 --env-file .env shopify-app
```

# Shopify App Node

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Build Status](https://travis-ci.com/Shopify/shopify-app-node.svg?branch=master)](https://travis-ci.com/Shopify/shopify-app-node)

Boilerplate to create an embedded Shopify app made with Node, [Next.js](https://nextjs.org/), [Shopify-koa-auth](https://github.com/Shopify/quilt/tree/master/packages/koa-shopify-auth), [Polaris](https://github.com/Shopify/polaris-react), and [App Bridge React](https://shopify.dev/tools/app-bridge/react-components).

## Installation

Using the [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli) run:

```sh
~/ $ shopify create project APP_NAME
```

Or, fork and clone repo

## Requirements

- If you don’t have one, [create a Shopify partner account](https://partners.shopify.com/signup).
- If you don’t have one, [create a Development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) where you can install and test your app.
- In the Partner dashboard, [create a new app](https://help.shopify.com/en/api/tools/partner-dashboard/your-apps#create-a-new-app). You’ll need this app’s API credentials during the setup process.

## Usage

This repository is used by [Shopify-App-CLI](https://github.com/Shopify/shopify-app-cli) as a scaffold for Node apps. You can clone or fork it yourself, but it’s faster and easier to use Shopify App CLI, which handles additional routine development tasks for you.

## License

This repository is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
