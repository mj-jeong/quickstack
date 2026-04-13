# QuickStack MVP — Technical Design & Stack

> 요구사항 문서 `prompts/0_search.md` 기반 기술 설계
> Status: **Draft v3** | Date: 2026-04-09
> v3 변경: 비평(`docs/2_critic.md`) 반영 — 릴리즈 단순화, Zod 스코프 조정, 파일 조작 전략 구체화, 3-layer 테스트, 아키텍처 확장성 보완

---

## 1. Runtime & Language

| Item | Choice | Rationale |
|------|--------|-----------|
| Runtime | Node.js 24 LTS | 최신 LTS, `node --run` native script runner 지원 |
| Minimum Node | **>=22.0.0** | Node 22 LTS 이상. `import.meta.resolve` 안정화, `--experimental-*` flag 불필요 |
| Language | TypeScript 5.8+ | strict mode, satisfies operator, ESM native |
| Module System | ESM only | `"type": "module"` in package.json |

---

## 2. Package Manager & Monorepo

| Item | Choice | Rationale |
|------|--------|-----------|
| PM | pnpm 10+ | workspace 프로토콜, strict dependency, fast install |
| Repo 구조 | **Single package** | MVP는 단일 패키지. 향후 monorepo 전환 고려하되 현 단계에서는 오버엔지니어링 |

---

## 3. Core Dependencies

### 3.1 CLI Framework

| Package | Role | Version |
|---------|------|---------|
| `commander` | CLI argument/command parsing | ^13 |
| `@inquirer/prompts` | Interactive prompts (select, checkbox, input, confirm) | ^7 |

**설계 근거**: commander는 subcommand, help 자동생성, version flag를 내장. inquirer의 `@inquirer/prompts`는 ESM-first이며 개별 prompt를 tree-shake 가능.

### 3.2 Validation — 스코프 분리

| 영역 | 도구 | 근거 |
|------|------|------|
| CLI 사용자 입력 (프롬프트) | `@inquirer/prompts` 내장 `validate` | 프롬프트 레벨 검증은 inquirer가 더 관용적이며 Zod 불필요 |
| Preset/Integration config 스키마 | `zod` | 구조화된 데이터 계약, parse-don't-validate, 타입 추론 |
| Pipeline context (최종 합산 결과) | `zod` | 파이프라인 진입 전 전체 입력의 정합성 보장 |

> **v3 변경**: CLI 프롬프트 검증에서 Zod를 제거하고 inquirer 내장 validate 사용. Zod는 config 스키마와 pipeline context 검증에만 사용한다.

### 3.3 File System & Templating

| Package | Role | Rationale |
|---------|------|-----------|
| `node:fs/promises` | 파일/디렉토리 생성 | 외부 dep 불필요 |
| `node:child_process` | `create-next-app` / `shadcn init` 실행 | 외부 dep 불필요 |
| `node:path` | 경로 처리 | 외부 dep 불필요 |

> **템플릿 엔진 미사용**: MVP에서 동적 템플릿 렌더링이 필요한 파일은 `README.md`, `DECISIONS.md`, `.env.example` 등 소수. Template literal로 충분하며 별도 엔진(EJS, Handlebars 등)은 도입하지 않는다.
> 단, 콘텐츠 블록은 반드시 별도 데이터 구조(상수/함수)로 분리하여 template literal 안에 인라인하지 않는다.
> **재검토 시점**: preset이 15개 이상이거나 조건부 섹션 간 상호의존이 복잡해질 때.

### 3.4 UX Enhancement

| Package | Role |
|---------|------|
| `picocolors` | 터미널 컬러 출력 (zero-dep, 가볍고 빠름) |
| `ora` | Spinner (create-next-app 실행 대기 등) |

### 3.5 Development Only

| Package | Role |
|---------|------|
| `tsx` | 개발 중 TypeScript 즉시 실행 (빌드 없이 `tsx src/cli/index.ts`) |

> **v3 변경**: 개발 루프에서 tsdown 빌드를 거치지 않고 `tsx`로 즉시 실행. tsdown은 npm publish 전 빌드에만 사용.

---

## 4. Build & Bundle

