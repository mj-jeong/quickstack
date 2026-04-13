import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ProjectContext } from "../core/context.js";

// --- Section builders ---

function buildGettingStartedSection(ctx: ProjectContext): string {
	const { packageManager } = ctx;

	let devCmd: string;
	let installNote: string;

	if (packageManager === "npm") {
		devCmd = "npm run dev";
		installNote = "npm install\n  npm run dev";
	} else if (packageManager === "pnpm") {
		devCmd = "pnpm dev";
		installNote = devCmd;
	} else {
		devCmd = "yarn dev";
		installNote = devCmd;
	}

	const lines = ["## Getting Started", ""];

	if (packageManager === "npm") {
		lines.push("```bash", installNote, "```");
	} else {
		lines.push("```bash", devCmd, "```");
	}

	lines.push("");
	lines.push(`Open [http://localhost:3000](http://localhost:3000) in your browser.`);

	return lines.join("\n");
}

function buildTechStackSection(ctx: ProjectContext): string {
	const allLibs = [
		...ctx.styling,
		...ctx.utilities,
		...ctx.stateForm,
		...ctx.auth,
		...ctx.database,
	];

	const lines = ["## Tech Stack", ""];

	if (allLibs.length === 0) {
		lines.push("No additional libraries selected.");
		return lines.join("\n");
	}

	if (ctx.styling.length > 0) {
		lines.push("### Styling / UI");
		for (const lib of ctx.styling) {
			lines.push(`- ${lib}`);
		}
		lines.push("");
	}

	if (ctx.utilities.length > 0) {
		lines.push("### Utilities");
		for (const lib of ctx.utilities) {
			lines.push(`- ${lib}`);
		}
		lines.push("");
	}

	if (ctx.stateForm.length > 0) {
		lines.push("### State / Form / Backend");
		for (const lib of ctx.stateForm) {
			lines.push(`- ${lib}`);
		}
		lines.push("");
	}

	if (ctx.auth.length > 0) {
		lines.push("### Auth");
		for (const lib of ctx.auth) {
			lines.push(`- ${lib}`);
		}
		lines.push("");
	}

	if (ctx.database.length > 0) {
		lines.push("### Database");
		for (const lib of ctx.database) {
			lines.push(`- ${lib}`);
		}
		lines.push("");
	}

	return lines.join("\n").trimEnd();
}

function buildProjectStructureSection(ctx: ProjectContext): string {
	const lines = ["## Project Structure", ""];

	if (ctx.preset === "recommended") {
		lines.push("```");
		lines.push("src/");
		lines.push("  app/          # Next.js App Router pages");
		lines.push("  components/   # Shared UI components");
		lines.push("  features/     # Feature-scoped modules");
		lines.push("  lib/          # Utility libraries and clients");
		lines.push("  hooks/        # Custom React hooks");
		lines.push("  styles/       # Global styles");
		lines.push("  types/        # TypeScript type definitions");
		lines.push("```");
	} else {
		lines.push("```");
		lines.push("src/");
		lines.push("  app/          # Next.js App Router pages");
		lines.push("```");
	}

	return lines.join("\n");
}

// --- Pure render function ---

export function renderReadme(ctx: ProjectContext): string {
	const sections: string[] = [
		`# ${ctx.projectName}`,
		"",
		`> Created with [QuickStack](https://github.com/quickstack/quickstack) using the \`${ctx.preset}\` preset.`,
		"",
		buildGettingStartedSection(ctx),
		"",
		buildTechStackSection(ctx),
		"",
		buildProjectStructureSection(ctx),
	];

	return sections.join("\n");
}

// --- IO function ---

export async function writeReadme(ctx: ProjectContext, projectDir: string): Promise<void> {
	const content = renderReadme(ctx);
	await writeFile(join(projectDir, "README.md"), content);
}
