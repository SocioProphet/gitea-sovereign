'use strict';
/**
 * core-code — source-file phrase checks for gateway, core, and demo modules.
 */
const fs = require('fs');
const path = require('path');

module.exports = function validateCoreCode({ ROOT, readText, fail }) {
  const LOCAL_CORE_FILES = [
    'gateway/control-boundary.js',
    'core/canonical.js',
    'core/nonce-store.js',
    'core/local-authority.js',
    'core/audit-chain.js',
    'core/native-adapter.js',
    'core/reference-resolver.js',
    'core/receipt-export.js',
    'demo/local-mvp.js',
  ];

  for (const rel of LOCAL_CORE_FILES) {
    const body = fs.existsSync(path.join(ROOT, rel)) ? readText(rel) : '';
    if (/fetch\s*\(|http\.|https\.|net\.|tls\./.test(body)) fail(`${rel} must not perform network operations in local scaffold`);
  }

  const controlBoundary = fs.existsSync(path.join(ROOT, 'gateway/control-boundary.js')) ? readText('gateway/control-boundary.js') : '';
  for (const phrase of ['module.exports', 'normalizePath', 'evaluatePath', 'evaluateRequest', 'makeResolver']) {
    if (!controlBoundary.includes(phrase)) fail(`control boundary must include: ${phrase}`);
  }

  const canonical = fs.existsSync(path.join(ROOT, 'core/canonical.js')) ? readText('core/canonical.js') : '';
  for (const phrase of ['canonicalize', 'sha256Hex', 'hmacSha256Hex', 'stableHash']) {
    if (!canonical.includes(phrase)) fail(`canonical helper must include: ${phrase}`);
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
};