| Item | Choice | Rationale |
|------|--------|-----------|
| Dev runner | `tsx` | 개발 중 zero-build 즉시 실행 |
| Bundler | `tsdown` | npm publish 전 빌드 전용. esbuild 기반, ESM output, dts 생성 |
| Output format | ESM | `"type": "module"` 유지 |
| Target | `node22` | 최소 지원 버전 기준 |
| Entry | `src/cli/index.ts` | 단일 진입점 |
| Output | `dist/` | `bin` field가 `dist/cli/index.js` 참조 |
| Declaration | `*.d.ts` 생성 | 향후 프로그래매틱 API 확장 대비 |

### 개발 vs 배포 워크플로

```
개발: tsx src/cli/index.ts create my-app   ← 빌드 없이 즉시 실행
배포: pnpm build (tsdown) → npm publish    ← 빌드된 dist/ 배포
```

### tsdown 설정

```ts
// tsdown.config.ts
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli/index.ts"],
  format: "esm",
  target: "node22",
  dts: true,
  clean: true,
  shims: false,
});
```

---

## 5. Quality & Lint

| Item | Choice | Rationale |
|------|--------|-----------|
| Linter + Formatter | Biome | ESLint+Prettier 대체. 단일 도구, 빠름, zero-config에 가까움 |
| Testing | Vitest | ESM native, fast, Jest 호환 API |
| Type Check | `tsc --noEmit` | 빌드와 별도로 타입 정합성 검증 |
| Package Validation | `publint` | npm publish 전 package.json/exports 검증 |

### Biome 설정

```jsonc
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always"
    }
  }
}
```

