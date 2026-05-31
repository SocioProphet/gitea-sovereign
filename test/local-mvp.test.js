const test = require('node:test');
const assert = require('node:assert/strict');

const { assertRequestWithinGrantScope, runLocalMvpDemo } = require('../demo/local-mvp');

test('local MVP demo composes source-control substrate without live calls', () => {
  const result = runLocalMvpDemo();
  assert.equal(result.live_calls, false);
  assert.equal(result.request.op, 'read');
  assert.equal(result.request.normalized_path, 'docs/architecture.md');
  assert.equal(result.path_decision, 'request.allowed');
  assert.equal(result.reference_decision, 'references.ok');
  assert.equal(result.grant_verification, 'grant.verified');
  assert.equal(result.scope_decision, 'scope.allowed');
  assert.equal(result.replay_verification, 'nonce.reused');
  assert.equal(result.audit_verification, 'audit.verified');
  assert.equal(result.export_verification, 'batch.verified');
  assert.equal(typeof result.reference_receipt_hash, 'string');
  assert.equal(typeof result.native_receipt_hash, 'string');
  assert.equal(typeof result.export_batch_hash, 'string');
  assert.equal(typeof result.ack_hash, 'string');
});

test('local MVP result does not expose transient native material', () => {
  const serialized = JSON.stringify(runLocalMvpDemo());
  assert.equal(serialized.includes('local-native-material-for-demo-1234567890'), false);
});

test('request must be contained in verified grant scope', () => {
  const request = {
    op: 'read',
    repo: 'SocioProphet/example',
    branch: 'main'
  };
  const grant = {
    scope: {
      repos: ['SocioProphet/example'],
      branches: ['main'],
      ops: ['read']
    }
  };
  assert.equal(assertRequestWithinGrantScope(request, grant).reason, 'scope.allowed');
  assert.equal(assertRequestWithinGrantScope({ ...request, repo: 'Other/repo' }, grant).reason, 'scope.repo');
  assert.equal(assertRequestWithinGrantScope({ ...request, branch: 'other' }, grant).reason, 'scope.branch');
  assert.equal(assertRequestWithinGrantScope({ ...request, op: 'commit' }, grant).reason, 'scope.op');
});
