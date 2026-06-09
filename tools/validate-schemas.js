#!/usr/bin/env node
/*
 * Scaffold validator — orchestrator.
 *
 * Semantic checks are split into modules under tools/validators/:
 *   required-files   — file presence, schema structure, JSON parse
 *   runtime-config   — runtime/adapter/upstream/ledger fixture invariants
 *   token-schema     — token, intent, receipt, capability schema invariants
 *   core-code        — gateway/core/demo source-file phrase checks
 *   doc-checks       — docs/, ADR, and mapping phrase invariants
 *   compose-checks   — docker-compose security invariants
 *   production-review — production deployment review scaffold invariants
 *
 * This file intentionally performs deterministic local checks only.
 * Runtime native Gitea calls, external service calls, and network validation are out of scope.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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

const ctx = { ROOT, readText, readJson, fail, pass };

require('./validators/required-files')(ctx);
require('./validators/runtime-config')(ctx);
require('./validators/token-schema')(ctx);
require('./validators/core-code')(ctx);
require('./validators/doc-checks')(ctx);
require('./validators/compose-checks')(ctx);
require('./validators/production-review')(ctx);

if (failures > 0) {
  console.error(`\n${failures} validation failure(s)`);
  process.exit(1);
}

console.log('\nScaffold validation passed. Runtime behavior remains intentionally disabled.');