### Vitest 설정 — Workspace Projects

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        name: "unit",
        test: {
          include: ["tests/unit/**/*.test.ts"],
          globals: true,
          testTimeout: 5_000,
        },
      },
      {
        name: "integration",
        test: {
          include: ["tests/integration/**/*.test.ts"],
          globals: true,
          testTimeout: 30_000,
          fileParallelism: true,
        },
      },
      {
        name: "e2e",
        test: {
          include: ["tests/e2e/**/*.test.ts"],
          globals: true,
          testTimeout: 120_000,
          fileParallelism: false,
          poolOptions: {
            forks: { singleFork: true },
          },
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.d.ts"],
    },
  },
});
```

---

## 6. Release & Publish

### MVP 단계: 수동 릴리즈

| Item | Choice | Rationale |
|------|--------|-----------|
| Versioning | `npm version` (수동) | MVP는 단일 메인테이너. Changesets는 핵심 기능 완성 후 도입 |
| CI/CD | GitHub Actions | lint + typecheck + test 자동화 |
| npm Publish | 수동 `npm publish` | MVP 단계에서 OIDC 파이프라인 구축은 과도 |
| Pre-publish Check | `publint` | exports field, typesVersions 등 검증 |

> **v3 변경**: Changesets + OIDC 자동 릴리즈를 MVP 범위에서 제외. 핵심 스캐폴딩 기능이 안정화된 후(v1.0 이후 또는 다수 컨트리뷰터 합류 시) 도입.

### MVP Release Flow

```bash
# 수동 릴리즈 프로세스
pnpm build
pnpm dlx publint            # package.json 검증
npm version patch            # 버전 bump + git tag
npm publish                  # npm에 배포
git push --follow-tags       # tag push
```

### Post-MVP: 자동화 도입 시점

Changesets + OIDC 도입 기준:
- 다수 컨트리뷰터가 합류하여 CHANGELOG 관리가 필요할 때
- 릴리즈 빈도가 주 1회 이상이 될 때
- npm token 보안 강화가 필요할 때

---

## 7. Project Scaffolding — 내부 구조

요구사항 §20의 권장 구조를 기반으로 하되, 역할을 더 명확히 분리한다.

```
quickstack/
├── src/
│   ├── cli/                    # CLI 진입점 & 커맨드 정의
│   │   ├── index.ts            # bin entry — commander 프로그램 정의
│   │   └── commands/
│   │       └── create.ts       # `quickstack create` 커맨드
│   │
│   ├── prompts/                # Interactive 질문 흐름
│   │   ├── project-name.ts     # 프로젝트 이름 입력
│   │   ├── package-manager.ts  # PM 선택
│   │   ├── preset.ts           # preset 선택
│   │   ├── styling.ts          # Styling/UI 라이브러리 선택
│   │   ├── utilities.ts        # Utilities 라이브러리 선택
│   │   ├── state-form.ts       # State/Form/Backend 선택
│   │   ├── confirm.ts          # 최종 확인
│   │   └── index.ts            # 전체 흐름 오케스트레이션
│   │
│   ├── core/                   # 생성 파이프라인
│   │   ├── pipeline.ts         # 메인 실행 파이프라인
│   │   ├── context.ts          # 프로젝트 생성 컨텍스트 (Zod schema)
│   │   └── errors.ts           # 커스텀 에러 클래스
│   │
│   ├── adapters/               # 프레임워크별 프로젝트 생성
│   │   └── next/
│   │       ├── create.ts       # create-next-app 실행 래퍼
│   │       └── options.ts      # CNA 옵션 매핑
│   │
│   ├── presets/                # Preset 정의
│   │   └── next/
│   │       ├── minimal.ts      # minimal 구조 정의
│   │       ├── recommended.ts  # recommended 구조 정의
│   │       └── types.ts        # Preset 타입 정의
│   │
│   ├── integrations/           # 라이브러리별 설치/설정 처리
│   │   ├── registry.ts         # Integration 레지스트리 (플러그인 등록)
│   │   ├── types.ts            # Integration 인터페이스 정의
│   │   ├── tailwind/
│   │   │   └── index.ts        # Tailwind 설치 + 설정 적용
│   │   ├── shadcn/
│   │   │   └── index.ts        # shadcn 초기화 + 설정
│   │   ├── supabase/
│   │   │   └── index.ts        # Supabase 클라이언트 설정 + .env.example
│   │   ├── framer-motion/
│   │   │   └── index.ts
│   │   ├── zustand/
│   │   │   └── index.ts
│   │   ├── react-hook-form/
│   │   │   └── index.ts
│   │   ├── zod/
│   │   │   └── index.ts
│   │   ├── date-fns/
│   │   │   └── index.ts
│   │   ├── ts-pattern/
│   │   │   └── index.ts
│   │   └── es-toolkit/
│   │       └── index.ts
│   │
│   ├── generators/             # 파일 생성/수정 로직
│   │   ├── structure.ts        # 폴더 구조 생성
│   │   ├── readme.ts           # README.md 생성
│   │   ├── decisions.ts        # DECISIONS.md 생성
│   │   ├── gitignore.ts        # .gitignore 보강
│   │   └── env.ts              # .env.example 생성
│   │
│   ├── utils/                  # 공통 유틸
│   │   ├── exec.ts             # child_process 래퍼 (promisified)
│   │   ├── fs.ts               # 파일시스템 헬퍼 (JSON read/merge/write 포함)
│   │   ├── logger.ts           # picocolors + ora 기반 로거
│   │   └── validate.ts         # 프로젝트명 검증 등
│   │
│   └── types/                  # 공유 타입
│       └── index.ts
│
├── tests/                      # 테스트
│   ├── unit/                   # 단위 테스트 (pure logic, no IO)
│   ├── integration/            # Fixture 기반 통합 테스트 (CNA mocked)
│   ├── e2e/                    # 실제 CNA 실행 E2E 테스트
│   ├── fixtures/               # CNA 출력 스냅샷
│   │   └── cna-output/
│   │       ├── next15-app-tailwind/
│   │       ├── next15-app-no-tailwind/
│   │       └── README.md       # fixture 생성 방법 및 CNA 버전 기록
│   └── __snapshots__/          # 생성 파일 스냅샷
│
├── scripts/
│   └── refresh-fixtures.ts     # CNA fixture 재생성 스크립트
│
├── docs/                       # 프로젝트 문서
├── prompts/                    # 요구사항 문서
│
├── package.json
├── tsconfig.json
├── tsdown.config.ts
├── vitest.config.ts
├── biome.json
└── .github/
    └── workflows/
        ├── ci.yml              # lint + typecheck + unit/integration test
        └── fixture-refresh.yml # 격주 CNA fixture 최신화 체크
