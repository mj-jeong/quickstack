import type { PresetDefinition } from "./types.js";

export const minimalPreset: PresetDefinition = {
	id: "minimal",
	name: "Minimal",
	description: "CNA 기본 구조에 가까운 최소 구성",
	cnaOptions: {
		srcDir: true,
		tailwind: false,
		eslint: true,
		app: true,
		turbopack: true,
		importAlias: "@/*",
	},
	directories: [],
};
