import { defineConfig } from "tsdown";

export default defineConfig({
	entry: { "cli/index": "src/cli/index.ts" },
	format: "esm",
	target: "node22",
	platform: "node",
	dts: true,
	clean: true,
	shims: false,
	fixedExtension: false,
});
