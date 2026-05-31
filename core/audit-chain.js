const { canonicalize, hmacSha256Hex, stableHash } = require('./canonical');

const ZERO_HASH = '0'.repeat(64);

function hashEventBody(event) {
  return stableHash(event);
}

function signEvent(event, key) {
  return hmacSha256Hex(key, canonicalize(event));
}

class AuditChain {
  constructor({ node_id, key_id = 'local-audit-hmac-v1', key }) {
    if (!node_id) throw new Error('node_id is required');
    if (!key) throw new Error('key is required');
    this.node_id = node_id;
    this.key_id = key_id;
    this.key = key;
    this.events = [];
  }

  append(event) {
    const seq = this.events.length;
    const prev_event_hash = seq === 0 ? ZERO_HASH : this.events[seq - 1].event_hash;
    const base = {
      seq,
      event_id: event.event_id,
      event_type: event.event_type,
      node_id: event.node_id || this.node_id,
      agent_id: event.agent_id,
      session_id: event.session_id,
      intent_id: event.intent_id,
      token_id: event.token_id,
      policy_decision_ref: event.policy_decision_ref,
      grant_ref: event.grant_ref,
      subject_repo: event.subject_repo,
      subject_ref: event.subject_ref,
      operation_digest: event.operation_digest,
      receipt_hash: event.receipt_hash,
      prev_event_hash,
      key_id: this.key_id,
      wall_time: event.wall_time,
      monotonic_counter: event.monotonic_counter
    };
    const event_hash = hashEventBody(base);
    const signed = { ...base, event_hash };
    const signature = signEvent(signed, this.key);
    const complete = { ...signed, signature };
    this.events.push(complete);
    return complete;
  }

  verify() {
    let previous = ZERO_HASH;
    for (let index = 0; index < this.events.length; index += 1) {
      const event = this.events[index];
      if (event.seq !== index) return { ok: false, reason: 'audit.seq', index };
      if (event.prev_event_hash !== previous) return { ok: false, reason: 'audit.prev_hash', index };
      const { signature, event_hash, ...base } = event;
      const expectedHash = hashEventBody(base);
      if (event_hash !== expectedHash) return { ok: false, reason: 'audit.event_hash', index };
      const expectedSignature = signEvent({ ...base, event_hash }, this.key);
      if (signature !== expectedSignature) return { ok: false, reason: 'audit.signature', index };
      previous = event_hash;
    }
    return { ok: true, reason: 'audit.verified', length: this.events.length };
  }
}

module.exports = {
  AuditChain,
  ZERO_HASH,
  hashEventBody,
  signEvent
};
