const WRITE_OPS = new Set(['commit', 'push', 'branch-create', 'branch-delete', 'pr-open', 'pr-merge', 'tag']);
const WINDOWS_DRIVE_PREFIX = /^[A-Za-z]:[\\/]/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function decodePath(input) {
  try {
    return { ok: true, value: decodeURIComponent(input) };
  } catch (_err) {
    return { ok: false, value: null };
  }
}

function normalizePath(input) {
  if (typeof input !== 'string' || input.length === 0) return null;
  if (CONTROL_CHARS.test(input)) return null;

  const decoded = decodePath(input);
  if (!decoded.ok || typeof decoded.value !== 'string') return null;

  const normalizedUnicode = decoded.value.normalize('NFC');
  if (CONTROL_CHARS.test(normalizedUnicode)) return null;
  if (normalizedUnicode.startsWith('/') || WINDOWS_DRIVE_PREFIX.test(normalizedUnicode)) return null;

  const slashNormalized = normalizedUnicode.replace(/\\/g, '/');
  if (slashNormalized.startsWith('/') || slashNormalized.includes('//')) return null;

  const parts = slashNormalized.split('/');
  if (parts.some((part) => part === '' || part === '.' || part === '..')) return null;

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