```

---

## 8. 핵심 아키텍처 설계

### 8.1 실행 파이프라인

```
CLI Entry (commander)
  └─ create command (--dry-run 지원)
       └─ Prompt Flow (@inquirer/prompts)
            └─ Context 생성 (Zod validated)
                 └─ Pipeline 실행 (projectDir 주입 가능)
                      ├─ 1. Adapter: create-next-app 실행 (dryRun 시 skip)
                      ├─ 2. Preset: 폴더 구조 적용
                      ├─ 3. Integrations: 위상 정렬 순서로 설치/설정
                      ├─ 4. Generators: README, DECISIONS 등 생성
                      └─ 5. Post-process: 최종 정리 & 안내 메시지
```

> **v3 변경**: pipeline이 `projectDir`을 외부에서 주입받을 수 있도록 설계. Fixture 기반 테스트에서 CNA 없이 파이프라인 테스트 가능.

```ts
// core/pipeline.ts
// ARCHITECTURE NOTE: 프레임워크별 로직은 adapters/에 위임.
// 두 번째 프레임워크 추가 시 adapters/next/ 패턴에서 FrameworkAdapter 인터페이스를 추출.
export async function runPipeline(ctx: ProjectContext, projectDir?: string): Promise<void> {
  const dir = projectDir ?? join(process.cwd(), ctx.projectName);
  if (!projectDir) {
    await createNextApp(ctx);
  }
  await applyPreset(ctx, dir);
  await runIntegrations(ctx, dir);  // 위상 정렬 기반 실행
  await generateDocs(ctx, dir);
  await postProcess(ctx, dir);
}
```

### 8.2 Context Schema (Zod)

```ts
import { z } from "zod";

export const Framework = z.enum(["nextjs"]);
export const PackageManager = z.enum(["npm", "pnpm", "yarn"]);
export const Preset = z.enum(["minimal", "recommended"]);

export const StylingLib = z.enum(["tailwind", "shadcn", "lucide-react", "framer-motion"]);
export const UtilityLib = z.enum(["zod", "date-fns", "ts-pattern", "es-toolkit"]);
export const StateFormLib = z.enum(["zustand", "react-hook-form"]);
export const AuthLib = z.enum(["next-auth"]);
export const DatabaseLib = z.enum(["prisma", "drizzle", "supabase"]);

export const ProjectContext = z.object({
  projectName: z.string().min(1).regex(/^[a-z0-9-]+$/),
  framework: Framework,
  packageManager: PackageManager,
  preset: Preset,
  styling: z.array(StylingLib),
  utilities: z.array(UtilityLib),
  stateForm: z.array(StateFormLib),
  auth: z.array(AuthLib),
  database: z.array(DatabaseLib),
  dryRun: z.boolean().default(false),
});

export type ProjectContext = z.infer<typeof ProjectContext>;
```

> **v3 변경**: `framework` 필드 추가 (향후 Vue/Flutter 확장 시 switch 포인트), `dryRun` 플래그 추가.

### 8.3 Integration Interface

```ts
export interface Integration {
  /** 고유 식별자 */
  id: string;
  /** 사용자에게 보여지는 이름 */
  name: string;
  /** 소속 그룹 */
  group: "styling" | "utilities" | "stateForm" | "auth" | "database";
  /** 필수 의존 integration (예: shadcn → tailwind) */
  requires?: string[];
  /** 이 integration이 수정하는 파일 목록 (충돌 감지 및 실행 순서 문서화) */
  modifies?: string[];
  /** 설치할 npm 패키지 목록 */
  packages: string[];
  /** devDependency로 설치할 패키지 */
  devPackages?: string[];
  /** 설치 후 최소 설정 적용 */
  setup(ctx: ProjectContext, projectDir: string): Promise<void>;
}
```

> **v3 변경**: `modifies` 필드 추가 — 각 integration이 수정하는 파일을 선언적으로 명시. 충돌 감지 및 실행 순서 결정에 활용.

**설계 원칙**:
- 설치만으로 충분한 라이브러리(zod, date-fns 등)는 `setup()`이 no-op
- 설정이 필요한 라이브러리(tailwind, shadcn, supabase)는 `setup()`에서 파일 생성/수정
- `requires`로 의존 관계를 선언적으로 관리 (shadcn → tailwind 자동 포함)
- Integration 실행은 `requires` 기반 **위상 정렬(topological sort)** 순서로 진행
- `requires` 관계가 없는 두 integration이 동일 파일을 `modifies`에 선언하면 경고 로그 출력

### 8.4 Preset Structure Definition

```ts
export interface PresetDefinition {
  id: string;
  name: string;
  description: string;
  /** create-next-app에 전달할 옵션 */
  cnaOptions: {
    srcDir: boolean;
    tailwind: boolean;
    eslint: boolean;
    app: boolean;
    turbopack: boolean;
    importAlias: string;
  };
  /** preset이 생성하는 추가 디렉토리 */
  directories: string[];
}
```

**minimal preset**:
```ts
{
  id: "minimal",
  directories: [] // CNA 기본 구조 유지
}
```

**recommended preset**:
```ts
{
  id: "recommended",
  directories: [
    "src/components",
    "src/features",
    "src/lib",
    "src/hooks",
    "src/styles",
    "src/types",
  ]
}
```

### 8.5 --dry-run 모드

`--dry-run` 플래그가 활성화되면 파이프라인은 실행 대신 계획을 수집하여 출력한다.

```ts
interface PipelineAction {
  step: string;
  description: string;
  files?: string[];     // 생성/수정될 파일 목록
  commands?: string[];  // 실행될 쉘 커맨드 목록
}

