import { confirm } from "@inquirer/prompts";
import pc from "picocolors";
import type { ProjectContext } from "../core/context.js";

function buildSummaryLines(ctx: Partial<ProjectContext>): string[] {
	const lines: string[] = [];

	lines.push("");
	lines.push(pc.bold("Project summary:"));
	lines.push(`  Project name    : ${pc.cyan(ctx.projectName ?? "(not set)")}`);
	lines.push(`  Package manager : ${pc.cyan(ctx.packageManager ?? "(not set)")}`);
	lines.push(`  Preset          : ${pc.cyan(ctx.preset ?? "(not set)")}`);

	const styling = ctx.styling ?? [];
	const shadcnSelected = styling.includes("shadcn");
	const stylingDisplay =
		styling.length === 0
			? pc.dim("(none)")
			: styling
					.map((lib) => {
						if (lib === "tailwind" && shadcnSelected) {
							return `${pc.green(lib)} ${pc.dim("(auto-included)")}`;
						}
						return pc.green(lib);
					})
					.join(", ");
	lines.push(`  Styling / UI    : ${stylingDisplay}`);

	const utilities = ctx.utilities ?? [];
	lines.push(
		`  Utilities       : ${utilities.length === 0 ? pc.dim("(none)") : utilities.map((l) => pc.green(l)).join(", ")}`,
	);

	const stateForm = ctx.stateForm ?? [];
	lines.push(
		`  State / Form    : ${stateForm.length === 0 ? pc.dim("(none)") : stateForm.map((l) => pc.green(l)).join(", ")}`,
	);

	const auth = ctx.auth ?? [];
	lines.push(
		`  Auth            : ${auth.length === 0 ? pc.dim("(none)") : auth.map((l) => pc.green(l)).join(", ")}`,
	);

	const database = ctx.database ?? [];
	lines.push(
		`  Database        : ${database.length === 0 ? pc.dim("(none)") : database.map((l) => pc.green(l)).join(", ")}`,
	);

	lines.push("");

	return lines;
}

export async function promptConfirm(ctx: Partial<ProjectContext>): Promise<boolean> {
	for (const line of buildSummaryLines(ctx)) {
		console.log(line);
	}

	return confirm({ message: "Proceed with these settings?" });
}
