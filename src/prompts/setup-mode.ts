import { select } from "@inquirer/prompts";

export async function promptSetupMode(): Promise<"new-directory" | "current-directory"> {
	return select<"new-directory" | "current-directory">({
		message: "Where to set up?",
		choices: [
			{
				name: "Create new directory   — 프로젝트명으로 새 폴더를 생성합니다",
				value: "new-directory",
			},
			{
				name: "Use current directory  — 현재 디렉토리에 직접 세팅합니다",
				value: "current-directory",
			},
		],
	});
}
