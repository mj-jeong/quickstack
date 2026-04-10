#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8")) as {
	version: string;
};

const program = new Command();

program
	.name("quickstack")
	.description("Next.js project setup CLI with preset-based scaffolding and library integration")
	.version(pkg.version);

// `create` subcommand is implemented in Phase 3.

program.parse();
