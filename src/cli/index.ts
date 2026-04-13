#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { registerCreateCommand } from "./commands/create.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8")) as {
	version: string;
};

const program = new Command();

program
	.name("quickstack")
	.description("Next.js project setup CLI with preset-based scaffolding and library integration")
	.version(pkg.version);

registerCreateCommand(program);

// `npm create qstack` 관례: 인자 없이 실행 시 create를 기본 동작으로
if (process.argv.length <= 2) {
	process.argv.push("create");
}

program.parse();
