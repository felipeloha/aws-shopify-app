import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Docker from '../lib/docker-stack';
import { SynthUtils } from '@aws-cdk/assert';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Docker.DockerStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResource('AWS::CodeBuild::Project',{}));
  expectCDK(stack).to(haveResource('AWS::IAM::Role',{}));
  expectCDK(stack).to(haveResource('AWS::IAM::Policy',{}));
  expectCDK(stack).to(haveResource('AWS::ECR::Repository',{}));
});
test('Snapshot', () => {
const app = new cdk.App();
const stack = new Docker.DockerStack(app, 'TestStack');
expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
