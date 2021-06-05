#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ShopifyAppInfrastructureStack } from '../lib/shopify-app-infrastructure-stack';

const app = new cdk.App();
new ShopifyAppInfrastructureStack(app, 'ShopifyAppInfrastructureStack', {
  stackName: process.env.STACK_NAME || "shopify-dev",
  env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
  }
});
