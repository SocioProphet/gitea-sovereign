const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const contract = fs.readFileSync('docs/ledger-export-binding-contract.md', 'utf8');
const fixture = JSON.parse(fs.readFileSync('examples/valid/ledger-export-binding.disabled.example.json', 'utf8'));

test('ledger export binding contract remains planning-only', () => {
  assert.match(contract, /Planning scaffold only/);
  assert.match(contract, /no live ledger calls/);
  assert.equal(fixture.binding_status, 'planning-only');
  assert.equal(fixture.runtime_binding_enabled, false);
});

test('ledger export binding preserves producer and consumer ownership', () => {
  assert.equal(fixture.producer_role, 'source-control-receipt-producer');
  assert.equal(fixture.consumer_role, 'canonical-evidence-receipt-consumer');
  assert.match(contract, /producer must not become the ledger authority/);
  assert.match(contract, /ledger must not become the source-control authority/);
});

test('ledger export binding tracks consumer issue blocker', () => {
  assert.equal(fixture.consumer_issue_ref, 'SocioProphet/model-governance-ledger#24');
  assert.match(contract, /SocioProphet\/model-governance-ledger#24/);
});

test('ledger export binding preserves audit export path', () => {
  assert.equal(fixture.export_path, 'audit-log->export-cursor->model-governance-ledger');
  assert.match(contract, /Audit log -> export cursor -> model-governance-ledger/);
});

test('ledger export binding requires producer inputs and outputs', () => {
  for (const input of [
    'runtime_config',
    'verified_audit_chain',
    'export_cursor_state',
    'contiguous_event_range',
    'destination_reference',
    'consumer_contract_reference',
    'timeout_retry_policy',
    'dependency_health_state'
  ]) {
    assert.equal(fixture.required_inputs.includes(input), true);
  }

  for (const output of [
    'export_batch_id',
    'first_seq',
    'last_seq',
    'batch_hash',
    'destination_ref',
    'ack_hash',
    'audit_event_ref',
    'failure_reason'
  ]) {
    assert.equal(fixture.required_outputs.includes(output), true);
  }
});

test('ledger export binding requires fail-closed cases and audit-before-export', () => {
  for (const item of [
    'missing_consumer_contract',
    'dependency_unavailable',
    'timeout',
    'malformed_acknowledgement',
    'acknowledgement_hash_mismatch',
    'unsupported_consumer_version',
    'sequence_gap',
    'audit_chain_verification_failure',
    'duplicate_batch_rejection'
  ]) {
    assert.equal(fixture.fail_closed_cases.includes(item), true);
  }
  assert.equal(fixture.audit_before_export_required, true);
});
