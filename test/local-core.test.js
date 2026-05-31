const test = require('node:test');
const assert = require('node:assert/strict');

const { canonicalize, stableHash } = require('../core/canonical');
const { NonceStore } = require('../core/nonce-store');
const { issueLocalGrant, revokeLocalGrant, verifyLocalGrant } = require('../core/local-authority');
const { AuditChain, ZERO_HASH } = require('../core/audit-chain');

const key = 'test-local-key';
const now = 1800000000;

function basePayload(overrides = {}) {
  return {
    token_id: '11111111-1111-4111-8111-111111111111',
    session_id: '22222222-2222-4222-8222-222222222222',
    agent_id: '33333333-3333-4333-8333-333333333333',
    issuer_node: 'node-a',
    scope: {
      repos: ['SocioProphet/example'],
      branches: ['work/*'],
      ops: ['read']
    },
    intent_hash: 'a'.repeat(64),
    policy_decision_ref: 'policy://ok',
    grant_ref: 'grant://ok',
    device_hash: 'b'.repeat(64),
    replay_nonce: 'nonce-0001',
    ...overrides
  };
}

test('canonicalize is stable across object insertion order', () => {
  const a = { z: 1, a: { b: true, a: 'x' } };
  const b = { a: { a: 'x', b: true }, z: 1 };
  assert.equal(canonicalize(a), canonicalize(b));
  assert.equal(stableHash(a), stableHash(b));
});

test('nonce store consumes once and rejects reuse', () => {
  const store = new NonceStore();
  assert.equal(store.consume('nonce-abc', now).ok, true);
  const second = store.consume('nonce-abc', now + 1);
  assert.equal(second.ok, false);
  assert.equal(second.reason, 'nonce.reused');
});

test('local grant verifies once and then rejects replay', () => {
  const grant = issueLocalGrant(basePayload(), key, now);
  const store = new NonceStore();
  assert.equal(verifyLocalGrant(grant, key, store, now + 1).ok, true);
  const replay = verifyLocalGrant(grant, key, store, now + 2);
  assert.equal(replay.ok, false);
  assert.equal(replay.reason, 'nonce.reused');
});

test('local grant rejects bad signature and expiration', () => {
  const grant = issueLocalGrant(basePayload({ replay_nonce: 'nonce-0002' }), key, now);
  assert.equal(verifyLocalGrant({ ...grant, agent_id: 'changed' }, key, new NonceStore(), now + 1).reason, 'grant.signature');
  assert.equal(verifyLocalGrant(grant, key, new NonceStore(), now + 901).reason, 'grant.expired');
});

test('local grant enforces fixed ttl', () => {
  assert.throws(() => issueLocalGrant(basePayload({ ttl_seconds: 901 }), key, now), /ttl must be 900 seconds/);
});

test('revoke local grant returns audit-compatible event surface', () => {
  const grant = issueLocalGrant(basePayload({ replay_nonce: 'nonce-0003' }), key, now);
  const revocation = revokeLocalGrant(grant, 'unit-test');
  assert.equal(revocation.ok, true);
  assert.equal(revocation.event_type, 'token.revoke');
  assert.equal(revocation.token_id, grant.token_id);
});

test('audit chain appends and verifies ordered events', () => {
  const chain = new AuditChain({ node_id: 'node-a', key });
  const first = chain.append({
    event_id: '44444444-4444-4444-8444-444444444444',
    event_type: 'intent.register',
    agent_id: 'agent-a',
    session_id: 'session-a',
    wall_time: '2026-05-31T00:00:00.000Z',
    monotonic_counter: 1
  });
  const second = chain.append({
    event_id: '55555555-5555-4555-8555-555555555555',
    event_type: 'token.issue',
    agent_id: 'agent-a',
    session_id: 'session-a',
    token_id: 'token-a',
    wall_time: '2026-05-31T00:00:01.000Z',
    monotonic_counter: 2
  });

  assert.equal(first.prev_event_hash, ZERO_HASH);
  assert.equal(second.prev_event_hash, first.event_hash);
  assert.equal(chain.verify().ok, true);
});

test('audit chain detects tampering', () => {
  const chain = new AuditChain({ node_id: 'node-a', key });
  chain.append({
    event_id: '66666666-6666-4666-8666-666666666666',
    event_type: 'git.op',
    agent_id: 'agent-a',
    session_id: 'session-a',
    wall_time: '2026-05-31T00:00:02.000Z',
    monotonic_counter: 3
  });
  chain.events[0].event_type = 'git.op.blocked';
  assert.equal(chain.verify().ok, false);
  assert.equal(chain.verify().reason, 'audit.event_hash');
});
