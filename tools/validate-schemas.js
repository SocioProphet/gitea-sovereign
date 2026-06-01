#!/usr/bin/env node
/*
 * Scaffold validator.
 * This intentionally performs deterministic local checks only.
 * Runtime native Gitea calls, external service calls, and network validation are out of scope.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_FILES = [
  'package.json',
  '.gitignore',
  '.github/workflows/validate.yml',
  'schemas/token.schema.json',
  'schemas/intent.schema.json',
  'schemas/audit-event.schema.json',
  'schemas/agent-registration.schema.json',
  'schemas/receipt-export.schema.json',
  'schemas/control-config.schema.json',
  'schemas/runtime-config.schema.json',
  'gateway/control-boundary.js',
  'core/canonical.js',
  'core/nonce-store.js',
  'core/local-authority.js',
  'core/audit-chain.js',
  'core/native-adapter.js',
  'core/reference-resolver.js',
  'core/receipt-export.js',
  'demo/local-mvp.js',
  'deploy/local/docker-compose.yml',
  'test/control-boundary.test.js',
  'test/local-core.test.js',
  'test/local-substrate.test.js',
  'test/native-adapter.test.js',
  'test/reference-resolver.test.js',
  'test/receipt-export.test.js',
  'test/local-mvp.test.js',
  'test/runtime-config.test.js',
  'test/runtime-adapter-contract.test.js',
  'test/upstream-reference-binding-contract.test.js',
  'docs/authority-boundaries.md',
  'docs/transport-boundary.md',
  'docs/threat-model.md',
  'docs/backlog.md',
  'docs/local-substrate-topology.md',
  'docs/reference-state-mapping.md',
  'docs/local-mvp-demo.md',
  'docs/canonicalization.md',
  'docs/path-boundary.md',
  'docs/runtime-adapter-contract.md',
  'docs/upstream-reference-binding-contract.md',
  'docs/adr/0001-authority-boundaries.md',
  'docs/adr/0002-token-gateway-vs-native-gitea-token.md',
  'docs/adr/0003-audit-chain-and-export.md',
  'docs/adr/0004-git-transport-v1-limits.md',
  'docs/adr/0005-key-storage-and-rotation-v1.md',
  'docs/adr/0006-runtime-binding-gates.md',
  'examples/valid/token.example.json',
  'examples/valid/intent.example.json',
  'examples/valid/runtime-config.disabled.example.json',
  'examples/valid/runtime-adapter.disabled.example.json',
  'examples/valid/upstream-reference-binding.disabled.example.json',
  'examples/attacks/replay-nonce.attack.json',
  'examples/attacks/path-traversal.attack.json',
  'examples/attacks/direct-gitea-bypass.attack.json',
  'examples/attacks/scope-widening.attack.json',
  'examples/attacks/mutated-intent.attack.json',
  'examples/attacks/stale-base-ref.case.json',
  'examples/attacks/moved-expected-head.case.json',
  'examples/attacks/forged-receipt.case.json',
  'examples/attacks/reordered-audit-seq.case.json',
  'examples/attacks/policy-outage.case.json',
  'examples/attacks/grant-outage.case.json',
  'examples/attacks/url-encoded-traversal.case.json'
];

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`ok: ${message}`);
}

function readText(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function readJson(rel) {
  const abs = path.join(ROOT, rel);
  try {
    return JSON.parse(fs.readFileSync(abs, 'utf8'));
  } catch (err) {
    fail(`${rel} is not valid JSON: ${err.message}`);
    return null;
  }
}

for (const rel of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(ROOT, rel))) fail(`missing required scaffold file: ${rel}`);
  else pass(`found ${rel}`);
}

for (const rel of REQUIRED_FILES.filter((f) => f.endsWith('.json') && f.startsWith('schemas/'))) {
  const doc = readJson(rel);
  if (!doc) continue;
  if (doc.type !== 'object') fail(`${rel} must define an object root`);
  if (doc.additionalProperties !== false) fail(`${rel} must fail closed with additionalProperties=false`);
  if (!Array.isArray(doc.required) || doc.required.length === 0) fail(`${rel} must define required fields`);
}

for (const rel of REQUIRED_FILES.filter((f) => f.endsWith('.json') && f.startsWith('examples/'))) {
  readJson(rel);
}

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

const controlBoundary = fs.existsSync(path.join(ROOT, 'gateway/control-boundary.js')) ? readText('gateway/control-boundary.js') : '';
for (const phrase of ['module.exports', 'normalizePath', 'evaluatePath', 'evaluateRequest', 'makeResolver']) {
  if (!controlBoundary.includes(phrase)) fail(`control boundary must include: ${phrase}`);
}

const localCoreFiles = [
  'gateway/control-boundary.js',
  'core/canonical.js',
  'core/nonce-store.js',
  'core/local-authority.js',
  'core/audit-chain.js',
  'core/native-adapter.js',
  'core/reference-resolver.js',
  'core/receipt-export.js',
  'demo/local-mvp.js'
];
for (const rel of localCoreFiles) {
  const body = fs.existsSync(path.join(ROOT, rel)) ? readText(rel) : '';
  if (/fetch\s*\(|http\.|https\.|net\.|tls\./.test(body)) fail(`${rel} must not perform network operations in local scaffold`);
}

const canonical = fs.existsSync(path.join(ROOT, 'core/canonical.js')) ? readText('core/canonical.js') : '';
for (const phrase of ['canonicalize', 'sha256Hex', 'hmacSha256Hex', 'stableHash']) {
  if (!canonical.includes(phrase)) fail(`canonical helper must include: ${phrase}`);
}

const canonicalDoc = fs.existsSync(path.join(ROOT, 'docs/canonicalization.md')) ? readText('docs/canonicalization.md').toLowerCase() : '';
for (const phrase of ['bootstrap local scaffold only', 'not claimed to be a complete rfc 8785', 'runtime-mode signing']) {
  if (!canonicalDoc.includes(phrase)) fail(`canonicalization doc must mention: ${phrase}`);
}

const localAuthority = fs.existsSync(path.join(ROOT, 'core/local-authority.js')) ? readText('core/local-authority.js') : '';
for (const phrase of ['issueLocalGrant', 'verifyLocalGrant', 'revokeLocalGrant', 'DEFAULT_TTL_SECONDS']) {
  if (!localAuthority.includes(phrase)) fail(`local authority core must include: ${phrase}`);
}

const audit = fs.existsSync(path.join(ROOT, 'core/audit-chain.js')) ? readText('core/audit-chain.js') : '';
for (const phrase of ['AuditChain', 'append', 'verify', 'ZERO_HASH']) {
  if (!audit.includes(phrase)) fail(`audit chain core must include: ${phrase}`);
}

const nativeAdapter = fs.existsSync(path.join(ROOT, 'core/native-adapter.js')) ? readText('core/native-adapter.js') : '';
for (const phrase of ['issueNativeReceipt', 'revokeNativeReceipt', 'materialDigest', 'materialSuffix']) {
  if (!nativeAdapter.includes(phrase)) fail(`native adapter scaffold must include: ${phrase}`);
}
if (/raw_material|native_token|access_token/i.test(nativeAdapter)) fail('native adapter scaffold must not expose raw/native token field names');

const resolver = fs.existsSync(path.join(ROOT, 'core/reference-resolver.js')) ? readText('core/reference-resolver.js') : '';
for (const phrase of ['parseReference', 'resolveReference', 'resolvePair', 'decisionReceipt']) {
  if (!resolver.includes(phrase)) fail(`reference resolver scaffold must include: ${phrase}`);
}

const receiptExport = fs.existsSync(path.join(ROOT, 'core/receipt-export.js')) ? readText('core/receipt-export.js') : '';
for (const phrase of ['buildExportBatch', 'verifyExportBatch', 'acknowledgeExportBatch', 'classifyExport', 'nextExportRange']) {
  if (!receiptExport.includes(phrase)) fail(`receipt export scaffold must include: ${phrase}`);
}

const demo = fs.existsSync(path.join(ROOT, 'demo/local-mvp.js')) ? readText('demo/local-mvp.js') : '';
for (const phrase of ['runLocalMvpDemo', 'AuditChain', 'verifyExportBatch', 'acknowledgeExportBatch', 'live_calls: false']) {
  if (!demo.includes(phrase)) fail(`local MVP demo must include: ${phrase}`);
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

const compose = fs.existsSync(path.join(ROOT, 'deploy/local/docker-compose.yml')) ? readText('deploy/local/docker-compose.yml') : '';
if (!compose.includes('gitea/gitea:1.26.2-rootless')) fail('local compose must pin gitea/gitea:1.26.2-rootless');
if (/^\s*ports:/m.test(compose)) fail('local compose must not publish native Gitea host ports');
if (!/^\s*expose:/m.test(compose)) fail('local compose must expose only to internal network');
if (!compose.includes('internal: true')) fail('local compose network must be internal-only');
if (!compose.includes('GITEA__server__DISABLE_SSH: "true"')) fail('local compose must disable ssh');
if (!compose.includes('GITEA__server__START_SSH_SERVER: "false"')) fail('local compose must not start ssh server');
if (/PASSWORD|TOKEN|SECRET/i.test(compose)) fail('local compose must not contain credential literals');

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

if (failures > 0) {
  console.error(`\n${failures} validation failure(s)`);
  process.exit(1);
}

console.log('\nScaffold validation passed. Runtime behavior remains intentionally disabled.');
