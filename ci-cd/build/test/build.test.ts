import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import * as Build from '../lib/build-stack';
import { SynthUtils } from '@aws-cdk/assert';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Build.BuildStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(haveResource('AWS::CodeBuild::Project',{}));
    expectCDK(stack).to(haveResource('AWS::IAM::Role',{}));
    expectCDK(stack).to(haveResource('AWS::IAM::Policy',{}));
    expectCDK(stack).to(haveResource('AWS::S3::Bucket',{}));
});
test('Snapshot', () => {
  const app = new cdk.App();
  const stack = new Build.BuildStack(app, 'TestStack');
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});