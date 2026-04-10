import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ProjectContext } from "../core/context.js";

type Source = "Official default" | "Community-common" | "QuickStack opinion";

interface DecisionEntry {
	label: string;
	source: Source;
	reason: string;
}

// --- Section builders ---

function buildOfficialDefaultsSection(): DecisionEntry[] {
	return [
		{
			label: "Next.js",
			source: "Official default",
			reason: "Framework of choice — App Router, SSR, SSG, and full-stack capabilities.",
		},
		{
			label: "TypeScript",
			source: "Official default",
			reason: "Type safety and better developer experience from the start.",
		},
		{
			label: "ESLint",
			source: "Official default",
			reason: "CNA ships ESLint by default for consistent code quality.",
		},
		{
			label: "App Router",
			source: "Official default",
			reason: "The current recommended routing model in Next.js (>= 13).",
		},
	];
}

function buildPackageManagerEntry(ctx: ProjectContext): DecisionEntry {
	return {
		label: ctx.packageManager,
		source: "QuickStack opinion",
		reason: `Selected by the user during setup. Package manager used for all installs.`,
	};
}

function buildPresetEntry(ctx: ProjectContext): DecisionEntry {
	return {
		label: `${ctx.preset} preset`,
		source: "QuickStack opinion",
		reason:
			ctx.preset === "recommended"
				? "Provides a structured src/ layout with common directories for scalable projects."
				: "Minimal structure close to CNA defaults, suitable for simple or experimental projects.",
	};
}

function buildSrcAliasEntry(): DecisionEntry {
	return {
		label: "src/ directory + @/* import alias",
		source: "QuickStack opinion",
		reason: "Separates source from config files; @/* alias reduces relative import paths.",
	};
}

function buildDirectoryStructureEntries(ctx: ProjectContext): DecisionEntry[] {
	if (ctx.preset !== "recommended") {
		return [];
	}

	return [
		{
			label: "src/components — shared UI components",
			source: "QuickStack opinion",
			reason: "Centralizes reusable components to prevent duplication across features.",
		},
		{
			label: "src/features — feature-scoped modules",
			source: "QuickStack opinion",
			reason: "Groups related logic (components, hooks, utils) by domain for maintainability.",
		},
		{
			label: "src/lib — utility libraries and clients",
			source: "QuickStack opinion",
			reason: "Isolates third-party client setup (e.g., Supabase, API clients).",
		},
		{
			label: "src/hooks — custom React hooks",
			source: "QuickStack opinion",
			reason: "Keeps hooks separated and independently testable.",
		},
		{
			label: "src/styles — global styles",
			source: "QuickStack opinion",
			reason: "Clear home for global CSS and design tokens.",
		},
		{
			label: "src/types — TypeScript type definitions",
			source: "QuickStack opinion",
			reason: "Centralizes shared types to avoid circular dependencies.",
		},
	];
}

const STYLING_REASONS: Record<string, { source: Source; reason: string }> = {
	tailwind: {
		source: "Community-common",
		reason: "Widely adopted utility-first CSS framework for rapid UI development.",
	},
	shadcn: {
		source: "Community-common",
		reason: "Accessible component library built on Radix UI; requires Tailwind CSS.",
	},
	"framer-motion": {
		source: "Community-common",
		reason: "Declarative animation library well-suited for React projects.",
	},
};

const UTILITY_REASONS: Record<string, { source: Source; reason: string }> = {
	zod: {
		source: "Community-common",
		reason: "Runtime schema validation with TypeScript-first type inference.",
	},
	"date-fns": {
		source: "Community-common",
		reason: "Lightweight, tree-shakeable date utility library.",
	},
	"ts-pattern": {
		source: "Community-common",
		reason: "Exhaustive pattern matching for TypeScript with type narrowing.",
	},
	"es-toolkit": {
		source: "Community-common",
		reason: "Modern JavaScript utility library as a performant alternative to lodash.",
	},
};

const STATE_FORM_REASONS: Record<string, { source: Source; reason: string }> = {
	zustand: {
		source: "Community-common",
		reason: "Minimal boilerplate state management; easy to adopt incrementally.",
	},
	"react-hook-form": {
		source: "Community-common",
		reason: "Performant form handling with minimal re-renders and built-in validation.",
	},
	supabase: {
		source: "Community-common",
		reason: "Open-source backend-as-a-service providing auth, database, and storage.",
	},
};

function buildLibraryEntries(ctx: ProjectContext): DecisionEntry[] {
	const entries: DecisionEntry[] = [];

	for (const lib of ctx.styling) {
		const info = STYLING_REASONS[lib];
		if (info) {
			entries.push({ label: lib, ...info });
		}
	}

	for (const lib of ctx.utilities) {
		const info = UTILITY_REASONS[lib];
		if (info) {
			entries.push({ label: lib, ...info });
		}
	}

	for (const lib of ctx.stateForm) {
		const info = STATE_FORM_REASONS[lib];
		if (info) {
			entries.push({ label: lib, ...info });
		}
	}

	return entries;
}

function formatEntry(entry: DecisionEntry): string {
	return `- **${entry.label}** — [${entry.source}] ${entry.reason}`;
}

// --- Pure render function ---

export function renderDecisions(ctx: ProjectContext): string {
	const officialDefaults = buildOfficialDefaultsSection();
	const pmEntry = buildPackageManagerEntry(ctx);
	const presetEntry = buildPresetEntry(ctx);
	const srcAliasEntry = buildSrcAliasEntry();
	const dirEntries = buildDirectoryStructureEntries(ctx);
	const libEntries = buildLibraryEntries(ctx);

	const sections: string[] = [
		"# Decisions",
		"",
		"> This file explains what was selected and why. Generated by QuickStack.",
		"",
		"## Official Defaults (CNA / Next.js)",
		"",
		...officialDefaults.map(formatEntry),
		"",
		"## Setup Choices",
		"",
		formatEntry(pmEntry),
		formatEntry(presetEntry),
		formatEntry(srcAliasEntry),
	];

	if (dirEntries.length > 0) {
		sections.push("", "## Directory Structure (QuickStack opinion)", "");
		sections.push(...dirEntries.map(formatEntry));
	}

	if (libEntries.length > 0) {
		sections.push("", "## Selected Libraries", "");
		sections.push(...libEntries.map(formatEntry));
	}

	return sections.join("\n");
}

// --- IO function ---

export async function writeDecisions(ctx: ProjectContext, projectDir: string): Promise<void> {
	const content = renderDecisions(ctx);
	await writeFile(join(projectDir, "DECISIONS.md"), content);
}
