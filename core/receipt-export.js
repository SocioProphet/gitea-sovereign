const { canonicalize, hmacSha256Hex, stableHash } = require('./canonical');

function assertEvents(events) {
  if (!Array.isArray(events) || events.length === 0) throw new Error('events are required');
  for (let index = 0; index < events.length; index += 1) {
    if (events[index].seq !== index + events[0].seq) throw new Error('event seq range must be contiguous');
    if (!events[index].event_hash) throw new Error('event_hash is required');
  }
}

function batchDigest(events) {
  assertEvents(events);
  return stableHash(events.map((event) => ({ seq: event.seq, event_hash: event.event_hash })));
}

function buildExportBatch({ export_batch_id, node_id, events, destination_ref, exported_at, key, key_id = 'local-export-hmac-v1' }) {
  if (!export_batch_id) throw new Error('export_batch_id is required');
  if (!node_id) throw new Error('node_id is required');
  if (!destination_ref) throw new Error('destination_ref is required');
  if (!exported_at) throw new Error('exported_at is required');
  if (!key) throw new Error('key is required');
  assertEvents(events);

  const body = {
    export_batch_id,
    node_id,
    first_seq: events[0].seq,
    last_seq: events[events.length - 1].seq,
    batch_hash: batchDigest(events),
    destination_ref,
    exported_at,
    ack_required: true,
    event_count: events.length,
    key_id
  };
  const signature = hmacSha256Hex(key, canonicalize(body));
  return { ...body, signature };
}

function verifyExportBatch(batch, events, key) {
  if (!batch || typeof batch !== 'object') return { ok: false, reason: 'batch.invalid' };
  if (!key) return { ok: false, reason: 'batch.key_missing' };
  try {
    assertEvents(events);
  } catch (err) {
    return { ok: false, reason: 'events.invalid', detail: err.message };
  }
  if (batch.first_seq !== events[0].seq) return { ok: false, reason: 'batch.first_seq' };
  if (batch.last_seq !== events[events.length - 1].seq) return { ok: false, reason: 'batch.last_seq' };
  if (batch.event_count !== events.length) return { ok: false, reason: 'batch.event_count' };
  if (batch.batch_hash !== batchDigest(events)) return { ok: false, reason: 'batch.hash' };
  const { signature, ...body } = batch;
  const expected = hmacSha256Hex(key, canonicalize(body));
  if (signature !== expected) return { ok: false, reason: 'batch.signature' };
  return { ok: true, reason: 'batch.verified' };
}

function acknowledgeExportBatch({ batch, ack_id, received_at, key, key_id = 'local-export-ack-hmac-v1' }) {
  if (!batch || typeof batch !== 'object') throw new Error('batch is required');
  if (!ack_id) throw new Error('ack_id is required');
  if (!received_at) throw new Error('received_at is required');
  if (!key) throw new Error('key is required');
  const body = {
    ack_id,
    export_batch_id: batch.export_batch_id,
    node_id: batch.node_id,
    first_seq: batch.first_seq,
    last_seq: batch.last_seq,
    batch_hash: batch.batch_hash,
    received_at,
    key_id
  };
  const signature = hmacSha256Hex(key, canonicalize(body));
  const ack = { ...body, signature };
  return { ok: true, ack, ack_hash: stableHash(ack) };
}

function classifyExport(existingBatchIds, batch) {
  if (!batch || !batch.export_batch_id) return { ok: false, reason: 'batch.invalid' };
  if (existingBatchIds && existingBatchIds.has(batch.export_batch_id)) {
    return { ok: true, status: 'duplicate', export_batch_id: batch.export_batch_id };
  }
  return { ok: true, status: 'new', export_batch_id: batch.export_batch_id };
}

function nextExportRange(events, lastAckSeq) {
  const pending = events.filter((event) => event.seq > lastAckSeq);
  if (pending.length === 0) return { ok: true, events: [], reason: 'export.empty' };
  return { ok: true, events: pending, first_seq: pending[0].seq, last_seq: pending[pending.length - 1].seq };
}

module.exports = {
  acknowledgeExportBatch,
  batchDigest,
  buildExportBatch,
  classifyExport,
  nextExportRange,
  verifyExportBatch
};
