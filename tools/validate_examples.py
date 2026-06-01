#!/usr/bin/env python3
"""Validate PR-A examples without third-party dependencies.

This is intentionally not a full JSON Schema implementation. It enforces the
completion-proof invariant for the current scaffold:

- write capabilities must require provider receipts and reconciliation;
- PR-A write capabilities must be single-use;
- a ProviderReceipt alone is not task completion proof;
- a ReconciliationResult with verified classification is the completion gate;
- the negative false-completion fixture must remain blocked.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
WRITE_OPERATIONS = {
    "forge.pull_request.merge",
    "forge.pull_request.close",
    "forge.branch.delete",
    "forge.issue.close",
    "forge.label.apply",
    "forge.comment.create",
    "forge.release.create",
}


class ValidationError(RuntimeError):
    """Raised when a scaffold validation invariant fails."""


def load_json(relative_path: str) -> dict[str, Any]:
    path = ROOT / relative_path
    with path.open("r", encoding="utf-8") as handle:
        value = json.load(handle)
    if not isinstance(value, dict):
        raise ValidationError(f"{relative_path}: expected JSON object")
    return value


def require_fields(name: str, value: dict[str, Any], fields: list[str]) -> None:
    missing = [field for field in fields if field not in value]
    if missing:
        raise ValidationError(f"{name}: missing required fields: {', '.join(missing)}")


def require_valid_write_capability(name: str, grant: dict[str, Any]) -> None:
    require_fields(
        name,
        grant,
        [
            "capability_id",
            "schema_version",
            "agent_id",
            "task_id",
            "grant_decision_ref",
            "policy_decision_ref",
            "operation",
            "repository",
            "object_type",
            "object_id",
            "constraints",
            "issued_at",
            "expires_at",
            "max_uses",
            "status",
        ],
    )
    if grant["schema_version"] != "0.1.0":
        raise ValidationError(f"{name}: schema_version must be 0.1.0")
    if grant["operation"] not in WRITE_OPERATIONS:
        raise ValidationError(f"{name}: expected a write operation")
    if grant["max_uses"] != 1:
        raise ValidationError(f"{name}: write capability must be single-use in PR-A examples")
    if grant["status"] != "issued":
        raise ValidationError(f"{name}: expected issued status")
    constraints = grant["constraints"]
    require_fields(
        f"{name}.constraints",
        constraints,
        ["freshness_seconds", "require_receipt", "require_reconciliation"],
    )
    if constraints["require_receipt"] is not True:
        raise ValidationError(f"{name}: write capability must require receipt")
    if constraints["require_reconciliation"] is not True:
        raise ValidationError(f"{name}: write capability must require reconciliation")
    if constraints.get("freshness_seconds", 0) > 900:
        raise ValidationError(f"{name}: freshness_seconds must not exceed 900")
    if constraints.get("allow_destructive_action") is True:
        raise ValidationError(f"{name}: destructive actions are not permitted in PR-A example")


def expect_rejected(name: str, func: Any, expected_fragment: str) -> None:
    try:
        func()
    except ValidationError as exc:
        if expected_fragment not in str(exc):
            raise ValidationError(f"{name}: wrong rejection reason: {exc}") from exc
        return
    raise ValidationError(f"{name}: fixture unexpectedly passed validation")


def validate_capability_grant() -> dict[str, Any]:
    grant = load_json("examples/valid-capability-grant.json")
    require_valid_write_capability("valid-capability-grant", grant)
    return grant


def validate_invalid_capability_missing_reconciliation() -> None:
    case = load_json("examples/invalid-capability-missing-reconciliation.json")
    require_fields(
        "invalid-capability-missing-reconciliation",
        case,
        [
            "case_id",
            "schema_version",
            "description",
            "capability_grant",
            "expected_task_completion_state",
            "expected_failure_event_type",
            "expected_policy",
        ],
    )
    if case["expected_task_completion_state"] != "rejected_missing_reconciliation_requirement":
        raise ValidationError("invalid-capability-missing-reconciliation: unexpected expected_task_completion_state")
    if case["expected_failure_event_type"] != "policy.capability_mismatch":
        raise ValidationError("invalid-capability-missing-reconciliation: expected policy.capability_mismatch")
    expect_rejected(
        "invalid-capability-missing-reconciliation",
        lambda: require_valid_write_capability(
            "invalid-capability-missing-reconciliation.capability_grant",
            case["capability_grant"],
        ),
        "must require reconciliation",
    )


def validate_invalid_capability_multi_use_write() -> None:
    case = load_json("examples/invalid-capability-multi-use-write.json")
    require_fields(
        "invalid-capability-multi-use-write",
        case,
        [
            "case_id",
            "schema_version",
            "description",
            "capability_grant",
            "expected_task_completion_state",
            "expected_failure_event_type",
            "expected_policy",
        ],
    )
    if case["expected_task_completion_state"] != "rejected_multi_use_write_capability":
        raise ValidationError("invalid-capability-multi-use-write: unexpected expected_task_completion_state")
    if case["expected_failure_event_type"] != "policy.capability_mismatch":
        raise ValidationError("invalid-capability-multi-use-write: expected policy.capability_mismatch")
    expect_rejected(
        "invalid-capability-multi-use-write",
        lambda: require_valid_write_capability(
            "invalid-capability-multi-use-write.capability_grant",
            case["capability_grant"],
        ),
        "single-use",
    )


def validate_provider_receipt(grant: dict[str, Any]) -> dict[str, Any]:
    receipt = load_json("examples/valid-provider-receipt.json")
    require_fields(
        "valid-provider-receipt",
        receipt,
        [
            "receipt_id",
            "schema_version",
            "agent_id",
            "task_id",
            "capability_id",
            "grant_decision_ref",
            "policy_decision_ref",
            "operation",
            "repository",
            "object_type",
            "object_id",
            "before_state_digest",
            "preflight_policy_decision",
            "execution_result",
            "provider_object_version",
            "after_state_digest",
            "reconciliation_result_id",
            "svf_receipt_ref",
            "receipt_export_cursor",
            "timestamp",
        ],
    )
    if receipt["schema_version"] != "0.1.0":
        raise ValidationError("valid-provider-receipt: schema_version must be 0.1.0")
    for field in ["agent_id", "task_id", "capability_id", "grant_decision_ref", "policy_decision_ref", "operation", "object_type", "object_id"]:
        if receipt[field] != grant[field]:
            raise ValidationError(f"valid-provider-receipt: {field} does not match capability grant")
    if receipt["execution_result"] != "success":
        raise ValidationError("valid-provider-receipt: expected successful provider execution")
    if not receipt["reconciliation_result_id"].startswith("gitea-sovereign:reconciliation:"):
        raise ValidationError("valid-provider-receipt: invalid reconciliation_result_id")
    return receipt


def validate_reconciliation_result(receipt: dict[str, Any]) -> dict[str, Any]:
    reconciliation = load_json("examples/valid-reconciliation-result.json")
    require_fields(
        "valid-reconciliation-result",
        reconciliation,
        [
            "reconciliation_result_id",
            "schema_version",
            "receipt_id",
            "repository",
            "object_type",
            "object_id",
            "expected_state",
            "observed_state",
            "source_of_truth_read_timestamp",
            "source_of_truth_object_version",
            "classification",
            "reason",
            "svf_receipt_ref",
            "receipt_export_cursor",
        ],
    )
    if reconciliation["receipt_id"] != receipt["receipt_id"]:
        raise ValidationError("valid-reconciliation-result: receipt_id mismatch")
    if reconciliation["reconciliation_result_id"] != receipt["reconciliation_result_id"]:
        raise ValidationError("valid-reconciliation-result: reconciliation_result_id mismatch")
    if reconciliation["classification"] != "verified_success":
        raise ValidationError("valid-reconciliation-result: expected verified_success")
    if reconciliation["expected_state"] != reconciliation["observed_state"]:
        raise ValidationError("valid-reconciliation-result: expected and observed state must match")
    observed_facts = reconciliation["observed_state"].get("facts", {})
    if observed_facts.get("merged") is not True:
        raise ValidationError("valid-reconciliation-result: observed state must prove merged=true")
    return reconciliation


def validate_false_completion_negative() -> None:
    case = load_json("examples/invalid-false-completion-missing-reconciliation.json")
    require_fields(
        "invalid-false-completion-missing-reconciliation",
        case,
        [
            "case_id",
            "schema_version",
            "description",
            "provider_receipt",
            "missing_reconciliation_result",
            "expected_task_completion_state",
            "expected_failure_event_type",
            "expected_policy",
        ],
    )
    if case["missing_reconciliation_result"] is not True:
        raise ValidationError("invalid false-completion case must explicitly miss reconciliation")
    if case["expected_task_completion_state"] != "blocked_missing_reconciliation":
        raise ValidationError("invalid false-completion case must remain blocked")
    if case["expected_failure_event_type"] != "agent.false_completion_claim":
        raise ValidationError("invalid false-completion case must map to agent.false_completion_claim")
    provider_receipt = case["provider_receipt"]
    if provider_receipt.get("execution_result") == "success" and provider_receipt.get("reconciliation_result_id"):
        raise ValidationError("invalid false-completion case unexpectedly includes reconciliation_result_id")


def main() -> int:
    grant = validate_capability_grant()
    validate_invalid_capability_missing_reconciliation()
    validate_invalid_capability_multi_use_write()
    receipt = validate_provider_receipt(grant)
    validate_reconciliation_result(receipt)
    validate_false_completion_negative()
    print("validated capability grant, capability negatives, provider receipt, reconciliation result, and false-completion negative fixture")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
