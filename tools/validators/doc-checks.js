'use strict';
/**
 * doc-checks — phrase invariants for all docs/, ADRs, and the local compose file.
 */
const fs = require('fs');
const path = require('path');

module.exports = function validateDocs({ ROOT, readText, fail }) {
  const canonicalDoc = fs.existsSync(path.join(ROOT, 'docs/canonicalization.md')) ? readText('docs/canonicalization.md').toLowerCase() : '';
  for (const phrase of ['bootstrap local scaffold only', 'not claimed to be a complete rfc 8785', 'runtime-mode signing']) {
    if (!canonicalDoc.includes(phrase)) fail(`canonicalization doc must mention: ${phrase}`);
  }

  const mapping = fs.existsSync(path.join(ROOT, 'docs/reference-state-mapping.md')) ? readText('docs/reference-state-mapping.md').toLowerCase() : '';
  for (const phrase of ['ok', 'block', 'stale', 'unknown', 'local state']) {
    if (!mapping.includes(phrase)) fail(`reference state mapping doc must mention: ${phrase}`);
  }

  const demoDoc = fs.existsSync(path.join(ROOT, 'docs/local-mvp-demo.md')) ? readText('docs/local-mvp-demo.md').toLowerCase() : '';
  for (const phrase of ['local mvp demo', 'audit verification must pass before export batch creation', 'live_calls', 'no external service calls']) {
    if (!demoDoc.includes(phrase)) fail(`local MVP demo doc must mention: ${phrase}`);
  }

  const pathDoc = fs.existsSync(path.join(ROOT, 'docs/path-boundary.md')) ? readText('docs/path-boundary.md').toLowerCase() : '';
  for (const phrase of ['authorization-path handling must fail closed', 'deny-wins rule', 'changed-path extraction', 'transport-specific enforcement']) {
    if (!pathDoc.includes(phrase)) fail(`path boundary doc must mention: ${phrase}`);
  }

  const validationDoc = fs.existsSync(path.join(ROOT, 'docs/validation.md')) ? readText('docs/validation.md').toLowerCase() : '';
  for (const phrase of ['make validate', 'write capabilities must require provider receipts and reconciliation', 'pr-a write capabilities must be single-use', 'providerreceipt', 'reconciliationresult']) {
    if (!validationDoc.includes(phrase)) fail(`validation doc must mention: ${phrase}`);
  }

  const validationMatrix = fs.existsSync(path.join(ROOT, 'docs/registered-agent-validation-matrix.md')) ? readText('docs/registered-agent-validation-matrix.md').toLowerCase() : '';
  for (const phrase of ['failure-class coverage', 'fc-001', 'fc-023', 'coverage gaps', '`make validate` must pass in ci']) {
    if (!validationMatrix.includes(phrase)) fail(`registered-agent validation matrix must mention: ${phrase}`);
  }

  const runtimeAdr = fs.existsSync(path.join(ROOT, 'docs/adr/0006-runtime-binding-gates.md')) ? readText('docs/adr/0006-runtime-binding-gates.md').toLowerCase() : '';
  for (const phrase of ['runtime binding gates', 'explicit reviewed runtime-mode gate', 'fail-closed behavior', 'local scaffold behavior preserved']) {
    if (!runtimeAdr.includes(phrase)) fail(`runtime binding ADR must mention: ${phrase}`);
  }

  const adapterContract = fs.existsSync(path.join(ROOT, 'docs/runtime-adapter-contract.md')) ? readText('docs/runtime-adapter-contract.md').toLowerCase() : '';
  for (const phrase of ['design scaffold only', 'does not enable runtime behavior', 'required adapter phases', 'evidence-shaped data only']) {
    if (!adapterContract.includes(phrase)) fail(`runtime adapter contract must mention: ${phrase}`);
  }

  const upstreamContract = fs.existsSync(path.join(ROOT, 'docs/upstream-reference-binding-contract.md')) ? readText('docs/upstream-reference-binding-contract.md').toLowerCase() : '';
  for (const phrase of ['planning scaffold only', 'policy fabric', 'mcp/a2a zero trust', 'write-class operations must stop on `unknown`']) {
    if (!upstreamContract.includes(phrase)) fail(`upstream reference binding contract must mention: ${phrase}`);
  }

  const ledgerContract = fs.existsSync(path.join(ROOT, 'docs/ledger-export-binding-contract.md')) ? readText('docs/ledger-export-binding-contract.md').toLowerCase() : '';
  for (const phrase of ['planning scaffold only', 'model-governance-ledger', 'audit log -> export cursor -> model-governance-ledger', 'audit-chain verification must pass before export batch construction']) {
    if (!ledgerContract.includes(phrase)) fail(`ledger export binding contract must mention: ${phrase}`);
  }

  const localRuntimeDemoPlan = fs.existsSync(path.join(ROOT, 'docs/local-runtime-demo-plan.md')) ? readText('docs/local-runtime-demo-plan.md').toLowerCase() : '';
  for (const phrase of ['planning scaffold only', 'runtime demo implementation must not start until', 'when runtime mode is disabled', 'no git transport enablement']) {
    if (!localRuntimeDemoPlan.includes(phrase)) fail(`local runtime demo plan must mention: ${phrase}`);
  }

  const topology = fs.existsSync(path.join(ROOT, 'docs/local-substrate-topology.md')) ? readText('docs/local-substrate-topology.md').toLowerCase() : '';
  for (const phrase of ['1.26.2-rootless', 'internal-only', 'no native gitea token creation', 'no production deployment']) {
    if (!topology.includes(phrase)) fail(`local topology doc must mention: ${phrase}`);
  }

  const transport = fs.existsSync(path.join(ROOT, 'docs/transport-boundary.md')) ? readText('docs/transport-boundary.md').toLowerCase() : '';
  for (const phrase of ['api-mediated writes', 'ssh git is disabled', 'smart http git is disabled', 'toctou']) {
    if (!transport.includes(phrase)) fail(`transport boundary must mention: ${phrase}`);
  }

  const threat = fs.existsSync(path.join(ROOT, 'docs/threat-model.md')) ? readText('docs/threat-model.md').toLowerCase() : '';
  for (const phrase of ['token replay', 'direct gitea bypass', 'path traversal', 'audit truncation', 'policy/grant service outage']) {
    if (!threat.includes(phrase)) fail(`threat model must mention: ${phrase}`);
  }
};
