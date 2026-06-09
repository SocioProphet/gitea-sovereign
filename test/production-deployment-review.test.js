const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const review = fs.readFileSync('docs/production-deployment-review.md', 'utf8');
const fixture = JSON.parse(fs.readFileSync('examples/valid/production-deployment-review.blocked.example.json', 'utf8'));

test('production deployment review remains blocked scaffold', () => {
  assert.match(review, /Review scaffold only/);
  assert.match(review, /does not have production deployment approval/);
  assert.equal(fixture.review_status, 'blocked');
  assert.equal(fixture.production_deployment_enabled, false);
});

test('production deployment review requires all gates', () => {
  for (const gate of [
    'runtime_config_disabled_default',
    'runtime_adapter_negative_tests',
    'upstream_bindings_implemented',
    'ledger_consumer_contract_implemented',
    'local_runtime_demo_passed',
    'git_transport_disabled_or_enforced',
    'production_grade_canonicalization',
    'secret_storage_key_rotation_reviewed',
    'dependency_outage_fail_closed',
    'rollback_incident_response_ready',
    'safe_observability',
    'sociosphere_prophet_platform_contracts_reviewed'
  ]) {
    assert.equal(fixture.required_gates.includes(gate), true);
  }
});

test('production deployment review requires review artifacts', () => {
  for (const artifact of [
    'threat_model_update',
    'data_flow_diagram',
    'trust_boundary_diagram',
    'dependency_inventory',
    'secret_key_management_plan',
    'evidence_audit_retention_plan',
    'rollback_plan',
    'incident_response_runbook',
    'deployment_topology',
    'operational_readiness_checklist',
    'sign_off_record'
  ]) {
    assert.equal(fixture.required_review_artifacts.includes(artifact), true);
  }
});

test('production deployment review forbids production actions until approved', () => {
  for (const item of [
    'production_deployment',
    'deployment_manifests',
    'hosted_service_creation',
    'infrastructure_mutation',
    'public_endpoint_exposure',
    'transport_enablement',
    'runtime_behavior_changes'
  ]) {
    assert.equal(fixture.forbidden_until_approved.includes(item), true);
  }
});
