import ora from "ora";
import pc from "picocolors";

const PREFIX = pc.bold("[quickstack]");

export const logger = {
	info(msg: string): void {
		console.log(`${PREFIX} ${pc.cyan(msg)}`);
	},
	success(msg: string): void {
		console.log(`${PREFIX} ${pc.green(msg)}`);
	},
	warn(msg: string): void {
		console.warn(`${PREFIX} ${pc.yellow(msg)}`);
	},
	error(msg: string): void {
		console.error(`${PREFIX} ${pc.red(msg)}`);
	},
	spinner(msg: string): { stop(text?: string): void; fail(text?: string): void } {
		const spinner = ora({ text: msg, prefixText: PREFIX }).start();
		return {
			stop(text?: string): void {
				spinner.succeed(text);
			},
			fail(text?: string): void {
				spinner.fail(text);
			},
		};
	},
};
