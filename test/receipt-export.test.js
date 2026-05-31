const test = require('node:test');
const assert = require('node:assert/strict');

const {
  acknowledgeExportBatch,
  batchDigest,
  buildExportBatch,
  classifyExport,
  nextExportRange,
  verifyExportBatch
} = require('../core/receipt-export');

const key = 'export-test-key';

function events() {
  return [
    { seq: 3, event_hash: 'a'.repeat(64) },
    { seq: 4, event_hash: 'b'.repeat(64) },
    { seq: 5, event_hash: 'c'.repeat(64) }
  ];
}

function batch() {
  return buildExportBatch({
    export_batch_id: '99999999-9999-4999-8999-999999999999',
    node_id: 'node-a',
    events: events(),
    destination_ref: 'model-governance-ledger://local/source-control',
    exported_at: '2026-05-31T00:00:00.000Z',
    key
  });
}

test('batch digest is stable across identical event hashes', () => {
  assert.equal(batchDigest(events()), batchDigest(events()));
});

test('build export batch captures sequence range and hash', () => {
  const built = batch();
  assert.equal(built.first_seq, 3);
  assert.equal(built.last_seq, 5);
  assert.equal(built.event_count, 3);
  assert.equal(built.ack_required, true);
  assert.equal(built.batch_hash, batchDigest(events()));
});

test('verify export batch accepts matching events and rejects tamper', () => {
  const built = batch();
  assert.equal(verifyExportBatch(built, events(), key).ok, true);
  const tampered = events();
  tampered[1].event_hash = 'd'.repeat(64);
  assert.equal(verifyExportBatch(built, tampered, key).reason, 'batch.hash');
});

test('verify export batch rejects sequence and signature mismatch', () => {
  const built = batch();
  const shifted = events().map((event) => ({ ...event, seq: event.seq + 1 }));
  assert.equal(verifyExportBatch(built, shifted, key).reason, 'batch.first_seq');
  assert.equal(verifyExportBatch({ ...built, signature: 'bad' }, events(), key).reason, 'batch.signature');
});

test('acknowledgement records batch identity and signs it', () => {
  const built = batch();
  const ack = acknowledgeExportBatch({
    batch: built,
    ack_id: 'ack-1',
    received_at: '2026-05-31T00:00:01.000Z',
    key
  });
  assert.equal(ack.ok, true);
  assert.equal(ack.ack.export_batch_id, built.export_batch_id);
  assert.equal(ack.ack.batch_hash, built.batch_hash);
  assert.equal(typeof ack.ack_hash, 'string');
});

test('duplicate classification is idempotent', () => {
  const built = batch();
  const seen = new Set([built.export_batch_id]);
  assert.equal(classifyExport(seen, built).status, 'duplicate');
  assert.equal(classifyExport(new Set(), built).status, 'new');
});

test('next export range supports partial recovery', () => {
  const range = nextExportRange(events(), 3);
  assert.equal(range.ok, true);
  assert.equal(range.first_seq, 4);
  assert.equal(range.last_seq, 5);
  assert.equal(range.events.length, 2);
  assert.equal(nextExportRange(events(), 5).reason, 'export.empty');
});

test('events must be contiguous and non-empty', () => {
  assert.throws(() => batchDigest([]), /events are required/);
  assert.throws(() => batchDigest([{ seq: 1, event_hash: 'a' }, { seq: 3, event_hash: 'b' }]), /contiguous/);
});
