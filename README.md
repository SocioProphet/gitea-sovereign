# gitea-sovereign

L0 sovereign source-control substrate for SocioProphet.

This repository is being initialized through the PR-A scaffold. Runtime token issuance, live Gitea mutation, and cross-node federation are intentionally out of scope until the schema, threat model, transport boundary, and validation harness are established.

## Validation

Run the canonical scaffold validation target from the repository root:

    make validate

This target runs schema validation, example invariant validation, tests, and scaffold smoke tests. See `docs/validation.md` for the validation invariant and current fixture set.
