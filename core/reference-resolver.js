const { canonicalize, hmacSha256Hex, stableHash } = require('./canonical');

const STATES = new Set(['ok', 'block', 'stale', 'unknown']);
const LANES = new Set(['policy', 'grant']);

function parseReference(ref) {
  if (typeof ref !== 'string' || ref.length === 0) {
    return { ok: false, reason: 'reference.missing' };
  }
  const match = ref.match(/^([a-z]+):\/\/([a-z]+)\/(.+)$/);
  if (!match) return { ok: false, reason: 'reference.invalid' };
  const [, lane, state, id] = match;
  if (!LANES.has(lane)) return { ok: false, reason: 'reference.lane' };
  if (!STATES.has(state)) return { ok: false, reason: 'reference.state' };
  return { ok: true, lane, state, id };
}

function resolveReference(ref, context = {}) {
  const parsed = parseReference(ref);
  if (!parsed.ok) return { allowed: false, reason: parsed.reason, ref };
  const isWrite = context.is_write === true;
  if (parsed.state === 'ok') return { allowed: true, reason: `${parsed.lane}.ok`, ...parsed };
  if (parsed.state === 'block') return { allowed: false, reason: `${parsed.lane}.block`, ...parsed };
  if (parsed.state === 'stale') return { allowed: false, reason: `${parsed.lane}.stale`, ...parsed };
  if (parsed.state === 'unknown') {
    return { allowed: false, reason: isWrite ? `${parsed.lane}.unknown_write` : `${parsed.lane}.unknown`, ...parsed };
  }
  return { allowed: false, reason: 'reference.unhandled', ...parsed };
}

function resolvePair({ policy_ref, grant_ref, is_write = false }) {
  const policy = resolveReference(policy_ref, { is_write });
  if (!policy.allowed) return { allowed: false, reason: policy.reason, policy };
  const grant = resolveReference(grant_ref, { is_write });
  if (!grant.allowed) return { allowed: false, reason: grant.reason, policy, grant };
  return { allowed: true, reason: 'references.ok', policy, grant };
}

function decisionReceipt({ decision, subject, now, key, key_id = 'local-reference-hmac-v1' }) {
  if (!decision || typeof decision !== 'object') throw new Error('decision is required');
  if (!subject || typeof subject !== 'object') throw new Error('subject is required');
  if (!key) throw new Error('key is required');

  const body = {
    receipt_id: subject.receipt_id,
    event_type: 'reference.decision.receipt',
    node_id: subject.node_id,
    agent_id: subject.agent_id,
    session_id: subject.session_id,
    subject_repo: subject.subject_repo,
    subject_ref: subject.subject_ref,
    allowed: decision.allowed === true,
    reason: decision.reason,
    policy_reason: decision.policy ? decision.policy.reason : undefined,
    grant_reason: decision.grant ? decision.grant.reason : undefined,
    issued_at: now,
    key_id
  };
  const signature = hmacSha256Hex(key, canonicalize(body));
  const receipt = { ...body, signature };
  return { ok: true, receipt, receipt_hash: stableHash(receipt) };
}

module.exports = {
  decisionReceipt,
  parseReference,
  resolvePair,
  resolveReference
};