// dryRun 시 각 단계가 PipelineAction을 반환, 최종적으로 리스트 출력
```

> **v3 추가**: 사용자 미리보기 + 디버깅 + 테스트 용이성을 위해 MVP에 포함. 구현 비용 낮고 가치 높음.

---

## 9. 파일 조작 전략

### 9.1 원칙: Generator, Not Modifier

QuickStack은 MVP 단계에서 **생성기(generator)** 이다. 수정기(modifier)가 아니다.
모든 대상 파일은 방금 CNA가 생성한 것이므로 내용을 알고 있다. 따라서:

- AST 조작 라이브러리(ts-morph, jscodeshift 등)는 **MVP에서 도입하지 않는다**
- 기존 파일 수정이 필요한 경우 **전체 파일 교체(full-file generation)** 방식 사용
- CNA 출력이 예측 가능하므로 안전함

> **AST 도입 시점**: `quickstack add <lib>` 같은 기존 프로젝트 수정 커맨드가 추가될 때. 사용자가 이미 편집한 파일을 수정해야 하므로 그때 ts-morph 등 검토.

### 9.2 파일 유형별 조작 방식

| 파일 유형 | 조작 방식 | 예시 |
|-----------|----------|------|
| JSON 설정 | **객체 단위 parse → merge → write** | `tsconfig.json`, `package.json` |
| TS 설정 | **전체 파일 생성 (template)** | `tailwind.config.ts`, `next.config.ts` |
| TSX 컴포넌트 | **전체 파일 생성 (template)** | `layout.tsx` (provider 래핑 등) |
| Markdown | **template literal + 섹션 블록 합성** | `README.md`, `DECISIONS.md` |
| 플랫 텍스트 | **문자열 연결** | `.env.example`, `.gitignore` 추가분 |

### 9.3 JSON 설정 파일 유틸리티

```ts
// utils/fs.ts
export async function patchJsonFile(
  filepath: string,
  patches: Record<string, unknown>,
): Promise<void> {
  const content = JSON.parse(await fs.readFile(filepath, "utf-8"));
  deepMerge(content, patches);
  await fs.writeFile(filepath, JSON.stringify(content, null, 2) + "\n");
}
```

### 9.4 Generator 함수 분리 패턴

각 generator는 **순수 렌더링 함수**와 **IO 함수**를 분리한다. 순수 함수는 테스트 가능.

```ts
// generators/readme.ts
export function renderReadme(ctx: ProjectContext): string { /* pure */ }
export async function writeReadme(ctx: ProjectContext, dir: string): Promise<void> {
  await fs.writeFile(join(dir, "README.md"), renderReadme(ctx));
}
```

---

## 10. 의존 관계 & 제약 처리

### 자동 의존 해결

| 선택 | 자동 포함 | 처리 방식 |
|------|-----------|-----------|
| shadcn/ui | Tailwind CSS | registry에서 `requires: ["tailwind"]` 선언 → prompt 단계에서 자동 체크 |
| shadcn/ui | lucide-react | shadcn/ui 컴포넌트가 lucide-react 아이콘 기본 사용 → 자동 포함 |
| prisma | ⊕ drizzle | 상호 배타 — 동일 역할(ORM). 동시 선택 시 재프롬프트 |

### Integration 실행 순서

```
1. requires 기반 위상 정렬(topological sort)
2. tailwind → shadcn 순서 자동 보장
3. requires 없이 동일 파일 수정 시 경고 로그
```

### CLI UX 처리

```
사용자가 shadcn 선택 → Tailwind가 미선택 상태라면 자동 포함 + 알림 메시지
"ℹ shadcn/ui requires Tailwind CSS — automatically included."
```

---

## 11. create-next-app 실행 전략

QuickStack이 CNA 옵션을 직접 결정하여 child process로 전달한다.
이후 생성된 프로젝트 디렉토리에 대해 후처리(preset 적용, integration 설정, 문서 생성)를 수행한다.

```ts
// adapters/next/create.ts
export async function createNextApp(ctx: ProjectContext): Promise<void> {
  const args = [
    ctx.projectName,
    "--ts",
    "--src-dir",
    "--app",
    "--import-alias", "@/*",
    `--use-${ctx.packageManager}`,
  ];

  // Tailwind — CNA 옵션으로 직접 전달
  if (ctx.styling.includes("tailwind") || ctx.styling.includes("shadcn")) {
    args.push("--tailwind");
  } else {
    args.push("--no-tailwind");
  }

  // ESLint — CNA 기본값 존중 (§7.1 공식 흐름 존중)
  args.push("--eslint");

  await exec("npx", ["create-next-app@latest", ...args]);
}
```

### shadcn/ui 초기화 전략

shadcn은 child process로 `shadcn@latest init`을 실행한다.
QuickStack이 템플릿을 직접 복제/관리하지 않는다 — shadcn의 버전 업데이트를 자동 반영하기 위함.

```ts
// integrations/shadcn/index.ts
async setup(ctx: ProjectContext, projectDir: string): Promise<void> {
  await exec("npx", ["shadcn@latest", "init", "--defaults"], { cwd: projectDir });
}
```

> **참고**: CNA가 `--eslint` 옵션으로 생성하는 ESLint 설정은 사용자 프로젝트에 유지한다. QuickStack CLI 자체 개발에만 Biome를 사용하며, 이 두 가지는 혼동하지 않는다.

---

## 12. 테스트 전략 — 3-Layer Architecture

### 12.1 개요

| Layer | Scope | CNA | 속도 | CI 실행 |
|-------|-------|-----|------|---------|
| **Unit** | 순수 로직 (validate, render, schema, option mapping) | 없음 | ~3s | 모든 PR |
| **Integration** | 파이프라인 전체 (fixture 기반, CNA mocked) | Fixture | ~10s | 모든 PR |
| **E2E** | 실제 CNA 실행 + 전체 파이프라인 | 실행 | ~3-5min | main merge only |

### 12.2 Unit Tests

순수 함수 테스트. 파일시스템/네트워크 접근 없음.

| 모듈 | 테스트 대상 |
|------|-----------|
| `context.ts` | Zod 스키마 파싱 — 유효/무효 입력, auth·database 필드 파싱 |
| `validate.ts` | 프로젝트명 regex, 엣지 케이스 |
| `options.ts` | CNA argument 조합 생성 |
| `registry.ts` | 의존성 해결, 위상 정렬, 순환 감지 |
| `resolve-deps.ts` | shadcn→tailwind 자동 포함, shadcn→lucide-react 자동 포함, 중복 제거 |
| `readme.ts` | `renderReadme()` 순수 함수 출력 |
| `decisions.ts` | `renderDecisions()` 순수 함수 출력 |

### 12.3 Integration Tests — Fixture 기반

CNA 실행을 mock하고, CNA 출력 fixture를 tmpdir에 복사한 뒤 파이프라인을 실행.

```ts
vi.mock("../../src/adapters/next/create.ts", () => ({
  createNextApp: vi.fn(async () => {}),
}));

