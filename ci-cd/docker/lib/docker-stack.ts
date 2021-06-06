import * as cdk from '@aws-cdk/core';
import codebuild = require('@aws-cdk/aws-codebuild');
import ecr = require('@aws-cdk/aws-ecr');
import { Role, ServicePrincipal, PolicyStatement } from '@aws-cdk/aws-iam';

export class DockerStack extends cdk.Stack {
  public static repoName = 'aws-shopify-app';
  public static projectName = `${DockerStack.repoName}-docker`;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new ecr.Repository(
      this, 
      DockerStack.repoName,
      {
        repositoryName: DockerStack.repoName,
      }
      );
    repository.addLifecycleRule(
      { 
        tagStatus: ecr.TagStatus.UNTAGGED, 
        maxImageAge: cdk.Duration.days(1) 
      }
    );
    //remove all PUL images after 30 days
    //TODO is 30 days too much?
    repository.addLifecycleRule(
      { 
        tagPrefixList: ['PUL', 'develop', 'master'], 
        maxImageAge: cdk.Duration.days(30) 
      }
    );
    
    cdk.Tags.of(repository).add('Name', DockerStack.repoName);

    const bbSource = codebuild.Source.bitBucket({
      owner: 'mybitbucket',
      repo: DockerStack.repoName,
      reportBuildStatus: false,
    });

    const codebuildRole = new Role(this, 'codebuildRole', {
      assumedBy: new ServicePrincipal('codebuild.amazonaws.com')
    });
    codebuildRole.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      })
    );
    codebuildRole.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:GetRepositoryPolicy',
          'ecr:DescribeRepositories',
          'ecr:ListImages',
          'ecr:DescribeImages',
          'ecr:BatchGetImage',
          'ecr:PutImage',
          'ecr:InitiateLayerUpload',
          'ecr:UploadLayerPart',
          'ecr:CompleteLayerUpload'
        ],
      })
    );


    const codebuildProject = new codebuild.Project(this, 'Codebuild', {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('ci-cd/docker/buildspec.yaml'),
      projectName: DockerStack.projectName,
      role: codebuildRole,
      source: bbSource,
      timeout: cdk.Duration.minutes(10),
      environment: {
        computeType: codebuild.ComputeType.SMALL,
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
        privileged: true,
      },
    });
    cdk.Tags.of(codebuildProject).add('Name', `codebuild-${DockerStack.projectName}`);
  }
}
