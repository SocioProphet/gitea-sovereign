const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const contract = fs.readFileSync('docs/runtime-adapter-contract.md', 'utf8');
const fixture = JSON.parse(fs.readFileSync('examples/valid/runtime-adapter.disabled.example.json', 'utf8'));

test('runtime adapter contract is design-only', () => {
  assert.match(contract, /Design scaffold only/);
  assert.match(contract, /does not enable runtime behavior/);
  assert.equal(fixture.adapter_status, 'design-only');
  assert.equal(fixture.runtime_binding_enabled, false);
});

test('runtime adapter fixture points at runtime config and contract docs', () => {
  assert.equal(fixture.config_ref, 'examples/valid/runtime-config.disabled.example.json');
  assert.equal(fixture.contract_ref, 'docs/runtime-adapter-contract.md');
});

test('runtime adapter output is evidence shaped only', () => {
  assert.deepEqual(fixture.allowed_outputs, [
    'operation_status',
    'operation_digest',
    'receipt_hash',
    'audit_event_ref',
    'failure_reason'
  ]);
});

test('runtime adapter fixture forbids sensitive output fields', () => {
  for (const field of ['raw_material', 'native_token', 'access_token', 'password', 'secret']) {
    assert.equal(fixture.forbidden_outputs.includes(field), true);
  }
});

test('runtime adapter requires fail-closed cases before implementation', () => {
  for (const required of ['service_unavailable', 'rejected_response', 'stale_reference', 'malformed_operation']) {
    assert.equal(fixture.required_fail_closed_cases.includes(required), true);
  }
});
