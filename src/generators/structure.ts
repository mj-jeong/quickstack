import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ProjectContext } from "../core/context.js";
import { minimalPreset } from "../presets/next/minimal.js";
import { recommendedPreset } from "../presets/next/recommended.js";
import { ensureDir } from "../utils/fs.js";
import { logger } from "../utils/logger.js";

export async function applyStructure(ctx: ProjectContext, projectDir: string): Promise<void> {
	const preset = ctx.preset === "minimal" ? minimalPreset : recommendedPreset;

	if (preset.directories.length === 0) {
		return;
	}

	const created: string[] = [];

	for (const dir of preset.directories) {
		const fullPath = join(projectDir, dir);
		await ensureDir(fullPath);
		await writeFile(join(fullPath, ".gitkeep"), "");
		created.push(dir);
	}

	logger.info(`Created directories: ${created.join(", ")}`);
}
