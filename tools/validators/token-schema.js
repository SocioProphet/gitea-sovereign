'use strict';
/**
 * token-schema — token + intent + receipt + capability schema/fixture invariants.
 */

module.exports = function validateTokenSchema({ readJson, fail }) {
  const token = readJson('schemas/token.schema.json');
  if (token) {
    const props = token.properties || {};
    if (!props.expires_at || !props.issued_at || !props.not_before) fail('token schema must include issued_at/not_before/expires_at');
    if (!props.alg || !Array.isArray(props.alg.enum) || !props.alg.enum.includes('HS256')) fail('token schema must include HS256 bootstrap alg');
    if (!props.alg.enum.includes('Ed25519')) fail('token schema must reserve Ed25519 upgrade path');
    if (!props.scope?.properties?.paths_deny) fail('token scope must include paths_deny');
  }

  const tokenExample = readJson('examples/valid/token.example.json');
  if (tokenExample) {
    if (tokenExample.expires_at - tokenExample.issued_at !== 900) fail('valid token fixture must use 900 second TTL');
    if (tokenExample.not_before > tokenExample.issued_at) fail('valid token fixture not_before must not exceed issued_at');
    if (tokenExample.aud !== 'gitea-sovereign') fail('valid token fixture must target gitea-sovereign audience');
  }

  const intent = readJson('schemas/intent.schema.json');
  if (intent) {
    const op = intent.properties.operations.items.properties;
    for (const key of ['base_ref', 'expected_head', 'operation_order']) {
      if (!op[key]) fail(`intent operation must include ${key}`);
    }
  }

  const intentExample = readJson('examples/valid/intent.example.json');
  if (intentExample) {
    const orders = intentExample.operations.map((op) => op.operation_order);
    const expected = orders.map((_, index) => index);
    if (orders.join(',') !== expected.join(',')) fail('valid intent fixture operation_order must be contiguous from 0');
    if (intentExample.replay_allowed !== false) fail('valid intent fixture must disable replay');
  }

  const receipt = readJson('schemas/receipt-export.schema.json');
  if (receipt) {
    for (const key of ['export_batch_id', 'first_seq', 'last_seq', 'batch_hash', 'destination_ref', 'ack_required']) {
      if (!receipt.properties[key]) fail(`receipt export schema must include ${key}`);
    }
    if (receipt.properties.ack_required.const !== true) fail('receipt export ack_required must be const true');
  }

  const capabilityGrant = readJson('schemas/capability-grant.schema.json');
  if (capabilityGrant) {
    for (const key of ['capability_id', 'agent_id', 'task_id', 'grant_decision_ref', 'policy_decision_ref', 'operation', 'constraints', 'expires_at', 'max_uses', 'status']) {
      if (!capabilityGrant.properties[key]) fail(`capability grant schema must include ${key}`);
    }
    if (capabilityGrant.properties.constraints.properties.require_receipt.const !== true) fail('capability grant must require receipts');
    if (capabilityGrant.properties.constraints.properties.require_reconciliation.const !== true) fail('capability grant must require reconciliation');
  }

  const providerReceipt = readJson('schemas/provider-receipt.schema.json');
  if (providerReceipt) {
    for (const key of ['receipt_id', 'capability_id', 'grant_decision_ref', 'policy_decision_ref', 'operation', 'before_state_digest', 'execution_result', 'after_state_digest', 'timestamp']) {
      if (!providerReceipt.properties[key]) fail(`provider receipt schema must include ${key}`);
    }
  }

  const reconciliationResult = readJson('schemas/reconciliation-result.schema.json');
  if (reconciliationResult) {
    for (const key of ['reconciliation_result_id', 'receipt_id', 'expected_state', 'observed_state', 'source_of_truth_read_timestamp', 'classification', 'reason']) {
      if (!reconciliationResult.properties[key]) fail(`reconciliation result schema must include ${key}`);
    }
    if (!reconciliationResult.properties.classification.enum.includes('verified_success')) fail('reconciliation result must include verified_success classification');
    if (!reconciliationResult.properties.classification.enum.includes('ambiguous_mutation_state')) fail('reconciliation result must include ambiguous mutation state classification');
  }
};
