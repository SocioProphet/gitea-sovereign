# gitea-sovereign

L0 sovereign source-control substrate for SocioProphet.

This repository is being initialized through the PR-A scaffold. Runtime token issuance, live Gitea mutation, and cross-node federation are intentionally out of scope until the schema, threat model, transport boundary, and validation harness are established.

## Validation

The PR-A/L0 scaffold includes a standard-library validation script for receipt and reconciliation examples:

    python3 tools/validate_examples.py

See `docs/validation.md` for the validation invariant and current fixture set.
