'use strict';
/**
 * runtime-config — schema + fixture invariants for runtime config and adapter contracts.
 */

module.exports = function validateRuntimeConfig({ readJson, fail }) {
  const packageJson = readJson('package.json');
  if (packageJson) {
    if (!packageJson.scripts?.check) fail('package.json must define scripts.check');
    if (!packageJson.scripts?.validate) fail('package.json must define scripts.validate');
  }

  const controlConfig = readJson('schemas/control-config.schema.json');
  if (controlConfig) {
    for (const key of ['node_id', 'audience', 'mode', 'policy', 'grants', 'path_policy']) {
      if (!controlConfig.properties[key]) fail(`control config schema must include ${key}`);
    }
    if (controlConfig.properties.mode.enum.includes('runtime') !== true) fail('control config must reserve runtime mode');
  }

  const runtimeConfig = readJson('schemas/runtime-config.schema.json');
  if (runtimeConfig) {
    for (const key of ['runtime_mode', 'local_scaffold_default', 'bindings', 'guards']) {
      if (!runtimeConfig.properties[key]) fail(`runtime config schema must include ${key}`);
    }
    if (!runtimeConfig.properties.runtime_mode.enum.includes('disabled')) fail('runtime config must include disabled mode');
    if (!runtimeConfig.properties.runtime_mode.enum.includes('enabled')) fail('runtime config must reserve enabled mode');
    if (runtimeConfig.properties.local_scaffold_default.const !== true) fail('runtime config must preserve local scaffold default');
    if (runtimeConfig.definitions.transportBinding.properties.enabled.const !== false) fail('git transport must remain disabled in scaffold schema');
  }

  const runtimeDisabled = readJson('examples/valid/runtime-config.disabled.example.json');
  if (runtimeDisabled) {
    if (runtimeDisabled.runtime_mode !== 'disabled') fail('runtime disabled fixture must set runtime_mode=disabled');
    if (runtimeDisabled.local_scaffold_default !== true) fail('runtime disabled fixture must preserve local scaffold default');
    for (const key of ['gitea', 'upstream_refs', 'ledger_export']) {
      if (runtimeDisabled.bindings[key].enabled !== false) fail(`runtime disabled fixture must disable ${key}`);
    }
    if (runtimeDisabled.bindings.git_transport.enabled !== false) fail('runtime disabled fixture must disable git transport');
    if (runtimeDisabled.bindings.git_transport.mode !== 'disabled') fail('runtime disabled fixture git transport mode must be disabled');
    for (const key of Object.keys(runtimeDisabled.guards)) {
      if (runtimeDisabled.guards[key] !== true) fail(`runtime disabled fixture guard must be true: ${key}`);
    }
  }

  const adapterDisabled = readJson('examples/valid/runtime-adapter.disabled.example.json');
  if (adapterDisabled) {
    if (adapterDisabled.adapter_status !== 'design-only') fail('runtime adapter fixture must remain design-only');
    if (adapterDisabled.runtime_binding_enabled !== false) fail('runtime adapter fixture must keep binding disabled');
    for (const field of ['operation_status', 'operation_digest', 'receipt_hash', 'audit_event_ref', 'failure_reason']) {
      if (!adapterDisabled.allowed_outputs.includes(field)) fail(`runtime adapter fixture must allow evidence field: ${field}`);
    }
    for (const field of ['raw_material', 'native_token', 'access_token', 'password', 'secret']) {
      if (!adapterDisabled.forbidden_outputs.includes(field)) fail(`runtime adapter fixture must forbid sensitive field: ${field}`);
    }
    for (const item of ['service_unavailable', 'rejected_response', 'stale_reference', 'malformed_operation']) {
      if (!adapterDisabled.required_fail_closed_cases.includes(item)) fail(`runtime adapter fixture must require fail-closed case: ${item}`);
    }
  }

  const upstreamDisabled = readJson('examples/valid/upstream-reference-binding.disabled.example.json');
  if (upstreamDisabled) {
    if (upstreamDisabled.binding_status !== 'planning-only') fail('upstream reference binding fixture must remain planning-only');
    if (upstreamDisabled.runtime_binding_enabled !== false) fail('upstream reference binding fixture must keep binding disabled');
    for (const system of ['policy-fabric', 'mcp-a2a-zero-trust']) {
      if (!upstreamDisabled.owning_systems.includes(system)) fail(`upstream binding fixture must name owning system: ${system}`);
    }
    for (const state of ['ok', 'block', 'stale', 'unknown']) {
      if (!upstreamDisabled.local_states.includes(state)) fail(`upstream binding fixture must include local state: ${state}`);
    }
    for (const item of ['dependency_unavailable', 'timeout', 'malformed_response', 'missing_decision_id', 'stale_cache', 'integrity_mismatch', 'unsupported_version']) {
      if (!upstreamDisabled.fail_closed_cases.includes(item)) fail(`upstream binding fixture must require fail-closed case: ${item}`);
    }
    if (upstreamDisabled.write_unknown_behavior !== 'stop') fail('upstream binding fixture must stop write-class unknown outcomes');
  }

  const ledgerDisabled = readJson('examples/valid/ledger-export-binding.disabled.example.json');
  if (ledgerDisabled) {
    if (ledgerDisabled.binding_status !== 'planning-only') fail('ledger export binding fixture must remain planning-only');
    if (ledgerDisabled.runtime_binding_enabled !== false) fail('ledger export binding fixture must keep binding disabled');
    if (ledgerDisabled.consumer_issue_ref !== 'SocioProphet/model-governance-ledger#24') fail('ledger export binding fixture must track consumer issue #24');
    if (ledgerDisabled.producer_role !== 'source-control-receipt-producer') fail('ledger export binding fixture must preserve producer role');
    if (ledgerDisabled.consumer_role !== 'canonical-evidence-receipt-consumer') fail('ledger export binding fixture must preserve consumer role');
    if (ledgerDisabled.audit_before_export_required !== true) fail('ledger export binding fixture must require audit before export');
    for (const item of ['missing_consumer_contract', 'dependency_unavailable', 'timeout', 'malformed_acknowledgement', 'acknowledgement_hash_mismatch', 'unsupported_consumer_version', 'sequence_gap', 'audit_chain_verification_failure', 'duplicate_batch_rejection']) {
      if (!ledgerDisabled.fail_closed_cases.includes(item)) fail(`ledger export binding fixture must require fail-closed case: ${item}`);
    }
  }

  const localRuntimeDemo = readJson('examples/valid/local-runtime-demo.disabled.example.json');
  if (localRuntimeDemo) {
    if (localRuntimeDemo.demo_status !== 'planning-only') fail('local runtime demo fixture must remain planning-only');
    if (localRuntimeDemo.runtime_demo_enabled !== false) fail('local runtime demo fixture must keep demo disabled');
    for (const blocker of ['runtime_config_schema', 'runtime_adapter_contract', 'upstream_reference_binding_contract', 'ledger_export_binding_contract', 'model_governance_ledger_consumer_contract', 'git_transport_disabled_or_enforced', 'audit_before_export', 'local_scaffold_fallback']) {
      if (!localRuntimeDemo.required_blockers.includes(blocker)) fail(`local runtime demo fixture must require blocker: ${blocker}`);
    }
    for (const behavior of ['refuse_runtime_execution', 'preserve_local_mvp_demo', 'avoid_live_bindings', 'return_fail_closed_reason', 'no_infrastructure_mutation']) {
      if (!localRuntimeDemo.disabled_behavior.includes(behavior)) fail(`local runtime demo fixture must require disabled behavior: ${behavior}`);
    }
    for (const field of ['runtime_mode', 'request_digest', 'path_decision', 'reference_decision', 'grant_verification', 'request_coverage_decision', 'adapter_operation_status', 'audit_verification', 'export_batch_hash', 'acknowledgement_hash', 'failure_reason']) {
      if (!localRuntimeDemo.required_evidence_fields.includes(field)) fail(`local runtime demo fixture must require evidence field: ${field}`);
    }
  }
};
