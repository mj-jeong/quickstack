import type { PresetDefinition } from "./types.js";

export const recommendedPreset: PresetDefinition = {
	id: "recommended",
	name: "Recommended",
	description: "실무에서 자주 쓰는 폴더 구조를 포함한 권장 구성",
	cnaOptions: {
		srcDir: true,
		tailwind: false,
		eslint: true,
		app: true,
		turbopack: true,
		importAlias: "@/*",
	},
	directories: [
		"src/components",
		"src/features",
		"src/lib",
		"src/hooks",
		"src/styles",
		"src/types",
	],
};
