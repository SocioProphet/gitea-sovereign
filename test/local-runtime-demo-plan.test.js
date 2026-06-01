const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const plan = fs.readFileSync('docs/local-runtime-demo-plan.md', 'utf8');
const fixture = JSON.parse(fs.readFileSync('examples/valid/local-runtime-demo.disabled.example.json', 'utf8'));

test('local runtime demo plan remains planning-only', () => {
  assert.match(plan, /Planning scaffold only/);
  assert.match(plan, /no runtime demo implementation/);
  assert.equal(fixture.demo_status, 'planning-only');
  assert.equal(fixture.runtime_demo_enabled, false);
});

test('local runtime demo plan requires all blockers', () => {
  for (const blocker of [
    'runtime_config_schema',
    'runtime_adapter_contract',
    'upstream_reference_binding_contract',
    'ledger_export_binding_contract',
    'model_governance_ledger_consumer_contract',
    'git_transport_disabled_or_enforced',
    'audit_before_export',
    'local_scaffold_fallback'
  ]) {
    assert.equal(fixture.required_blockers.includes(blocker), true);
  }
});

test('local runtime demo disabled behavior fails closed', () => {
  for (const behavior of [
    'refuse_runtime_execution',
    'preserve_local_mvp_demo',
    'avoid_live_bindings',
    'return_fail_closed_reason',
    'no_infrastructure_mutation'
  ]) {
    assert.equal(fixture.disabled_behavior.includes(behavior), true);
  }
});

test('local runtime demo evidence fields are specified', () => {
  for (const field of [
    'runtime_mode',
    'request_digest',
    'path_decision',
    'reference_decision',
    'grant_verification',
    'request_coverage_decision',
    'adapter_operation_status',
    'audit_verification',
    'export_batch_hash',
    'acknowledgement_hash',
    'failure_reason'
  ]) {
    assert.equal(fixture.required_evidence_fields.includes(field), true);
  }
});

test('local runtime demo plan keeps live bindings disabled in scaffold', () => {
  assert.match(plan, /no live Gitea calls/);
  assert.match(plan, /no live upstream calls/);
  assert.match(plan, /no live ledger calls/);
  assert.match(plan, /no Git transport enablement/);
});
