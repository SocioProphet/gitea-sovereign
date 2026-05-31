/*
 * PR-B no-network control boundary.
 * This module parses source-control requests and evaluates local boundary rules.
 * It does not forward to Gitea, create credentials, open sockets, or mutate infrastructure.
 */

const WRITE_OPS = new Set(['commit', 'push', 'branch-create', 'branch-delete', 'pr-open', 'pr-merge', 'tag']);

function decodePath(input) {
  try {
    return decodeURIComponent(input);
  } catch (_err) {
    return input;
  }
}

function normalizePath(input) {
  if (typeof input !== 'string' || input.length === 0) return '';
  const decoded = decodePath(input).normalize('NFC').replace(/\\/g, '/');
  const parts = [];
  for (const part of decoded.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (parts.length === 0) return null;
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join('/');
}

function globToRegExp(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*');
  return new RegExp(`^${escaped}$`);
}

function matchesAny(value, patterns = []) {
  return patterns.some((pattern) => globToRegExp(pattern).test(value));
}

function isWriteOperation(op) {
  return WRITE_OPS.has(op);
}

function evaluatePath(candidatePath, allow = [], deny = []) {
  const normalized = normalizePath(candidatePath);
  if (!normalized) return { allowed: false, reason: 'path.invalid', normalized };
  if (matchesAny(normalized, deny)) return { allowed: false, reason: 'path.denied', normalized };
  if (allow.length > 0 && !matchesAny(normalized, allow)) return { allowed: false, reason: 'path.not_allowed', normalized };
  return { allowed: true, reason: 'path.allowed', normalized };
}

function makeResolver(kind) {
  return function resolve(ref, op) {
    if (!ref) return { allowed: false, reason: `${kind}.missing` };
    if (kind === 'policy' && ref.includes('unresolved')) return { allowed: false, reason: 'policy.unresolved' };
    if (kind === 'grant' && ref.includes('unresolved')) return { allowed: false, reason: 'grant.unresolved' };
    if (isWriteOperation(op)) return { allowed: false, reason: `${kind}.stub_denies_write` };
    return { allowed: true, reason: `${kind}.stub_allows_read` };
  };
}

function parseRequest(input) {
  const required = ['op', 'repo', 'branch', 'path', 'policy_decision_ref', 'grant_ref'];
  for (const key of required) {
    if (!input || typeof input[key] !== 'string' || input[key].length === 0) {
      return { ok: false, reason: `request.missing_${key}` };
    }
  }
  return { ok: true, request: { ...input } };
}

function evaluateRequest(input, options = {}) {
  const parsed = parseRequest(input);
  if (!parsed.ok) return { allowed: false, reason: parsed.reason };

  const request = parsed.request;
  const pathResult = evaluatePath(request.path, options.paths_allow || [], options.paths_deny || []);
  if (!pathResult.allowed) return { allowed: false, reason: pathResult.reason, normalized_path: pathResult.normalized };

  const policyResult = (options.resolvePolicy || makeResolver('policy'))(request.policy_decision_ref, request.op);
  if (!policyResult.allowed) return { allowed: false, reason: policyResult.reason, normalized_path: pathResult.normalized };

  const grantResult = (options.resolveGrant || makeResolver('grant'))(request.grant_ref, request.op);
  if (!grantResult.allowed) return { allowed: false, reason: grantResult.reason, normalized_path: pathResult.normalized };

  return { allowed: true, reason: 'request.allowed', normalized_path: pathResult.normalized };
}

module.exports = {
  evaluatePath,
  evaluateRequest,
  globToRegExp,
  isWriteOperation,
  makeResolver,
  normalizePath,
  parseRequest
};
