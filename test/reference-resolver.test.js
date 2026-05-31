const test = require('node:test');
const assert = require('node:assert/strict');

const {
  decisionReceipt,
  parseReference,
  resolvePair,
  resolveReference
} = require('../core/reference-resolver');

const key = 'resolver-test-key';
const now = 1800000000;

function subject() {
  return {
    receipt_id: '88888888-8888-4888-8888-888888888888',
    node_id: 'node-a',
    agent_id: 'agent-a',
    session_id: 'session-a',
    subject_repo: 'SocioProphet/example',
    subject_ref: 'refs/heads/work/example'
  };
}

test('parses policy and grant references', () => {
  assert.equal(parseReference('policy://ok/example').ok, true);
  assert.equal(parseReference('grant://ok/example').ok, true);
});

test('rejects malformed references', () => {
  assert.equal(parseReference('').reason, 'reference.missing');
  assert.equal(parseReference('bad').reason, 'reference.invalid');
  assert.equal(parseReference('other://ok/example').reason, 'reference.lane');
  assert.equal(parseReference('policy://maybe/example').reason, 'reference.state');
});

test('resolves ok, block, stale, and unknown states', () => {
  assert.equal(resolveReference('policy://ok/example').allowed, true);
  assert.equal(resolveReference('policy://block/example').reason, 'policy.block');
  assert.equal(resolveReference('policy://stale/example').reason, 'policy.stale');
  assert.equal(resolveReference('policy://unknown/example').reason, 'policy.unknown');
});

test('unknown write refs fail closed with write-specific reason', () => {
  const result = resolveReference('grant://unknown/example', { is_write: true });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'grant.unknown_write');
});

test('pair resolution requires both refs to allow', () => {
  assert.equal(resolvePair({ policy_ref: 'policy://ok/a', grant_ref: 'grant://ok/a' }).allowed, true);
  assert.equal(resolvePair({ policy_ref: 'policy://block/a', grant_ref: 'grant://ok/a' }).reason, 'policy.block');
  assert.equal(resolvePair({ policy_ref: 'policy://ok/a', grant_ref: 'grant://stale/a' }).reason, 'grant.stale');
});

test('decision receipt signs allowed and blocked decisions', () => {
  const allowed = resolvePair({ policy_ref: 'policy://ok/a', grant_ref: 'grant://ok/a' });
  const receipt = decisionReceipt({ decision: allowed, subject: subject(), now, key });
  assert.equal(receipt.ok, true);
  assert.equal(receipt.receipt.allowed, true);
  assert.equal(typeof receipt.receipt_hash, 'string');

  const blocked = resolvePair({ policy_ref: 'policy://ok/a', grant_ref: 'grant://stale/a', is_write: true });
  const blockedReceipt = decisionReceipt({ decision: blocked, subject: subject(), now, key });
  assert.equal(blockedReceipt.receipt.allowed, false);
  assert.equal(blockedReceipt.receipt.grant_reason, 'grant.stale');
});

test('decision receipt requires decision, subject, and key', () => {
  assert.throws(() => decisionReceipt({ decision: null, subject: subject(), now, key }), /decision is required/);
  assert.throws(() => decisionReceipt({ decision: resolvePair({ policy_ref: 'policy://ok/a', grant_ref: 'grant://ok/a' }), subject: null, now, key }), /subject is required/);
  assert.throws(() => decisionReceipt({ decision: resolvePair({ policy_ref: 'policy://ok/a', grant_ref: 'grant://ok/a' }), subject: subject(), now }), /key is required/);
});
