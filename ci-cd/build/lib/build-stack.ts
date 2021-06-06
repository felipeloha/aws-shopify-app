import * as cdk from '@aws-cdk/core';
import codebuild = require('@aws-cdk/aws-codebuild');
import s3 = require('@aws-cdk/aws-s3');
import { Role, ServicePrincipal, PolicyStatement } from '@aws-cdk/aws-iam';

export class BuildStack extends cdk.Stack {
  public static repoName = 'aws-shopify-app';
  public static projectName = `${BuildStack.repoName}-build`;
  public static bucketName = `codebuild-${BuildStack.projectName}-bucket`;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, BuildStack.projectName, {
      bucketName: BuildStack.bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [{ expiration: cdk.Duration.days(30) }]
    });
    cdk.Tags.of(bucket).add('Name', BuildStack.bucketName);

    const bbSource = codebuild.Source.bitBucket({
      owner: 'myowner',
      repo: BuildStack.repoName,
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
        resources: [bucket.bucketArn, `${bucket.bucketArn}/*`],
        actions: ['s3:PutObject', 's3:GetObject', 's3:GetObjectVersion', 's3:GetBucketAcl', 's3:GetBucketLocation'],
      })
    );


    const codebuildProject = new codebuild.Project(this, 'Codebuild', {
      buildSpec: codebuild.BuildSpec.fromSourceFilename('ci-cd/build/buildspec.yaml'),
      projectName: BuildStack.projectName,
      role: codebuildRole,
      source: bbSource,
      artifacts: codebuild.Artifacts.s3({
        name: `${BuildStack.projectName}-results`,
        bucket: bucket,
        packageZip: false,
      }),
      cache: codebuild.Cache.bucket(bucket),
      timeout: cdk.Duration.minutes(10),
      environment: {
        computeType: codebuild.ComputeType.SMALL,
        buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_3,
      },
    });
    cdk.Tags.of(codebuildProject).add('Name', `codebuild-${BuildStack.projectName}`);
    cdk.Tags.of(bucket).add('Name', `${BuildStack.projectName}`);
  }
}
