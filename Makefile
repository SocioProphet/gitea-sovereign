.PHONY: validate validate-schemas check smoke-test bootstrap-org bootstrap-node

validate: validate-schemas check smoke-test

validate-schemas:
	node tools/validate-schemas.js

check:
	npm run check

smoke-test:
	bash scripts/smoke-test.sh

bootstrap-org:
	@echo "bootstrap-org is intentionally disabled in scaffold mode"
	@echo "Runtime bootstrap lands after schema, threat-model, and transport controls are reviewed."

bootstrap-node:
	@echo "bootstrap-node is intentionally disabled in scaffold mode"
	@echo "Runtime bootstrap lands after schema, threat-model, and transport controls are reviewed."
