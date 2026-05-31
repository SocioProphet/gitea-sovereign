#!/usr/bin/env node
/*
 * Scaffold validator.
 * This intentionally performs deterministic local checks only.
 * Runtime token issuance, native Gitea calls, and network validation are out of scope.
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
  'gateway/control-boundary.js',
  'test/control-boundary.test.js',
  'docs/authority-boundaries.md',
  'docs/transport-boundary.md',
  'docs/threat-model.md',
  'docs/backlog.md',
  'docs/adr/0001-authority-boundaries.md',
  'docs/adr/0002-token-gateway-vs-native-gitea-token.md',
  'docs/adr/0003-audit-chain-and-export.md',
  'docs/adr/0004-git-transport-v1-limits.md',
  'docs/adr/0005-key-storage-and-rotation-v1.md',
  'examples/valid/token.example.json',
  'examples/valid/intent.example.json',
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
if (/fetch\s*\(|http\.|https\.|net\.|tls\./.test(controlBoundary)) fail('control boundary must not perform network operations in PR-B');

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
