import { select } from "@inquirer/prompts";

export async function promptPreset(): Promise<"minimal" | "recommended"> {
	return select<"minimal" | "recommended">({
		message: "Preset:",
		default: "recommended",
		choices: [
			{
				name: "minimal       — CNA 기본 구조 유지, 최소한의 추가만 포함",
				value: "minimal",
			},
			{
				name: "recommended   — 실무 디렉토리 구조 (components, features, lib, hooks, styles, types)",
				value: "recommended",
			},
		],
	});
}
