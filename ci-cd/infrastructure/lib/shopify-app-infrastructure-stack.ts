import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as cwLogs from '@aws-cdk/aws-logs';
import * as ecr from '@aws-cdk/aws-ecr';
import * as sm from "@aws-cdk/aws-secretsmanager";
import createApiGateway from './api-gateway';
import { envSecretsConfig } from "./config";

export class ShopifyAppInfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const version = new cdk.CfnParameter(this, "version", {
      description: "Branch + commit",
      type: "String",
      default: "develop-df47282",
    });

    const stackName = cdk.Stack.of(this).stackName;

    //ecs
    const vpc = ec2.Vpc.fromLookup(this, "vpc", { isDefault: true });

    const cluster = new ecs.Cluster(this, "ShopifyCluster", {
      clusterName: `${stackName}-cluster`,
      vpc: vpc
    });

    const ecsLogGroup = new cwLogs.LogGroup(this, `${stackName}-ecs`, {
      logGroupName: `${stackName}-ecs`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: cwLogs.RetentionDays.ONE_MONTH,
    });

    const ecsLogDriver = new ecs.AwsLogDriver({
      logGroup: ecsLogGroup,
      streamPrefix: `${stackName}-logs`,
    });

    const appSecrets = sm.Secret.fromSecretNameV2(this, 'ShopifyAppSecret', `${stackName}-secrets`);

    // Create a load-balanced Fargate service and make it public
    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "ShopifyAppService", {
      cluster: cluster,
      //TODO is this a security risk? actually we dont want this
      assignPublicIp: true,
      propagateTags: ecs.PropagatedTagSource.SERVICE,
      serviceName: `${stackName}-service`,
      taskImageOptions: {
        containerName: `${stackName}-container`,
        enableLogging: true,
        logDriver: ecsLogDriver,
        image: ecs.ContainerImage.fromEcrRepository(
          ecr.Repository.fromRepositoryName(this, 'shopify-app', 'shopify-app'),
          version.valueAsString,
        ),
        environment: {
          SHOPIFY_APP_VERSION: version.valueAsString,
        },
        secrets: {
          SHOPIFY_API_KEY: ecs.Secret.fromSecretsManager(
            appSecrets,
            envSecretsConfig.secretKeys.shopifyApiKey
          ),
          SHOPIFY_API_SECRET: ecs.Secret.fromSecretsManager(
            appSecrets,
            envSecretsConfig.secretKeys.shopifyApiSecret
          ),
          SHOP: ecs.Secret.fromSecretsManager(
            appSecrets,
            envSecretsConfig.secretKeys.shop
          ),
          SCOPES: ecs.Secret.fromSecretsManager(
            appSecrets,
            envSecretsConfig.secretKeys.scopes
          ),
          HOST: ecs.Secret.fromSecretsManager(
            appSecrets,
            envSecretsConfig.secretKeys.host
          ),
        },
        containerPort: 8081,
      },
      publicLoadBalancer: true,
    });

    fargateService.targetGroup.configureHealthCheck({
      path: "/health",
      interval: cdk.Duration.seconds(10),
    });

    // reduce default from 5min to 30s to speed up deployments
    fargateService.targetGroup.setAttribute("deregistration_delay.timeout_seconds", "30");

    cdk.Tags.of(fargateService).add('Name', `${stackName}-fargate-service`);
    cdk.Tags.of(fargateService.targetGroup).add('Name', `${stackName}-target-group`);
    cdk.Tags.of(fargateService.listener.loadBalancer).add('Name', `${stackName}-load-balancer`);

    createApiGateway(this, stackName, fargateService);
  }
}
