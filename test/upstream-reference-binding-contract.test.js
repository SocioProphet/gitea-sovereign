const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const contract = fs.readFileSync('docs/upstream-reference-binding-contract.md', 'utf8');
const fixture = JSON.parse(fs.readFileSync('examples/valid/upstream-reference-binding.disabled.example.json', 'utf8'));

test('upstream reference binding contract remains planning-only', () => {
  assert.match(contract, /Planning scaffold only/);
  assert.match(contract, /no live upstream calls/);
  assert.equal(fixture.binding_status, 'planning-only');
  assert.equal(fixture.runtime_binding_enabled, false);
});

test('upstream reference binding preserves owning system separation', () => {
  assert.equal(fixture.owning_systems.includes('policy-fabric'), true);
  assert.equal(fixture.owning_systems.includes('mcp-a2a-zero-trust'), true);
  assert.match(contract, /must not become the policy engine/);
});

test('upstream reference binding preserves local state mapping', () => {
  assert.deepEqual(fixture.local_states, ['ok', 'block', 'stale', 'unknown']);
  for (const state of fixture.local_states) {
    assert.match(contract, new RegExp(`\\\`${state}\\\``));
  }
});

test('upstream reference binding requires fail-closed cases', () => {
  for (const item of [
    'dependency_unavailable',
    'timeout',
    'malformed_response',
    'missing_decision_id',
    'stale_cache',
    'integrity_mismatch',
    'unsupported_version'
  ]) {
    assert.equal(fixture.fail_closed_cases.includes(item), true);
  }
  assert.equal(fixture.write_unknown_behavior, 'stop');
});

test('upstream reference binding requires evidence fields', () => {
  for (const field of [
    'upstream_system_id',
    'upstream_reference_id',
    'mapped_local_state',
    'decision_digest',
    'dependency_health_summary',
    'audit_event_ref',
    'failure_reason'
  ]) {
    assert.equal(fixture.required_evidence_fields.includes(field), true);
  }
});