const FIXTURE = "tests/fixtures/cna-output/next15-app-tailwind";

it("creates preset directories", async () => {
  const dir = mkdtempSync(join(tmpdir(), "qs-test-"));
  cpSync(FIXTURE, dir, { recursive: true });

  await runPipeline({ /* context */ }, dir);

  expect(existsSync(join(dir, "src/components"))).toBe(true);
});
```

### 12.4 E2E Tests

실제 CNA 실행. main merge 후에만 CI에서 실행.

```ts
it("creates a working project", async () => {
  const dir = mkdtempSync(join(tmpdir(), "qs-e2e-"));
  await runPipeline({ projectName: "test-app", /* ... */ });
  expect(existsSync(join(dir, "test-app/package.json"))).toBe(true);
}, 120_000);
```

### 12.5 Fixture 관리

```
tests/fixtures/cna-output/
  next15-app-tailwind/       # CNA --app --src-dir --tailwind --ts
  next15-app-no-tailwind/    # CNA --app --src-dir --no-tailwind --ts
  README.md                  # CNA 버전, 생성일, 재생성 방법
```

- `scripts/refresh-fixtures.ts`로 실제 CNA 실행 후 `node_modules`, `.git` 제거하여 fixture 갱신
- 격주 CI job(`fixture-refresh.yml`)이 fixture 변경 감지 시 자동 PR 생성

### 12.6 Vitest 활용 기법

- `toMatchFileSnapshot()` — 생성 파일 스냅샷 비교 (인라인 스냅샷 대신 파일 스냅샷)
- `it.each()` — preset/integration 조합별 파라미터화 테스트
- `vi.spyOn(execModule, "exec")` — child process 호출 검증 (shadcn init 등)
- `onTestFinished()` — tmpdir 자동 정리

---

## 13. CI/CD Workflows

### ci.yml (PR & Push)

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    name: Lint + Type + Unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check             # biome
      - run: pnpm typecheck          # tsc --noEmit
      - run: pnpm test:unit          # unit tests only (~3s)

  integration:
    name: Integration (Fixture)
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:integration   # fixture-based (~10s)

  e2e:
    name: E2E (Real CNA)
    if: github.ref == 'refs/heads/main'
    needs: integration
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:e2e
```

