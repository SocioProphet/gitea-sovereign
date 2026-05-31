.PHONY: validate validate-schemas smoke-test bootstrap-org bootstrap-node

validate: validate-schemas smoke-test

validate-schemas:
	node tools/validate-schemas.js

smoke-test:
	bash scripts/smoke-test.sh

bootstrap-org:
	@echo "bootstrap-org is intentionally disabled in PR-A scaffold"
	@echo "Runtime bootstrap lands after schema, threat-model, and transport controls are reviewed."

bootstrap-node:
	@echo "bootstrap-node is intentionally disabled in PR-A scaffold"
	@echo "Runtime bootstrap lands after schema, threat-model, and transport controls are reviewed."
