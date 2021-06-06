import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as route53 from '@aws-cdk/aws-route53';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cwLogs from '@aws-cdk/aws-logs';
import { domain } from "./config";

export default function createApiGateway(
  stack: any,
  stackName: string,
  fargateService: ecs_patterns.ApplicationLoadBalancedFargateService,
) {
  const subdomain = `${stackName}.${domain}`;
  const targetURL = "http://" + fargateService.listener.loadBalancer.loadBalancerDnsName;
  const hostedZone = route53.HostedZone.fromLookup(stack, 'Zone', { domainName: domain });

  const certificate = new acm.Certificate(stack, `${subdomain}-certificate`, {
    domainName: subdomain,
    validation: acm.CertificateValidation.fromDns(hostedZone),
  });

  cdk.Tags.of(certificate).add('Name', `${subdomain}-certificate`);

  const apiGatewayLogGroup = new cwLogs.LogGroup(stack, `${stackName}-apigateway`,
    {
      logGroupName: `${stackName}-api-gateway`,
      retention: cwLogs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    }
  );

  const api = new apigateway.RestApi(stack, `${stackName}-api`, {
    domainName: {
      domainName: subdomain,
      certificate,
    },
    deployOptions: {
      methodOptions: {
        '/*/*': {  // This special path applies to all resource paths and all HTTP methods
          throttlingRateLimit: 100,
          throttlingBurstLimit: 1000
        }
      },
      accessLogDestination: new apigateway.LogGroupLogDestination(apiGatewayLogGroup),
      accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(
        {
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true
        }
      )
    }
  });
  api.node.addDependency(fargateService);

  api.root.addMethod('ANY', new apigateway.HttpIntegration(targetURL, { httpMethod: 'ANY' }));
  api.root.addProxy({
    defaultMethodOptions: {
      requestParameters: { "method.request.path.proxy": true }
    },
    defaultIntegration: 
    new apigateway.HttpIntegration(`${targetURL}/{proxy}`, {
      httpMethod: 'ANY',
      options: {
        requestParameters: {
          "integration.request.path.proxy": "method.request.path.proxy",
        },
        cacheKeyParameters: [
          "method.request.path.proxy"
        ],
        integrationResponses: [
          {
            statusCode: "200"
          }
        ]
      },
      proxy: true,
    }),
  });

  new route53.ARecord(stack, 'CustomDomainAliasRecord', {
    zone: hostedZone,
    target: route53.RecordTarget.fromAlias(new targets.ApiGateway(api)),
    recordName: subdomain,
  });
}