const test = require('node:test');
const assert = require('node:assert/strict');

const {
  issueNativeReceipt,
  materialDigest,
  materialSuffix,
  revokeNativeReceipt
} = require('../core/native-adapter');

const material = 'native-material-for-tests-1234567890';
const key = 'local-adapter-test-key';
const now = 1800000000;

function subject() {
  return {
    receipt_id: '77777777-7777-4777-8777-777777777777',
    node_id: 'node-a',
    agent_id: 'agent-a',
    session_id: 'session-a',
    token_id: 'token-a',
    subject_repo: 'SocioProphet/example',
    subject_ref: 'refs/heads/work/example'
  };
}

test('material digest is stable and suffix is bounded', () => {
  assert.equal(materialDigest(material), materialDigest(material));
  assert.equal(materialSuffix(material), '34567890');
});

test('issue receipt does not return raw native material', () => {
  const result = issueNativeReceipt({ material, subject: subject(), now, key });
  assert.equal(result.ok, true);
  assert.equal(result.receipt.material_hash, materialDigest(material));
  assert.equal(result.receipt.material_suffix, '34567890');
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes(material), false);
});

test('revoke receipt event does not return raw native material', () => {
  const issued = issueNativeReceipt({ material, subject: subject(), now, key });
  const revoked = revokeNativeReceipt({ receipt: issued.receipt, reason: 'unit-test', now: now + 1, key });
  assert.equal(revoked.ok, true);
  assert.equal(revoked.event.material_hash, materialDigest(material));
  const serialized = JSON.stringify(revoked);
  assert.equal(serialized.includes(material), false);
});

test('adapter requires sufficient transient material', () => {
  assert.throws(() => issueNativeReceipt({ material: 'short', subject: subject(), now, key }), /sufficient entropy/);
});

test('adapter requires subject and signing key', () => {
  assert.throws(() => issueNativeReceipt({ material, subject: null, now, key }), /subject is required/);
  assert.throws(() => issueNativeReceipt({ material, subject: subject(), now }), /key is required/);
});
