import { spawn } from "node:child_process";
import { PipelineError } from "../core/errors.js";

export interface ExecResult {
	stdout: string;
	stderr: string;
	exitCode: number;
}

export async function exec(
	command: string,
	args: string[],
	options?: { cwd?: string; env?: Record<string, string> },
): Promise<ExecResult> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: options?.cwd,
			env: options?.env ? { ...process.env, ...options.env } : process.env,
			stdio: ["inherit", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk: Buffer) => {
			stdout += chunk.toString();
		});

		child.stderr.on("data", (chunk: Buffer) => {
			stderr += chunk.toString();
		});

		child.on("error", (err) => {
			reject(new PipelineError(`Failed to spawn command: ${command}`, { cause: err }));
		});

		child.on("close", (code) => {
			const exitCode = code ?? 1;
			if (exitCode !== 0) {
				reject(
					new PipelineError(
						`Command failed with exit code ${exitCode}: ${command} ${args.join(" ")}`,
						{ cause: { stdout, stderr, exitCode } },
					),
				);
			} else {
				resolve({ stdout, stderr, exitCode });
			}
		});
	});
}
