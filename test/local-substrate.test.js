const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const compose = fs.readFileSync('deploy/local/docker-compose.yml', 'utf8');

test('local compose pins explicit Gitea rootless image version', () => {
  assert.match(compose, /gitea\/gitea:1\.26\.2-rootless/);
  assert.doesNotMatch(compose, /gitea\/gitea:latest/);
});

test('local compose does not publish native Gitea ports to host', () => {
  assert.doesNotMatch(compose, /^\s*ports:/m);
  assert.match(compose, /^\s*expose:/m);
});

test('local compose uses internal-only network', () => {
  assert.match(compose, /source_control_internal:/);
  assert.match(compose, /internal:\s*true/);
});

test('local compose disables native ssh service posture', () => {
  assert.match(compose, /GITEA__server__DISABLE_SSH:\s*"true"/);
  assert.match(compose, /GITEA__server__START_SSH_SERVER:\s*"false"/);
});

test('local compose defines org and node services', () => {
  assert.match(compose, /org-gitea:/);
  assert.match(compose, /node-gitea:/);
});

test('local compose does not contain credential literals', () => {
  assert.doesNotMatch(compose, /PASSWORD/i);
  assert.doesNotMatch(compose, /TOKEN/i);
  assert.doesNotMatch(compose, /SECRET/i);
});
