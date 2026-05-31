const test = require('node:test');
const assert = require('node:assert/strict');

const {
  evaluatePath,
  evaluateRequest,
  isWriteOperation,
  normalizePath,
  parseRequest
} = require('../gateway/control-boundary');

test('normalizes ordinary paths', () => {
  assert.equal(normalizePath('docs/architecture.md'), 'docs/architecture.md');
  assert.equal(normalizePath('docs/subdir/file.md'), 'docs/subdir/file.md');
});

test('rejects dot and traversal segments instead of resolving them', () => {
  assert.equal(normalizePath('docs/./architecture.md'), null);
  assert.equal(normalizePath('../outside'), null);
  assert.equal(normalizePath('docs/../outside'), null);
  assert.equal(normalizePath('docs/%2e/architecture.md'), null);
  assert.equal(normalizePath('docs/%2e%2e/outside'), null);
});

test('rejects malformed encoding and absolute path forms', () => {
  assert.equal(normalizePath('docs/%zz/file.md'), null);
  assert.equal(normalizePath('/docs/file.md'), null);
  assert.equal(normalizePath('C:\\docs\\file.md'), null);
  assert.equal(normalizePath('docs//file.md'), null);
  assert.equal(normalizePath('docs/fi\u0000le.md'), null);
});

test('deny wins over allow', () => {
  const result = evaluatePath('docs/private.txt', ['docs/**'], ['docs/private.txt']);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'path.denied');
});

test('allow list blocks paths not covered', () => {
  const result = evaluatePath('src/index.js', ['docs/**'], []);
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'path.not_allowed');
});

test('write operation classifier covers source-control mutations', () => {
  assert.equal(isWriteOperation('read'), false);
  assert.equal(isWriteOperation('commit'), true);
  assert.equal(isWriteOperation('pr-open'), true);
  assert.equal(isWriteOperation('tag'), true);
});

test('request parser fails closed on missing fields', () => {
  const parsed = parseRequest({ op: 'read' });
  assert.equal(parsed.ok, false);
  assert.match(parsed.reason, /^request\.missing_/);
});

test('stub resolvers allow read with refs present', () => {
  const result = evaluateRequest({
    op: 'read',
    repo: 'SocioProphet/example',
    branch: 'main',
    path: 'docs/architecture.md',
    policy_decision_ref: 'policy://ok',
    grant_ref: 'grant://ok'
  }, {
    paths_allow: ['docs/**'],
    paths_deny: []
  });
  assert.equal(result.allowed, true);
});

test('stub resolvers fail closed for write operations', () => {
  const result = evaluateRequest({
    op: 'commit',
    repo: 'SocioProphet/example',
    branch: 'work/example',
    path: 'docs/architecture.md',
    policy_decision_ref: 'policy://ok',
    grant_ref: 'grant://ok'
  }, {
    paths_allow: ['docs/**'],
    paths_deny: []
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'policy.stub_denies_write');
});

test('unresolved policy refs fail closed', () => {
  const result = evaluateRequest({
    op: 'read',
    repo: 'SocioProphet/example',
    branch: 'main',
    path: 'docs/architecture.md',
    policy_decision_ref: 'policy://unresolved/example',
    grant_ref: 'grant://ok'
  }, {
    paths_allow: ['docs/**'],
    paths_deny: []
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'policy.unresolved');
});

test('unresolved grant refs fail closed', () => {
  const result = evaluateRequest({
    op: 'read',
    repo: 'SocioProphet/example',
    branch: 'main',
    path: 'docs/architecture.md',
    policy_decision_ref: 'policy://ok',
    grant_ref: 'grant://unresolved/example'
  }, {
    paths_allow: ['docs/**'],
    paths_deny: []
  });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'grant.unresolved');
});