### fixture-refresh.yml (격주 Fixture 갱신 체크)

```yaml
name: Check Fixture Freshness
on:
  schedule:
    - cron: "0 6 1,15 * *"
  workflow_dispatch:

jobs:
  check-fixtures:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsx scripts/refresh-fixtures.ts
      - name: Check for changes
        run: |
          if [ -n "$(git diff --name-only tests/fixtures/)" ]; then
            echo "FIXTURES_CHANGED=true" >> $GITHUB_ENV
          fi
      - name: Create PR if fixtures changed
        if: env.FIXTURES_CHANGED == 'true'
        uses: peter-evans/create-pull-request@v6
        with:
          title: "chore: refresh CNA fixture snapshots"
          body: "CNA output has changed. Review fixture diffs."
          branch: chore/refresh-fixtures
```

---

## 14. package.json 예상 구조

```jsonc
{
  "name": "create-qstack",
  "version": "0.1.0",
  "description": "Next.js project setup CLI with preset-based scaffolding and library integration",
  "type": "module",
  "bin": {
    "quickstack": "./dist/cli/index.js"
  },
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/cli/index.js"
    }
  },
  "files": ["dist"],
  "engines": {
    "node": ">=22.0.0"
  },
  "scripts": {
    "dev": "tsx src/cli/index.ts",
    "build": "tsdown",
    "check": "biome check .",
    "check:fix": "biome check --fix .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:integration": "vitest run --project integration",
    "test:e2e": "vitest run --project e2e",
    "test:watch": "vitest --project unit",
    "test:coverage": "vitest run --project unit --project integration --coverage",
    "prepublishOnly": "pnpm build && pnpm dlx publint",
    "fixtures:refresh": "tsx scripts/refresh-fixtures.ts"
  },
  "dependencies": {
    "commander": "^13.0.0",
    "@inquirer/prompts": "^7.0.0",
    "zod": "^3.24.0",
    "picocolors": "^1.1.0",
    "ora": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "tsx": "^4.19.0",
    "tsdown": "^0.6.0",
    "@biomejs/biome": "^2.0.0",
    "vitest": "^3.1.0",
    "@vitest/coverage-v8": "^3.1.0",
    "publint": "^0.3.0"
  }
}
```

