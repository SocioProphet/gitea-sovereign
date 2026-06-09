'use strict';
/**
 * production-review — invariants for the production deployment review scaffold.
 */
const fs = require('fs');
const path = require('path');

module.exports = function validateProductionReview({ ROOT, readJson, readText, fail }) {
  const productionReview = readJson('examples/valid/production-deployment-review.blocked.example.json');
  if (productionReview) {
    if (productionReview.review_status !== 'blocked') fail('production deployment review fixture must remain blocked');
    if (productionReview.production_deployment_enabled !== false) fail('production deployment review fixture must keep deployment disabled');

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
      'sociosphere_prophet_platform_contracts_reviewed',
    ]) {
      if (!productionReview.required_gates.includes(gate)) fail(`production deployment review fixture must require gate: ${gate}`);
    }

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
      'sign_off_record',
    ]) {
      if (!productionReview.required_review_artifacts.includes(artifact)) fail(`production deployment review fixture must require artifact: ${artifact}`);
    }

    for (const item of [
      'production_deployment',
      'deployment_manifests',
      'hosted_service_creation',
      'infrastructure_mutation',
      'public_endpoint_exposure',
      'transport_enablement',
      'runtime_behavior_changes',
    ]) {
      if (!productionReview.forbidden_until_approved.includes(item)) fail(`production deployment review fixture must forbid before approval: ${item}`);
    }
  }

  const productionReviewDoc = fs.existsSync(path.join(ROOT, 'docs/production-deployment-review.md'))
    ? readText('docs/production-deployment-review.md').toLowerCase()
    : '';

  for (const phrase of [
    'review scaffold only',
    'does not have production deployment approval',
    'required review gates',
    'no production deployment',
  ]) {
    if (!productionReviewDoc.includes(phrase)) fail(`production deployment review doc must mention: ${phrase}`);
  }
};
