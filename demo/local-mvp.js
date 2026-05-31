const { AuditChain } = require('../core/audit-chain');
const { evaluateRequest } = require('../gateway/control-boundary');
const { issueLocalGrant, verifyLocalGrant } = require('../core/local-authority');
const { NonceStore } = require('../core/nonce-store');
const { issueNativeReceipt } = require('../core/native-adapter');
const { resolvePair, decisionReceipt } = require('../core/reference-resolver');
const { acknowledgeExportBatch, buildExportBatch, verifyExportBatch } = require('../core/receipt-export');
const { stableHash } = require('../core/canonical');

const NOW = 1800000000;
const KEY = 'local-mvp-test-key';
const NODE_ID = 'node-a';

function runLocalMvpDemo() {
  const request = {
    op: 'read',
    repo: 'SocioProphet/example',
    branch: 'main',
    path: 'docs/architecture.md',
    policy_decision_ref: 'policy://ok/local-mvp',
    grant_ref: 'grant://ok/local-mvp'
  };

  const boundary = evaluateRequest(request, {
    paths_allow: ['docs/**'],
    paths_deny: ['docs/private/**']
  });
  if (!boundary.allowed) throw new Error(`boundary failed: ${boundary.reason}`);

  const referenceDecision = resolvePair({
    policy_ref: request.policy_decision_ref,
    grant_ref: request.grant_ref,
    is_write: false
  });
  if (!referenceDecision.allowed) throw new Error(`reference failed: ${referenceDecision.reason}`);

  const referenceReceipt = decisionReceipt({
    decision: referenceDecision,
    subject: {
      receipt_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      node_id: NODE_ID,
      agent_id: 'agent-a',
      session_id: 'session-a',
      subject_repo: request.repo,
      subject_ref: request.branch
    },
    now: NOW,
    key: KEY
  });

  const grant = issueLocalGrant({
    token_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    session_id: '22222222-2222-4222-8222-222222222222',
    agent_id: '33333333-3333-4333-8333-333333333333',
    issuer_node: NODE_ID,
    scope: {
      repos: [request.repo],
      branches: [request.branch],
      ops: [request.op]
    },
    intent_hash: stableHash({ request, reference: referenceDecision.reason }),
    policy_decision_ref: request.policy_decision_ref,
    grant_ref: request.grant_ref,
    device_hash: 'b'.repeat(64),
    replay_nonce: 'local-mvp-nonce-0001'
  }, KEY, NOW);

  const nonceStore = new NonceStore();
  const grantVerification = verifyLocalGrant(grant, KEY, nonceStore, NOW + 1);
  if (!grantVerification.ok) throw new Error(`grant failed: ${grantVerification.reason}`);

  const replayVerification = verifyLocalGrant(grant, KEY, nonceStore, NOW + 2);

  const nativeReceipt = issueNativeReceipt({
    material: 'local-native-material-for-demo-1234567890',
    subject: {
      receipt_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      node_id: NODE_ID,
      agent_id: grant.agent_id,
      session_id: grant.session_id,
      token_id: grant.token_id,
      subject_repo: request.repo,
      subject_ref: request.branch
    },
    now: NOW + 3,
    key: KEY
  });

  const chain = new AuditChain({ node_id: NODE_ID, key: KEY });
  chain.append({
    event_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    event_type: 'intent.register',
    agent_id: grant.agent_id,
    session_id: grant.session_id,
    intent_id: grant.intent_hash,
    policy_decision_ref: request.policy_decision_ref,
    grant_ref: request.grant_ref,
    subject_repo: request.repo,
    subject_ref: request.branch,
    operation_digest: stableHash(request),
    receipt_hash: referenceReceipt.receipt_hash,
    wall_time: '2026-05-31T00:00:00.000Z',
    monotonic_counter: 1
  });
  chain.append({
    event_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    event_type: 'token.issue',
    agent_id: grant.agent_id,
    session_id: grant.session_id,
    token_id: grant.token_id,
    policy_decision_ref: request.policy_decision_ref,
    grant_ref: request.grant_ref,
    subject_repo: request.repo,
    subject_ref: request.branch,
    operation_digest: grantVerification.body_hash,
    receipt_hash: nativeReceipt.receipt_hash,
    wall_time: '2026-05-31T00:00:01.000Z',
    monotonic_counter: 2
  });

  const auditVerification = chain.verify();
  if (!auditVerification.ok) throw new Error(`audit failed: ${auditVerification.reason}`);

  const exportBatch = buildExportBatch({
    export_batch_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    node_id: NODE_ID,
    events: chain.events,
    destination_ref: 'model-governance-ledger://local/source-control',
    exported_at: '2026-05-31T00:00:02.000Z',
    key: KEY
  });
  const exportVerification = verifyExportBatch(exportBatch, chain.events, KEY);
  if (!exportVerification.ok) throw new Error(`export failed: ${exportVerification.reason}`);

  const acknowledgement = acknowledgeExportBatch({
    batch: exportBatch,
    ack_id: 'ack-local-mvp-1',
    received_at: '2026-05-31T00:00:03.000Z',
    key: KEY
  });

  return {
    live_calls: false,
    request: {
      op: request.op,
      repo: request.repo,
      branch: request.branch,
      normalized_path: boundary.normalized_path
    },
    path_decision: boundary.reason,
    reference_decision: referenceDecision.reason,
    reference_receipt_hash: referenceReceipt.receipt_hash,
    grant_verification: grantVerification.reason,
    replay_verification: replayVerification.reason,
    audit_verification: auditVerification.reason,
    native_receipt_hash: nativeReceipt.receipt_hash,
    export_batch_hash: exportBatch.batch_hash,
    export_verification: exportVerification.reason,
    ack_hash: acknowledgement.ack_hash
  };
}

if (require.main === module) {
  process.stdout.write(`${JSON.stringify(runLocalMvpDemo(), null, 2)}\n`);
}

module.exports = { runLocalMvpDemo };