---

## 15. 결정 완료 사항

| # | 항목 | 결정 |
|---|------|------|
| 1 | Node.js 최소 지원 버전 | **>=22.0.0** (권장 24 LTS) |
| 2 | CNA의 ESLint 설정 | **유지** — 사용자 프로젝트는 CNA ESLint 존중, QuickStack 자체만 Biome |
| 3 | shadcn init 방식 | **child process** (`npx shadcn@latest init --defaults`) |
| 4 | npm 패키지 이름 | **`create-qstack`** (fallback: `quickstack-cli`) |
| 5 | 바이너리 이름 | **`quickstack`** (`"bin": { "quickstack": ... }`) |
| 6 | 릴리즈 전략 | **MVP: 수동** (`npm version` + `npm publish`), post-MVP: Changesets + OIDC |
| 7 | Zod 스코프 | 프롬프트 검증: inquirer 내장, config/context 검증: Zod |
| 8 | 개발 루프 | `tsx`로 즉시 실행, `tsdown`은 publish 전 빌드만 |
| 9 | 파일 조작 | JSON: parse/merge/write, TS/TSX: 전체 파일 생성, AST: MVP 제외 |
| 10 | 테스트 | 3-layer (unit/fixture-integration/e2e), Vitest workspace projects |
| 11 | --dry-run | MVP에 포함 — context에 `dryRun` 플래그 |
| 12 | framework 필드 | context에 `framework: z.enum(["nextjs"])` 추가 (확장 대비) |

### npm Publish 전략

- npm 패키지명: `create-qstack` (unscoped)
- `npm create qstack` 관례 활용 (`create-next-app`, `create-vite`와 동일)
- 코드 내 바이너리명은 `quickstack`으로 유지한다.

```bash
npm create qstack        # npm
pnpm create qstack       # pnpm
yarn create qstack       # yarn
```

### 아키텍처 제약 사항 (의도적 결정)

| 제약 | 근거 | 해소 시점 |
|------|------|-----------|
| AST 조작 미지원 | MVP는 generator — CNA 출력이 예측 가능하므로 전체 파일 교체로 충분 | `quickstack add` 커맨드 도입 시 ts-morph 검토 |
| Framework 추상화 없음 | 구현체 1개(Next.js)에 대한 추상 인터페이스는 premature | 두 번째 프레임워크 추가 시 adapters/next 패턴에서 인터페이스 추출 |
| 템플릿 엔진 미사용 | preset 수 소량(2개), 조건부 섹션 간 상호의존 없음 | preset 15개 이상 또는 복잡한 조건부 렌더링 필요 시 |

### 미결 사항 (TBD)

| # | 항목 | 의존 사항 |
|---|------|-----------|
| 1 | `--yes` / non-interactive 모드 내부 구조 | MVP 제외이지만 확장성 고려 수준 결정 |

---

## 16. 기술 스택 요약

```
┌──────────────────────────────────────────────────┐
│  QuickStack MVP — Tech Stack (v3)                │
├──────────────┬───────────────────────────────────┤
│ Package      │ create-qstack (bin: quickstack)  │
│ Runtime      │ Node.js 24 LTS (min >=22.0.0)     │
│ Language     │ TypeScript 5.8+, ESM only          │
│ PM           │ pnpm 10+                           │
├──────────────┼───────────────────────────────────┤
│ CLI          │ commander + @inquirer/prompts      │
│ Validation   │ zod (config/context only)          │
│ UX           │ picocolors + ora                   │
├──────────────┼───────────────────────────────────┤
│ Dev          │ tsx (zero-build dev loop)           │
│ Build        │ tsdown (publish only)              │
│ Lint/Format  │ Biome 2                            │
│ Test         │ Vitest 3 (workspace projects)      │
│ Type Check   │ tsc --noEmit                       │
├──────────────┼───────────────────────────────────┤
│ Release MVP  │ npm version + npm publish (수동)    │
│ Release v1+  │ Changesets + GitHub Actions + OIDC  │
│ Validation   │ publint                            │
└──────────────┴───────────────────────────────────┘
```
