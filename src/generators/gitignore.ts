import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const QUICKSTACK_GITIGNORE_ADDITIONS = [".env.local", ".env.*.local"];

export async function appendGitignore(projectDir: string): Promise<void> {
	const gitignorePath = join(projectDir, ".gitignore");

	let existing = "";
	try {
		existing = await readFile(gitignorePath, "utf-8");
	} catch {
		// .gitignore may not exist yet; start fresh
	}

	const toAdd = QUICKSTACK_GITIGNORE_ADDITIONS.filter((entry) => {
		// Check if the entry already exists as a line (exact match or commented)
		const lines = existing.split("\n").map((l) => l.trim());
		return !lines.includes(entry);
	});

	if (toAdd.length === 0) {
		return;
	}

	const addition = `\n# QuickStackTool additions\n${toAdd.join("\n")}\n`;
	await writeFile(gitignorePath, existing + addition);
}
