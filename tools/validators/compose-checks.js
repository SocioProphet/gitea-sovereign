'use strict';
/**
 * compose-checks — docker-compose security invariants.
 */
const fs = require('fs');
const path = require('path');

module.exports = function validateCompose({ ROOT, readText, fail }) {
  const compose = fs.existsSync(path.join(ROOT, 'deploy/local/docker-compose.yml')) ? readText('deploy/local/docker-compose.yml') : '';
  if (!compose.includes('gitea/gitea:1.26.2-rootless')) fail('local compose must pin gitea/gitea:1.26.2-rootless');
  if (/^\s*ports:/m.test(compose)) fail('local compose must not publish native Gitea host ports');
  if (!/^\s*expose:/m.test(compose)) fail('local compose must expose only to internal network');
  if (!compose.includes('internal: true')) fail('local compose network must be internal-only');
  if (!compose.includes('GITEA__server__DISABLE_SSH: "true"')) fail('local compose must disable ssh');
  if (!compose.includes('GITEA__server__START_SSH_SERVER: "false"')) fail('local compose must not start ssh server');
  if (/PASSWORD|TOKEN|SECRET/i.test(compose)) fail('local compose must not contain credential literals');
};
