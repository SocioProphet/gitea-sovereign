const { canonicalize, hmacSha256Hex, sha256Hex, stableHash } = require('./canonical');

function assertMaterial(material) {
  if (typeof material !== 'string' || material.length < 16) {
    throw new Error('native material must be a non-empty string with sufficient entropy for tests');
  }
}

function materialDigest(material) {
  assertMaterial(material);
  return sha256Hex(material);
}

function materialSuffix(material) {
  assertMaterial(material);
  return material.slice(-8);
}

function buildNativeReceipt({ material, subject, now, key, key_id = 'local-native-adapter-hmac-v1' }) {
  assertMaterial(material);
  if (!subject || typeof subject !== 'object') throw new Error('subject is required');
  if (!key) throw new Error('key is required');

  const body = {
    receipt_id: subject.receipt_id,
    event_type: 'native.material.receipt',
    node_id: subject.node_id,
    agent_id: subject.agent_id,
    session_id: subject.session_id,
    token_id: subject.token_id,
    subject_repo: subject.subject_repo,
    subject_ref: subject.subject_ref,
    material_hash: materialDigest(material),
    material_suffix: materialSuffix(material),
    issued_at: now,
    key_id
  };
  const signature = hmacSha256Hex(key, canonicalize(body));
  return { ...body, signature };
}

function issueNativeReceipt(input) {
  const receipt = buildNativeReceipt(input);
  return {
    ok: true,
    receipt,
    receipt_hash: stableHash(receipt)
  };
}

function revokeNativeReceipt({ receipt, reason = 'revoked', now, key, key_id = 'local-native-adapter-hmac-v1' }) {
  if (!receipt || typeof receipt !== 'object') throw new Error('receipt is required');
  if (!key) throw new Error('key is required');
  const body = {
    event_type: 'native.material.revoke',
    receipt_id: receipt.receipt_id,
    token_id: receipt.token_id,
    node_id: receipt.node_id,
    agent_id: receipt.agent_id,
    session_id: receipt.session_id,
    material_hash: receipt.material_hash,
    reason,
    revoked_at: now,
    key_id
  };
  const signature = hmacSha256Hex(key, canonicalize(body));
  return {
    ok: true,
    event: { ...body, signature },
    event_hash: stableHash({ ...body, signature })
  };
}

module.exports = {
  buildNativeReceipt,
  issueNativeReceipt,
  materialDigest,
  materialSuffix,
  revokeNativeReceipt
};
