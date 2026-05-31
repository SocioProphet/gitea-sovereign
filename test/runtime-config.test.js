const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const schema = JSON.parse(fs.readFileSync('schemas/runtime-config.schema.json', 'utf8'));
const disabled = JSON.parse(fs.readFileSync('examples/valid/runtime-config.disabled.example.json', 'utf8'));

test('runtime config schema fails closed at root and nested binding objects', () => {
  assert.equal(schema.additionalProperties, false);
  assert.equal(schema.properties.bindings.additionalProperties, false);
  assert.equal(schema.properties.guards.additionalProperties, false);
  assert.equal(schema.definitions.binding.additionalProperties, false);
  assert.equal(schema.definitions.transportBinding.additionalProperties, false);
});

test('disabled runtime fixture preserves local scaffold as default', () => {
  assert.equal(disabled.runtime_mode, 'disabled');
  assert.equal(disabled.local_scaffold_default, true);
  assert.equal(disabled.bindings.gitea.enabled, false);
  assert.equal(disabled.bindings.upstream_refs.enabled, false);
  assert.equal(disabled.bindings.ledger_export.enabled, false);
});

test('git transport remains disabled in runtime config scaffold', () => {
  assert.equal(disabled.bindings.git_transport.enabled, false);
  assert.equal(disabled.bindings.git_transport.mode, 'disabled');
  assert.match(disabled.bindings.git_transport.enforcement_design_ref, /0004-git-transport/);
});

test('runtime guards are required and enabled in disabled fixture', () => {
  for (const key of schema.properties.guards.required) {
    assert.equal(disabled.guards[key], true);
  }
});

test('runtime binding gates are present in schema', () => {
  assert.deepEqual(schema.required, ['runtime_mode', 'local_scaffold_default', 'bindings', 'guards']);
  assert.deepEqual(schema.properties.bindings.required, ['gitea', 'upstream_refs', 'ledger_export', 'git_transport']);
});
