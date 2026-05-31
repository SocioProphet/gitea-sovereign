#!/usr/bin/env node
/*
 * PR-A validator scaffold.
 * This intentionally performs deterministic local checks only.
 * Runtime token issuance, native Gitea calls, and network validation are out of scope.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_FILES = [
  'schemas/token.schema.json',
  'schemas/intent.schema.json',
  'schemas/audit-event.schema.json',
  'schemas/agent-registration.schema.json',
  'schemas/receipt-export.schema.json',
  'docs/authority-boundaries.md',
  'docs/transport-boundary.md',
  'docs/threat-model.md',
  'docs/adr/0001-authority-boundaries.md',
  'docs/adr/0002-token-gateway-vs-native-gitea-token.md',
  'docs/adr/0003-audit-chain-and-export.md',
  'docs/adr/0004-git-transport-v1-limits.md',
  'docs/adr/0005-key-storage-and-rotation-v1.md'
];

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`ok: ${message}`);
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

for (const rel of REQUIRED_FILES.filter((f) => f.endsWith('.json'))) {
  const doc = readJson(rel);
  if (!doc) continue;
  if (doc.type !== 'object') fail(`${rel} must define an object root`);
  if (doc.additionalProperties !== false) fail(`${rel} must fail closed with additionalProperties=false`);
  if (!Array.isArray(doc.required) || doc.required.length === 0) fail(`${rel} must define required fields`);
}

const token = readJson('schemas/token.schema.json');
if (token) {
  const props = token.properties || {};
  if (!props.expires_at || !props.issued_at || !props.not_before) fail('token schema must include issued_at/not_before/expires_at');
  if (!props.alg || !Array.isArray(props.alg.enum) || !props.alg.enum.includes('HS256')) fail('token schema must include HS256 bootstrap alg');
  if (!props.alg.enum.includes('Ed25519')) fail('token schema must reserve Ed25519 upgrade path');
}

const intent = readJson('schemas/intent.schema.json');
if (intent) {
  const op = intent.properties.operations.items.properties;
  for (const key of ['base_ref', 'expected_head', 'operation_order']) {
    if (!op[key]) fail(`intent operation must include ${key}`);
  }
}

const receipt = readJson('schemas/receipt-export.schema.json');
if (receipt) {
  for (const key of ['export_batch_id', 'first_seq', 'last_seq', 'batch_hash', 'destination_ref', 'ack_required']) {
    if (!receipt.properties[key]) fail(`receipt export schema must include ${key}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} validation failure(s)`);
  process.exit(1);
}

console.log('\nPR-A scaffold validation passed. Runtime behavior remains intentionally disabled.');
