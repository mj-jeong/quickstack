import type { ProjectContext } from "../../core/context.js";
import { minimalPreset } from "../../presets/next/minimal.js";
import { recommendedPreset } from "../../presets/next/recommended.js";

export function buildCnaArgs(ctx: ProjectContext): string[] {
	const preset = ctx.preset === "minimal" ? minimalPreset : recommendedPreset;

	const args: string[] = [ctx.projectName];

	// TypeScript is always required
	args.push("--ts");

	// src/ directory - always enabled
	args.push("--src-dir");

	// App router - always enabled
	args.push("--app");

	// ESLint - always enabled (§7.1 공식 흐름 존중)
	args.push("--eslint");

	// Tailwind - based on styling selection
	if (ctx.styling.includes("tailwind") || ctx.styling.includes("shadcn")) {
		args.push("--tailwind");
	} else {
		args.push("--no-tailwind");
	}

	// Turbopack - based on preset cnaOptions
	if (preset.cnaOptions.turbopack) {
		args.push("--turbopack");
	}

	// Import alias
	args.push("--import-alias", preset.cnaOptions.importAlias);

	// Package manager
	args.push(`--use-${ctx.packageManager}`);

	return args;
}
