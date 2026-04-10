import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
	for (const key of Object.keys(source)) {
		const sourceVal = source[key];
		const targetVal = target[key];
		if (
			sourceVal !== null &&
			typeof sourceVal === "object" &&
			!Array.isArray(sourceVal) &&
			targetVal !== null &&
			typeof targetVal === "object" &&
			!Array.isArray(targetVal)
		) {
			deepMerge(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>);
		} else {
			target[key] = sourceVal;
		}
	}
}

export async function patchJsonFile(
	filepath: string,
	patches: Record<string, unknown>,
): Promise<void> {
	const content = JSON.parse(await readFile(filepath, "utf-8")) as Record<string, unknown>;
	deepMerge(content, patches);
	await writeFile(filepath, `${JSON.stringify(content, null, 2)}\n`);
}

export async function ensureDir(dirPath: string): Promise<void> {
	await mkdir(dirPath, { recursive: true });
}

export async function writeFileSafe(filePath: string, content: string): Promise<void> {
	await mkdir(dirname(filePath), { recursive: true });
	await writeFile(filePath, content);
}
