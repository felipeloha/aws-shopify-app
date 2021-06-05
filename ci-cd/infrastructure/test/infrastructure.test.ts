import {
  expect as expectCDK,
  SynthUtils,
  haveResourceLike,
  ResourcePart,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as Infrastructure from "../lib/shopify-app-infrastructure-stack";

test("Stack test", () => {
  const app = new cdk.App();
  // WHEN

  const stackName = "test-stack";
  const stack = new Infrastructure.ShopifyAppInfrastructureStack(
    app,
    "MyTestStack",
    {
      stackName,
      env: {
        account: "12345",
        region: "eu-central-1",
      },
    }
  );

  // ECS
  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ECS::Cluster",
      {
        Properties: {
          ClusterName: `${stackName}-cluster`,
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::Logs::LogGroup",
      {
        Properties: {
          LogGroupName: `${stackName}-ecs`,
          RetentionInDays: 30,
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ElasticLoadBalancingV2::LoadBalancer",
      {
        Properties: {
          LoadBalancerAttributes: [
            {
              Key: "deletion_protection.enabled",
              Value: "false"
            }
          ],
          Scheme: "internet-facing",
          Subnets: [
            "s-12345",
            "s-67890"
          ],
          Tags: [
            {
              "Key": "Name",
              "Value": `${stackName}-load-balancer`,
            }
          ],
          SecurityGroups: [
            {
              "Fn::GetAtt": ["ShopifyAppServiceLBSecurityGroup35D5CBD6", "GroupId"]
            }
          ],
          Type: "application",
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::EC2::SecurityGroup",
      {
        Properties: {
          "SecurityGroupIngress": [
            {
              "CidrIp": "0.0.0.0/0",
              "Description": "Allow from anyone on port 80",
              "FromPort": 80,
              "IpProtocol": "tcp",
              "ToPort": 80
            }
          ],
          "Tags": [
            {
              "Key": "Name",
              "Value": `${stackName}-load-balancer`
            }
          ],
          "VpcId": "vpc-12345"
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::EC2::SecurityGroupEgress",
      {
        Properties: {
          "GroupId": {
            "Fn::GetAtt": [
              "ShopifyAppServiceLBSecurityGroup35D5CBD6",
              "GroupId"
            ]
          },
          "IpProtocol": "tcp",
          "Description": "Load balancer to target",
          "DestinationSecurityGroupId": {
            "Fn::GetAtt": [
              "ShopifyAppServiceSecurityGroup8517D999",
              "GroupId"
            ]
          },
          "FromPort": 8081,
          "ToPort": 8081
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ElasticLoadBalancingV2::Listener",
      {
        Properties: {
          "DefaultActions": [
            {
              "TargetGroupArn": {
                "Ref": "ShopifyAppServiceLBPublicListenerECSGroup9A5133A2"
              },
              "Type": "forward"
            }
          ],
          "LoadBalancerArn": {
            "Ref": "ShopifyAppServiceLB7084D25F"
          },
          "Port": 80,
          "Protocol": "HTTP"
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ElasticLoadBalancingV2::TargetGroup",
      {
        Properties: {
          "HealthCheckIntervalSeconds": 10,
          "HealthCheckPath": "/health",
          "Port": 80,
          "Protocol": "HTTP",
          "Tags": [
            {
              "Key": "Name",
              "Value": `${stackName}-target-group`
            }
          ],
          "TargetGroupAttributes": [
            {
              "Key": "deregistration_delay.timeout_seconds",
              "Value": "30"
            }
          ],
          "TargetType": "ip",
          "VpcId": "vpc-12345"
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::IAM::Role",
      {
        Properties: {
          "AssumeRolePolicyDocument": {
            "Statement": [
              {
                "Action": "sts:AssumeRole",
                "Effect": "Allow",
                "Principal": {
                  "Service": "ecs-tasks.amazonaws.com"
                }
              }
            ],
            "Version": "2012-10-17"
          },
          "Tags": [
            {
              "Key": "Name",
              "Value": `${stackName}-fargate-service`
            }
          ]
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  // Task definition
  expectCDK(stack).to(
    haveResourceLike("AWS::ECS::TaskDefinition", {
      RequiresCompatibilities: ["FARGATE"],
      Memory: "512",
      Cpu: "256",
      ContainerDefinitions: [
        {
          Name: "test-stack-container",
          Image: {
            "Fn::Join": [
              "",
              [
                "12345.dkr.ecr.eu-central-1.",
                {
                  Ref: "AWS::URLSuffix",
                },
                "/shopify-app:",
                {
                  Ref: "version",
                },
              ],
            ],
          },
          PortMappings: [
            {
              ContainerPort: 8081,
              Protocol: "tcp",
            },
          ],
          Secrets: [
            {
              Name: "SHOPIFY_API_KEY",
              ValueFrom: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":secretsmanager:eu-central-1:12345:secret:test-stack-secrets:SHOPIFY_API_KEY::"
                  ]
                ]
              }
            },
            {
              Name: "SHOPIFY_API_SECRET",
              ValueFrom: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":secretsmanager:eu-central-1:12345:secret:test-stack-secrets:SHOPIFY_API_SECRET::"
                  ]
                ]
              }
            },
            {
              Name: "SHOP",
              ValueFrom: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":secretsmanager:eu-central-1:12345:secret:test-stack-secrets:SHOP::"
                  ]
                ]
              }
            },
            {
              Name: "SCOPES",
              ValueFrom: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":secretsmanager:eu-central-1:12345:secret:test-stack-secrets:SCOPES::"
                  ]
                ]
              }
            },
            {
              Name: "HOST",
              ValueFrom: {
                "Fn::Join": [
                  "",
                  [
                    "arn:",
                    {
                      "Ref": "AWS::Partition"
                    },
                    ":secretsmanager:eu-central-1:12345:secret:test-stack-secrets:HOST::"
                  ]
                ]
              }
            },
          ],
        },
      ],
    })
  );

  // API Gateway
  expectCDK(stack).to(
    haveResourceLike(
      "AWS::CertificateManager::Certificate",
      {
        Properties: {
          DomainName: `${stackName}.domain.com`,
          ValidationMethod: "DNS",
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::Logs::LogGroup",
      {
        Properties: {
          LogGroupName: `${stackName}-api-gateway`,
          RetentionInDays: 30,
        },
        UpdateReplacePolicy: "Delete",
        DeletionPolicy: "Delete",
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ApiGateway::RestApi",
      {
        Properties: {
          Name: `${stackName}-api`,
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Deployment", {}));
  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ApiGateway::Stage",
      {
        Properties: {
          AccessLogSetting: {},
          MethodSettings: [
            {
              HttpMethod: "*",
              ResourcePath: "/*",
              ThrottlingBurstLimit: 1000,
              ThrottlingRateLimit: 100,
            },
          ],
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ApiGateway::DomainName",
      {
        Properties: {
          DomainName: `${stackName}.domain.com`,
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ApiGateway::Method",
      {
        Properties: {
          HttpMethod: "ANY",
          Integration: {
            IntegrationHttpMethod: "ANY",
            Type: "HTTP_PROXY",
            "Uri": {
              "Fn::Join": [
                "",
                [
                  "http://",
                  {
                    "Fn::GetAtt": [
                      "ShopifyAppServiceLB7084D25F",
                      "DNSName"
                    ]
                  },
                  "/{proxy}"
                ]
              ]
            }
          },
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ApiGateway::Resource",
      {
        Properties: {
          PathPart: "{proxy+}",
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::ApiGateway::Method",
      {
        Properties: {
          HttpMethod: "ANY",
          Integration: {
            CacheKeyParameters: ["method.request.path.proxy"],
            IntegrationHttpMethod: "ANY",
            IntegrationResponses: [{ StatusCode: "200" }],
            RequestParameters: {
              "integration.request.path.proxy": "method.request.path.proxy",
            },
            Type: "HTTP_PROXY",
            "Uri": {
              "Fn::Join": [
                "",
                [
                  "http://",
                  {
                    "Fn::GetAtt": [
                      "ShopifyAppServiceLB7084D25F",
                      "DNSName"
                    ]
                  },
                  "/{proxy}"
                ]
              ]
            }
          },
          RequestParameters: {
            "method.request.path.proxy": true,
          },
        },
      },
      ResourcePart.CompleteDefinition
    )
  );

  expectCDK(stack).to(haveResourceLike("AWS::ApiGateway::Account", {}));
  expectCDK(stack).to(haveResourceLike("AWS::IAM::Role", {}));

  expectCDK(stack).to(
    haveResourceLike(
      "AWS::Route53::RecordSet",
      {
        Properties: {
          Name: `${stackName}.domain.com.`,
          Type: "A",
        },
      },
      ResourcePart.CompleteDefinition
    )
  );
});

test("Stack snapshot", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Infrastructure.ShopifyAppInfrastructureStack(
    app,
    "MyTestStack",
    {
      stackName: "test-stack",
      env: {
        account: "12345",
        region: "eu-central-1",
      },
    }
  );

  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
